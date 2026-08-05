import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';

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
  totalAmount: event.price * quantity,
  paymentStatus: event.price === 0 ? 'not_required' : 'paid',
  paymentProvider: event.price === 0 ? 'free' : 'manual'
});

const normalizeQuantity = (value) => Number.parseInt(value, 10);

const populateBookingQuery = (query) =>
  query
    .populate('user', 'name email role')
    .populate(
      'event',
      'title slug category startDate endDate venue city price status organizerName imageData'
    );

const getPopulatedBookingById = async (bookingId) =>
  populateBookingQuery(Booking.findById(bookingId)).lean();

const ensureValidQuantity = (quantity) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return 'Booking quantity must be a whole number greater than 0.';
  }

  return null;
};

const ensureBookableEvent = async (eventId, quantity) => {
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
    return null;
  }

  if (event.availableTickets === 0 && event.status !== 'sold_out') {
    event.status = 'sold_out';
    await event.save();
  }

  return event;
};

const createBookingForUser = async ({ eventId, quantity, userId }) => {
  const event = await ensureBookableEvent(eventId, quantity);

  if (!event) {
    return null;
  }

  const booking = await Booking.create(buildBookingPayload(event, userId, quantity));
  return getPopulatedBookingById(booking._id);
};

const restoreInventoryForBooking = async (booking) => {
  const event = await Event.findById(booking.event);

  if (!event) {
    return;
  }

  event.availableTickets += booking.quantity;

  if (event.status === 'sold_out') {
    event.status = 'published';
  }

  await event.save();
};

const cancelExistingBooking = async (booking) => {
  if (booking.bookingStatus === 'cancelled') {
    return { error: 'This booking has already been cancelled.' };
  }

  booking.bookingStatus = 'cancelled';
  booking.paymentStatus = 'refunded';
  await booking.save();
  await restoreInventoryForBooking(booking);

  return {
    booking: await getPopulatedBookingById(booking._id)
  };
};

const findUserAccount = async (userId) => {
  const user = await User.findOne({ _id: userId, role: 'user' }).select('name email role');
  return user;
};

export const createBooking = async (req, res, next) => {
  try {
    const quantity = normalizeQuantity(req.body.quantity);
    const eventId = req.body.eventId;

    if (!eventId) {
      res.status(400);
      next(new Error('Event ID is required to create a booking.'));
      return;
    }

    const quantityError = ensureValidQuantity(quantity);

    if (quantityError) {
      res.status(400);
      next(new Error(quantityError));
      return;
    }

    const event = await Event.findById(eventId).select('price');

    if (event && event.price > 0) {
      res.status(400);
      next(new Error('Please complete payment before confirming this booking.'));
      return;
    }
    const booking = await createBookingForUser({
      eventId,
      quantity,
      userId: req.user._id
    });

    if (!booking) {
      res.status(400);
      next(new Error('Tickets are no longer available for this event.'));
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminBooking = async (req, res, next) => {
  try {
    const quantity = normalizeQuantity(req.body.quantity);
    const eventId = req.body.eventId;
    const userId = req.body.userId;

    if (!eventId || !userId) {
      res.status(400);
      next(new Error('User ID and event ID are required to create an admin booking.'));
      return;
    }

    const quantityError = ensureValidQuantity(quantity);

    if (quantityError) {
      res.status(400);
      next(new Error(quantityError));
      return;
    }

    const user = await findUserAccount(userId);

    if (!user) {
      res.status(404);
      next(new Error('The selected user account could not be found.'));
      return;
    }

    const booking = await createBookingForUser({
      eventId,
      quantity,
      userId: user._id
    });

    if (!booking) {
      res.status(400);
      next(new Error('Tickets are no longer available for this event.'));
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully for the selected user.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await populateBookingQuery(Booking.find({ user: req.user._id }))
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
    const booking = await populateBookingQuery(
      Booking.findOne({
        _id: req.params.id,
        user: req.user._id
      })
    ).lean();

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

    const result = await cancelExistingBooking(booking);

    if (result.error) {
      res.status(400);
      next(new Error(result.error));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking: result.booking
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminBookings = async (req, res, next) => {
  try {
    const bookings = await populateBookingQuery(Booking.find())
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

export const cancelAdminBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      next(new Error('Booking not found.'));
      return;
    }

    const result = await cancelExistingBooking(booking);

    if (result.error) {
      res.status(400);
      next(new Error(result.error));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking: result.booking
    });
  } catch (error) {
    next(error);
  }
};

export const transferAdminBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      next(new Error('Booking not found.'));
      return;
    }

    if (booking.bookingStatus === 'cancelled') {
      res.status(400);
      next(new Error('Cancelled bookings cannot be transferred.'));
      return;
    }

    const targetUser = await findUserAccount(req.body.userId);

    if (!targetUser) {
      res.status(404);
      next(new Error('The selected user account could not be found.'));
      return;
    }

    if (String(booking.user) === String(targetUser._id)) {
      res.status(400);
      next(new Error('This booking is already assigned to the selected user.'));
      return;
    }

    booking.user = targetUser._id;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking transferred successfully.',
      booking: await getPopulatedBookingById(booking._id)
    });
  } catch (error) {
    next(error);
  }
};
