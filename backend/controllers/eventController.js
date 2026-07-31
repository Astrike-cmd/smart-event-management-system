import Event from '../models/Event.js';
import Booking from '../models/Booking.js';

const createSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureUniqueSlug = async (title, excludeId) => {
  const baseSlug = createSlug(title);
  let slug = baseSlug || `event-${Date.now()}`;
  let suffix = 1;

  while (true) {
    const existingEvent = await Event.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {})
    });

    if (!existingEvent) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const normalizeEventPayload = (payload) => ({
  title: payload.title?.trim(),
  description: payload.description?.trim(),
  category: payload.category?.trim(),
  venue: payload.venue?.trim(),
  city: payload.city?.trim(),
  organizerName: payload.organizerName?.trim(),
  startDate: payload.startDate,
  endDate: payload.endDate,
  price: Number(payload.price),
  totalTickets: Number(payload.totalTickets),
  availableTickets:
    payload.availableTickets === undefined || payload.availableTickets === ''
      ? Number(payload.totalTickets)
      : Number(payload.availableTickets),
  status: payload.status || 'published',
  featured: payload.featured === true || payload.featured === 'true'
});

const validateEventPayload = (payload) => {
  const requiredFields = [
    'title',
    'description',
    'category',
    'venue',
    'city',
    'organizerName',
    'startDate',
    'endDate'
  ];

  const missingField = requiredFields.find((field) => !payload[field]);

  if (missingField) {
    return 'All event fields are required.';
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return 'Ticket price must be a valid non-negative number.';
  }

  if (!Number.isInteger(payload.totalTickets) || payload.totalTickets < 1) {
    return 'Total tickets must be a whole number greater than 0.';
  }

  if (!Number.isInteger(payload.availableTickets) || payload.availableTickets < 0) {
    return 'Available tickets must be a whole number equal to or greater than 0.';
  }

  if (payload.availableTickets > payload.totalTickets) {
    return 'Available tickets cannot exceed total tickets.';
  }

  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'Event start and end dates must be valid.';
  }

  if (endDate < startDate) {
    return 'Event end date must be after the start date.';
  }

  if (!['draft', 'published', 'sold_out', 'cancelled'].includes(payload.status)) {
    return 'Event status is invalid.';
  }

  return null;
};

const getSortDirection = (sort) => {
  if (sort === 'latest') {
    return -1;
  }

  return 1;
};

const canManageEvent = (event, user) =>
  user.role === 'admin' || String(event.createdBy) === String(user._id);

export const getPublishedEvents = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const sort = req.query.sort || 'upcoming';
    const query = { status: { $in: ['published', 'sold_out'] } };

    if (req.query.featured === 'true') {
      query.featured = true;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.upcoming === 'true') {
      query.endDate = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .sort({ startDate: getSortDirection(sort), createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

export const getEventBySlug = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      slug: req.params.slug,
      status: { $in: ['published', 'sold_out'] }
    }).lean();

    if (!event) {
      res.status(404);
      next(new Error('Event not found.'));
      return;
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

export const getManagedEvents = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const events = await Event.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const payload = normalizeEventPayload(req.body);
    const validationError = validateEventPayload(payload);

    if (validationError) {
      res.status(400);
      next(new Error(validationError));
      return;
    }

    const slug = await ensureUniqueSlug(payload.title);
    const event = await Event.create({
      ...payload,
      slug,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const existingEvent = await Event.findById(req.params.id);

    if (!existingEvent) {
      res.status(404);
      next(new Error('Event not found.'));
      return;
    }

    if (!canManageEvent(existingEvent, req.user)) {
      res.status(403);
      next(new Error('You are not allowed to manage this event.'));
      return;
    }

    const payload = normalizeEventPayload({
      ...existingEvent.toObject(),
      ...req.body
    });
    const validationError = validateEventPayload(payload);

    if (validationError) {
      res.status(400);
      next(new Error(validationError));
      return;
    }

    existingEvent.title = payload.title;
    existingEvent.slug = await ensureUniqueSlug(payload.title, existingEvent._id);
    existingEvent.description = payload.description;
    existingEvent.category = payload.category;
    existingEvent.venue = payload.venue;
    existingEvent.city = payload.city;
    existingEvent.organizerName = payload.organizerName;
    existingEvent.startDate = payload.startDate;
    existingEvent.endDate = payload.endDate;
    existingEvent.price = payload.price;
    existingEvent.totalTickets = payload.totalTickets;
    existingEvent.availableTickets = payload.availableTickets;
    existingEvent.status = payload.status;
    existingEvent.featured = payload.featured;

    await existingEvent.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      event: existingEvent
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const existingEvent = await Event.findById(req.params.id);

    if (!existingEvent) {
      res.status(404);
      next(new Error('Event not found.'));
      return;
    }

    if (!canManageEvent(existingEvent, req.user)) {
      res.status(403);
      next(new Error('You are not allowed to delete this event.'));
      return;
    }

    const cancelledBookings = await Booking.updateMany(
      {
        event: existingEvent._id,
        bookingStatus: 'confirmed'
      },
      {
        bookingStatus: 'cancelled',
        paymentStatus: 'refunded'
      }
    );

    await existingEvent.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
      cancelledBookingsCount: cancelledBookings.modifiedCount || 0
    });
  } catch (error) {
    next(error);
  }
};
