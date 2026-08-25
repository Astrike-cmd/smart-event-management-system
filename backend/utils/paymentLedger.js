import Payment from '../models/Payment.js';

const generatePaymentReference = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PAY-${datePart}-${randomPart}`;
};

const methodByProvider = {
  demo: 'demo_gateway',
  upi_manual: 'upi_transfer',
  manual: 'offline',
  free: 'none'
};

export const recordPayment = async ({
  booking,
  event,
  userId,
  provider,
  amount,
  status,
  transactionId,
  confirmedBy
}) =>
  Payment.create({
    paymentReference: generatePaymentReference(),
    user: userId,
    event: event._id,
    booking: booking._id,
    bookingReference: booking.bookingReference,
    eventTitle: event.title,
    provider,
    method: methodByProvider[provider] || 'none',
    amount,
    status,
    transactionId,
    confirmedBy,
    confirmedAt: status === 'paid' ? new Date() : undefined
  });

export const markPaymentsPaid = async (bookingId, adminId) =>
  Payment.updateMany(
    { booking: bookingId, status: 'pending' },
    {
      $set: {
        status: 'paid',
        confirmedBy: adminId,
        confirmedAt: new Date()
      }
    }
  );

export const markPaymentsRefunded = async (bookingId) =>
  Payment.updateMany(
    { booking: bookingId, status: { $in: ['pending', 'paid'] } },
    {
      $set: {
        status: 'refunded',
        refundedAt: new Date()
      }
    }
  );
