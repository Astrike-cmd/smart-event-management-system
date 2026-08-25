import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentReference: {
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    bookingReference: {
      type: String,
      required: true,
      trim: true
    },
    eventTitle: {
      type: String,
      required: true,
      trim: true
    },
    provider: {
      type: String,
      enum: ['demo', 'upi_manual', 'free', 'manual'],
      required: true
    },
    method: {
      type: String,
      enum: ['demo_gateway', 'upi_transfer', 'offline', 'none'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative.']
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed', 'not_required'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      trim: true
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    confirmedAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ booking: 1, createdAt: -1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
