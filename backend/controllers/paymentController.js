import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import PaymentOrder from '../models/PaymentOrder.js';

const CURRENCY = 'INR';
const generateBookingReference = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BKG-${datePart}-${randomPart}`;
};
const normalizeQuantity = (value) => Number.parseInt(value, 10);
const getPaymentConfig = () => ({ keyId: process.env.RAZORPAY_KEY_ID, keySecret: process.env.RAZORPAY_KEY_SECRET });

const requirePaymentConfig = (res, next) => {
  const config = getPaymentConfig();
  if (!config.keyId || !config.keySecret) {
    res.status(503);
    next(new Error('Online payments are not configured yet. Please contact Eventify support.'));
    return null;
  }
  return config;
};

const bookingResponse = (query) => query
  .populate('user', 'name email role')
  .populate('event', 'title slug category startDate endDate venue city price status organizerName imageData')
  .lean();

const createPaidBooking = async ({ eventId, quantity, userId, paymentId, orderId }) => {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, status: 'published', availableTickets: { $gte: quantity } },
    { $inc: { availableTickets: -quantity } },
    { new: true }
  );
  if (!event) return null;
  if (event.availableTickets === 0) {
    event.status = 'sold_out';
    await event.save();
  }
  const booking = await Booking.create({
    bookingReference: generateBookingReference(), user: userId, event: event._id,
    eventTitle: event.title, eventSlug: event.slug, eventStartDate: event.startDate,
    venue: event.venue, city: event.city, quantity, unitPrice: event.price,
    totalAmount: event.price * quantity, paymentStatus: 'paid', paymentProvider: 'razorpay',
    paymentId, paymentOrderId: orderId
  });
  return bookingResponse(Booking.findById(booking._id));
};

export const createPaymentOrder = async (req, res, next) => {
  try {
    const config = requirePaymentConfig(res, next);
    if (!config) return;
    const quantity = normalizeQuantity(req.body.quantity);
    const eventId = req.body.eventId;
    if (!eventId || !Number.isInteger(quantity) || quantity < 1) {
      res.status(400); next(new Error('A valid event and ticket quantity are required.')); return;
    }
    const event = await Event.findOne({ _id: eventId, status: 'published' });
    if (!event || event.availableTickets < quantity) {
      res.status(400); next(new Error('Tickets are no longer available for this event.')); return;
    }
    if (event.price <= 0) {
      res.status(400); next(new Error('Free events do not require a payment.')); return;
    }
    const credentials = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
    const gatewayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(event.price * quantity * 100), currency: CURRENCY,
        receipt: `evt_${event._id.toString().slice(-8)}_${Date.now()}`,
        notes: { eventId: event._id.toString(), userId: req.user._id.toString(), quantity: String(quantity) }
      })
    });
    const order = await gatewayResponse.json();
    if (!gatewayResponse.ok) throw new Error(order?.error?.description || 'Unable to create the payment order.');
    res.status(201).json({ success: true, order: { id: order.id, amount: order.amount, currency: order.currency, keyId: config.keyId, eventTitle: event.title, quantity } });
  } catch (error) { next(error); }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const config = requirePaymentConfig(res, next);
    if (!config) return;
    const { eventId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    const quantity = normalizeQuantity(req.body.quantity);
    if (!eventId || !orderId || !paymentId || !signature || !Number.isInteger(quantity) || quantity < 1) {
      res.status(400); next(new Error('The payment response is incomplete. Please try again.')); return;
    }
    const expectedSignature = crypto.createHmac('sha256', config.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
      res.status(400); next(new Error('We could not verify this payment. No booking was created.')); return;
    }
    const existingBooking = await Booking.findOne({ paymentId }).lean();
    if (existingBooking) {
      const booking = await bookingResponse(Booking.findById(existingBooking._id));
      res.status(200).json({ success: true, message: 'Payment was already verified.', booking }); return;
    }
    const paymentOrder = await PaymentOrder.findOneAndUpdate(
      { razorpayOrderId: orderId, user: req.user._id, event: eventId, quantity, status: 'created' },
      { $set: { status: 'verifying' } },
      { new: true }
    );
    if (!paymentOrder) {
      res.status(400); next(new Error('This payment order is invalid, already being processed, or belongs to another booking.')); return;
    }
    const event = await Event.findById(eventId).select('price');
    if (!event || Math.round(event.price * quantity * 100) !== paymentOrder.amount) {
      paymentOrder.status = 'created'; await paymentOrder.save();
      res.status(400); next(new Error('The ticket price changed before payment verification. Please create a new payment order.')); return;
    }
    const booking = await createPaidBooking({ eventId, quantity, userId: req.user._id, paymentId, orderId });
    if (!booking) {
      res.status(409); next(new Error('Payment was verified, but the remaining tickets were just claimed. Please contact Eventify support for assistance.')); return;
    }
    paymentOrder.status = 'verified';
    await paymentOrder.save();
    res.status(201).json({ success: true, message: 'Payment verified and booking confirmed.', booking });
  } catch (error) { next(error); }
};