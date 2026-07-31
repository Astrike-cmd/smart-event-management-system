import Booking from '../models/Booking.js';
import Event from '../models/Event.js';

const generateBookingReference = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BKG-${datePart}-${randomPart}`;
};

const buildBookingPayload = (event, userId, quantity) => ({
  bookingReference: generateBookingReference(),
  user: userId,
  event: event._id,
  eventTitle: event.title,
  eventSlug: event.slug,
  eventStartDate: event.startDate,
  venue: event.venue,
  city: event.city,
  quantity,
  unitPrice: event.price,
  totalAmount: event.price * quantity
});

const normalizeQuantity = (value) => Number.parseInt(value, 10);

export const createBooking = async (req, res, next) => {
  try {
    const quantity = normalizeQuantity(req.body.quantity);
    const eventId = req.body.eventId;

    if (!eventId) {
      res.status(400);
      next(new Error('Event ID is required to create a booking.'));
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      res.status(400);
      next(new Error('Booking quantity must be a whole number greater than 0.'));
      return;
    }

    let event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: 'published',
        availableTickets: { $gte: quantity }
      },
      {
        $inc: { availableTickets: -quantity }
      },
      {
        new: true
      }
    );

    if (!event) {
      res.status(400);
      next(new Error('Tickets are no longer available for this event.'));
      return;
    }

    if (event.availableTickets === 0 && event.status !== 'sold_out') {
      event.status = 'sold_out';
      await event.save();
    }

    const booking = await Booking.create(buildBookingPayload(event, req.user._id, quantity));

    const populatedBooking = await Booking.findById(booking._id)
      .populate('event', 'title slug category startDate endDate venue city price status organizerName')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title slug category startDate endDate venue city price status organizerName')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('event', 'title slug category startDate endDate venue city price status organizerName')
      .lean();

    if (!booking) {
      res.status(404);
      next(new Error('Booking not found.'));
      return;
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!booking) {
      res.status(404);
      next(new Error('Booking not found.'));
      return;
    }

    if (booking.bookingStatus === 'cancelled') {
      res.status(400);
      next(new Error('This booking has already been cancelled.'));
      return;
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    const event = await Event.findById(booking.event);

    if (event) {
      event.availableTickets += booking.quantity;

      if (event.status === 'sold_out') {
        event.status = 'published';
      }

      await event.save();
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('event', 'title slug category startDate endDate venue city price status organizerName')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email role')
      .populate('event', 'title slug category startDate venue city status')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};
