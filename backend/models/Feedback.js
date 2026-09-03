import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'A rating between 1 and 5 is required.'],
      min: [1, 'Rating must be at least 1 star.'],
      max: [5, 'Rating cannot exceed 5 stars.']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required.'],
      trim: true,
      maxlength: [800, 'Review comment cannot exceed 800 characters.']
    }
  },
  {
    timestamps: true
  }
);

feedbackSchema.index({ user: 1, event: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
