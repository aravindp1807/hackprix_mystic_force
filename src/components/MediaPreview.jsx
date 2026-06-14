export default function MediaPreview({ src, alt, className, style }) {
  if (!src) return null;
  
  if (src.startsWith('data:video/') || src.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <video 
        src={src} 
        controls 
        className={className} 
        style={{ ...style, width: '100%', maxHeight: '300px', objectFit: 'contain' }} 
      />
    );
  }
  
  if (src.startsWith('data:audio/') || src.match(/\.(mp3|wav|ogg|m4a)$/i)) {
    return (
      <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--card-bg, #fff)' }}>
        <audio src={src} controls style={{ width: '100%' }} />
      </div>
    );
  }
  
  // Default to image
  return <img src={src} alt={alt || 'Media preview'} className={className} style={style} />;
}
