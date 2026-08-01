function EventImage({
  src,
  alt,
  variant = 'card',
  placeholder = 'Event Image',
  showPlaceholder = true
}) {
  if (!src && !showPlaceholder) {
    return null;
  }

  return (
    <div className={`event-image-frame event-image-frame-${variant}`}>
      {src ? (
        <img className="event-image" src={src} alt={alt} />
      ) : (
        <div className="event-image-placeholder" aria-hidden="true">
          <span>{placeholder}</span>
        </div>
      )}
    </div>
  );
}

export default EventImage;
