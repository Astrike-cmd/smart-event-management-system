import { forwardRef, useEffect, useMemo, useState } from 'react';
import EventImage from './EventImage';

const getStatusLabel = (booking) => {
  if (!booking.event) {
    return 'Event Removed';
  }

  if (booking.event.status === 'sold_out') {
    return 'Sold Out Event';
  }

  if (booking.bookingStatus === 'cancelled') {
    return 'Cancelled Booking';
  }

  return 'Scheduled';
};

const getTicketTone = (booking) => {
  if (booking.bookingStatus === 'cancelled') {
    return 'muted';
  }

  if (!booking.event) {
    return 'neutral';
  }

  return 'accent';
};

const buildQrPayload = (booking, attendeeName, formattedEventDate) =>
  [
    'Smart Event Ticket',
    `Reference: ${booking.bookingReference}`,
    `Event: ${booking.eventTitle}`,
    `Attendee: ${attendeeName}`,
    `Date: ${formattedEventDate}`,
    `Venue: ${booking.venue}, ${booking.city}`,
    `Quantity: ${booking.quantity}`,
    `Payment: ${booking.paymentStatus}`
  ].join('\n');

const BookingTicket = forwardRef(function BookingTicket(
  { booking, formatDate, onDownloadPdf, isDownloading },
  ref
) {
  const [qrCodeSrc, setQrCodeSrc] = useState('');
  const formattedBookedDate = formatDate(booking.createdAt);
  const formattedEventDate = formatDate(booking.eventStartDate);
  const attendeeName = booking.user?.name || 'Registered attendee';
  const statusLabel = getStatusLabel(booking);
  const ticketTone = getTicketTone(booking);

  const qrPayload = useMemo(
    () => buildQrPayload(booking, attendeeName, formattedEventDate),
    [attendeeName, booking, formattedEventDate]
  );

  useEffect(() => {
    let isMounted = true;

    const generateCode = async () => {
      try {
        const { default: QRCode } = await import('qrcode');
        const nextQrCodeSrc = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 192,
          color: {
            dark: '#111111',
            light: '#ffffff'
          }
        });

        if (isMounted) {
          setQrCodeSrc(nextQrCodeSrc);
        }
      } catch (error) {
        if (isMounted) {
          setQrCodeSrc('');
        }
      }
    };

    generateCode();

    return () => {
      isMounted = false;
    };
  }, [qrPayload]);

  return (
    <article className={`booking-card ticket-pass ticket-pass-${ticketTone}`}>
      <div className="ticket-pass-shell" ref={ref}>
        <div className="ticket-pass-topline">
          <span className="ticket-pass-brand">Smart Event Ticket</span>
          <span className="ticket-pass-cutline" aria-hidden="true" />
        </div>

        <div className="ticket-pass-head">
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
              <span className="spotlight-tag">{booking.bookingReference}</span>
              <span className="event-price-chip">{booking.bookingStatus}</span>
              <span className="ticket-pass-status">{statusLabel}</span>
            </div>
            <h3 className="h4 mb-2">{booking.eventTitle}</h3>
            <p className="text-muted small mb-0">
              Booked on {formattedBookedDate} | Payment {booking.paymentStatus}
            </p>
          </div>

          <div className="ticket-pass-price">
            <div className="h4 mb-1">Rs. {booking.totalAmount}</div>
            <small className="text-muted">{booking.quantity} ticket(s)</small>
          </div>
        </div>

        <div className="ticket-pass-body">
          <div className="ticket-pass-visual">
            <EventImage
              src={booking.event?.imageData}
              alt={`${booking.eventTitle} ticket artwork`}
              variant="ticket"
              placeholder="Ticket Artwork"
            />
          </div>

          <div className="ticket-pass-details">
            <div className="ticket-pass-grid">
              <div className="ticket-pass-detail">
                <span>Attendee</span>
                <strong>{attendeeName}</strong>
              </div>
              <div className="ticket-pass-detail">
                <span>Event Date</span>
                <strong>{formattedEventDate}</strong>
              </div>
              <div className="ticket-pass-detail">
                <span>Venue</span>
                <strong>{booking.venue}</strong>
              </div>
              <div className="ticket-pass-detail">
                <span>City</span>
                <strong>{booking.city}</strong>
              </div>
              <div className="ticket-pass-detail">
                <span>Quantity</span>
                <strong>{booking.quantity} ticket(s)</strong>
              </div>
              <div className="ticket-pass-detail">
                <span>Entry Status</span>
                <strong>{statusLabel}</strong>
              </div>
            </div>

            <div className="ticket-pass-footer">
              <div className="ticket-pass-note">
                Present this ticket at the venue entrance. The QR contains your booking details for a
                quicker check-in.
              </div>

              <div className="ticket-pass-qr">
                {qrCodeSrc ? (
                  <img src={qrCodeSrc} alt={`QR code for booking ${booking.bookingReference}`} />
                ) : (
                  <div className="ticket-pass-qr-placeholder">Generating QR</div>
                )}
                <span>Scan At Entry</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap mt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onDownloadPdf(booking)}
          disabled={isDownloading}
        >
          {isDownloading ? 'Preparing PDF...' : 'Download Ticket PDF'}
        </button>
      </div>
    </article>
  );
});

export default BookingTicket;
