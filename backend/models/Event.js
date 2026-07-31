import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required.'],
      trim: true,
      maxlength: [120, 'Event title cannot exceed 120 characters.']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required.'],
      trim: true,
      maxlength: [1200, 'Event description cannot exceed 1200 characters.']
    },
    category: {
      type: String,
      required: [true, 'Event category is required.'],
      trim: true,
      maxlength: [60, 'Event category cannot exceed 60 characters.']
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required.'],
      trim: true,
      maxlength: [120, 'Event venue cannot exceed 120 characters.']
    },
    city: {
      type: String,
      required: [true, 'Event city is required.'],
      trim: true,
      maxlength: [60, 'Event city cannot exceed 60 characters.']
    },
    organizerName: {
      type: String,
      required: [true, 'Organizer name is required.'],
      trim: true,
      maxlength: [80, 'Organizer name cannot exceed 80 characters.']
    },
    startDate: {
      type: Date,
      required: [true, 'Event start date is required.']
    },
    endDate: {
      type: Date,
      required: [true, 'Event end date is required.']
    },
    price: {
      type: Number,
      required: [true, 'Event ticket price is required.'],
      min: [0, 'Event ticket price cannot be negative.']
    },
    totalTickets: {
      type: Number,
      required: [true, 'Total tickets are required.'],
      min: [1, 'Total tickets must be at least 1.']
    },
    availableTickets: {
      type: Number,
      required: [true, 'Available tickets are required.'],
      min: [0, 'Available tickets cannot be negative.']
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'sold_out', 'cancelled'],
      default: 'published'
    },
    featured: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
