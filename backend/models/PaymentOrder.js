import mongoose from 'mongoose';

const paymentOrderSchema = new mongoose.Schema(
  {
    razorpayOrderId: { type: String, required: true, unique: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    quantity: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['created', 'verifying', 'verified'], default: 'created' }
  },
  { timestamps: true }
);

export default mongoose.model('PaymentOrder', paymentOrderSchema);