import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import Feedback from '../models/Feedback.js';

const populateFeedbackQuery = (query) => query.populate('user', 'name email');

const populateAdminFeedbackQuery = (query) =>
  query
    .populate('user', 'name email')
    .populate('event', 'title slug city');

const getPopulatedFeedbackById = async (feedbackId) =>
  populateFeedbackQuery(Feedback.findById(feedbackId)).lean();

const normalizeRating = (value) => Number.parseInt(value, 10);

const validateRatingAndComment = (rating, comment) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return 'Rating must be a whole number between 1 and 5.';
  }

  if (!comment || !comment.trim()) {
    return 'Review comment is required.';
  }

  if (comment.trim().length > 800) {
    return 'Review comment cannot exceed 800 characters.';
  }

  return null;
};

const findConfirmedBooking = (userId, eventId) =>
  Booking.findOne({ user: userId, event: eventId, bookingStatus: 'confirmed' });

export const createFeedback = async (req, res, next) => {
  try {
    const rating = normalizeRating(req.body.rating);
    const comment = req.body.comment;
    const eventId = req.body.eventId;

    if (!eventId) {
      res.status(400);
      next(new Error('Event ID is required to submit a review.'));
      return;
    }

    const validationError = validateRatingAndComment(rating, comment);

    if (validationError) {
      res.status(400);
      next(new Error(validationError));
      return;
    }

    const event = await Event.findById(eventId).select('_id');

    if (!event) {
      res.status(404);
      next(new Error('Event not found.'));
      return;
    }

    const booking = await findConfirmedBooking(req.user._id, eventId);

    if (!booking) {
      res.status(403);
      next(new Error('You can only review events you have a confirmed booking for.'));
      return;
    }

    const existingFeedback = await Feedback.findOne({ user: req.user._id, event: eventId });

    if (existingFeedback) {
      res.status(400);
      next(new Error('You have already reviewed this event. Edit your existing review instead.'));
      return;
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      event: eventId,
      booking: booking._id,
      rating,
      comment: comment.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      feedback: await getPopulatedFeedbackById(feedback._id)
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      next(new Error('You have already reviewed this event. Edit your existing review instead.'));
      return;
    }

    next(error);
  }
};

export const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ _id: req.params.id, user: req.user._id });

    if (!feedback) {
      res.status(404);
      next(new Error('Review not found.'));
      return;
    }

    const rating = normalizeRating(req.body.rating);
    const comment = req.body.comment;
    const validationError = validateRatingAndComment(rating, comment);

    if (validationError) {
      res.status(400);
      next(new Error(validationError));
      return;
    }

    feedback.rating = rating;
    feedback.comment = comment.trim();
    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      feedback: await getPopulatedFeedbackById(feedback._id)
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!feedback) {
      res.status(404);
      next(new Error('Review not found.'));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Review removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getEventFeedback = async (req, res, next) => {
  try {
    const feedback = await populateFeedbackQuery(Feedback.find({ event: req.params.eventId }))
      .sort({ createdAt: -1 })
      .lean();

    const average = feedback.length
      ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
      : 0;

    res.status(200).json({
      success: true,
      count: feedback.length,
      average,
      feedback
    });
  } catch (error) {
    next(error);
  }
};

export const getMyFeedbackForEvent = async (req, res, next) => {
  try {
    const [booking, feedback] = await Promise.all([
      findConfirmedBooking(req.user._id, req.params.eventId),
      Feedback.findOne({ user: req.user._id, event: req.params.eventId }).lean()
    ]);

    res.status(200).json({
      success: true,
      eligible: Boolean(booking),
      feedback: feedback || null
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminFeedback = async (req, res, next) => {
  try {
    const feedback = await populateAdminFeedbackQuery(Feedback.find())
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: feedback.length,
      feedback
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      res.status(404);
      next(new Error('Review not found.'));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Review removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
