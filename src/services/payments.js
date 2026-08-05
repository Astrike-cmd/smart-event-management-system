import api from './api';

export const createPaymentOrder = async (payload) => {
  const { data } = await api.post('/payments/orders', payload);
  return data.order;
};

export const verifyPayment = async (payload) => {
  const { data } = await api.post('/payments/verify', payload);
  return data.booking;
};

let checkoutLoader;

const loadCheckout = () => {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutLoader) return checkoutLoader;

  checkoutLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load the secure payment window. Please check your connection and try again.'));
    document.head.appendChild(script);
  });

  return checkoutLoader;
};

export const openPaymentCheckout = async (order) => {
  await loadCheckout();

  return new Promise((resolve, reject) => {
    let completed = false;
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Eventify',
      description: `${order.quantity} ticket(s) for ${order.eventTitle}`,
      order_id: order.id,
      handler: (response) => {
        completed = true;
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          if (!completed) reject(new Error('Payment cancelled. Your tickets were not booked.'));
        }
      },
      theme: { color: '#6f42c1' }
    });

    checkout.on('payment.failed', (response) => {
      reject(new Error(response.error?.description || 'Payment could not be completed.'));
    });
    checkout.open();
  });
};