import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
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
    eventTitle: {
      type: String,
      required: true,
      trim: true
    },
    eventSlug: {
      type: String,
      required: true,
      trim: true
    },
    eventStartDate: {
      type: Date,
      required: true
    },
    venue: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Booking quantity must be at least 1.']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Booking unit price cannot be negative.']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Booking total cannot be negative.']
    },
    bookingStatus: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'cancelled'],
      default: 'confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'not_required'],
      default: 'paid'
    },
    paymentProvider: {
      type: String,
      enum: ['demo', 'upi_manual', 'free', 'manual'],
      default: 'manual'
    },
    paymentId: {
      type: String,
      trim: true
    },
    paymentOrderId: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
