import Booking from '../models/Booking.js';
import Event from '../models/Event.js';

const generateBookingReference = () => `BKG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const normalizeQuantity = (value) => Number.parseInt(value, 10);
const populateBooking = (query) => query.populate('user', 'name email role').populate('event', 'title slug category startDate endDate venue city price status organizerName imageData').lean();

const createPaymentBooking = async ({ eventId, quantity, userId, paymentProvider, paymentStatus, bookingStatus, paymentId }) => {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, status: 'published', availableTickets: { $gte: quantity } },
    { $inc: { availableTickets: -quantity } },
    { new: true }
  );
  if (!event) return null;
  if (event.availableTickets === 0) { event.status = 'sold_out'; await event.save(); }
  const booking = await Booking.create({
    bookingReference: generateBookingReference(), user: userId, event: event._id,
    eventTitle: event.title, eventSlug: event.slug, eventStartDate: event.startDate,
    venue: event.venue, city: event.city, quantity, unitPrice: event.price, totalAmount: event.price * quantity,
    paymentProvider, paymentStatus, bookingStatus, paymentId
  });
  return populateBooking(Booking.findById(booking._id));
};

const validateRequest = async (req, res, next) => {
  const eventId = req.body.eventId;
  const quantity = normalizeQuantity(req.body.quantity);
  if (!eventId || !Number.isInteger(quantity) || quantity < 1) {
    res.status(400); next(new Error('A valid event and ticket quantity are required.')); return null;
  }
  const event = await Event.findOne({ _id: eventId, status: 'published' });
  if (!event || event.price <= 0 || event.availableTickets < quantity) {
    res.status(400); next(new Error('This paid event is no longer available for booking.')); return null;
  }
  return { eventId, quantity };
};

export const createDemoPayment = async (req, res, next) => {
  try {
    const request = await validateRequest(req, res, next);
    if (!request) return;
    const booking = await createPaymentBooking({ ...request, userId: req.user._id, paymentProvider: 'demo', paymentStatus: 'paid', bookingStatus: 'confirmed', paymentId: `demo_${Date.now()}` });
    if (!booking) { res.status(400); next(new Error('Tickets are no longer available for this event.')); return; }
    res.status(201).json({ success: true, message: 'Demo payment approved and booking confirmed.', booking });
  } catch (error) { next(error); }
};

export const submitUpiPayment = async (req, res, next) => {
  try {
    const request = await validateRequest(req, res, next);
    if (!request) return;
    const paymentId = String(req.body.paymentId || '').trim();
    if (paymentId.length < 6 || paymentId.length > 100) {
      res.status(400); next(new Error('Enter the UPI transaction/reference ID after completing the transfer.')); return;
    }
    const booking = await createPaymentBooking({ ...request, userId: req.user._id, paymentProvider: 'upi_manual', paymentStatus: 'pending', bookingStatus: 'pending_payment', paymentId });
    if (!booking) { res.status(400); next(new Error('Tickets are no longer available for this event.')); return; }
    res.status(201).json({ success: true, message: 'UPI transfer submitted for review.', booking });
  } catch (error) { next(error); }
};

export const confirmUpiPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) { res.status(404); next(new Error('Booking not found.')); return; }
    if (booking.bookingStatus !== 'pending_payment' || booking.paymentProvider !== 'upi_manual') {
      res.status(400); next(new Error('This booking is not awaiting a UPI payment review.')); return;
    }
    booking.bookingStatus = 'confirmed'; booking.paymentStatus = 'paid'; await booking.save();
    res.status(200).json({ success: true, message: 'UPI payment confirmed and ticket activated.', booking: await populateBooking(Booking.findById(booking._id)) });
  } catch (error) { next(error); }
};