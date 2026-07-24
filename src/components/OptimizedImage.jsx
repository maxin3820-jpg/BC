import React, { useState } from 'react'

const OptimizedImage = ({ src, alt, className, width, height, priority = false }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Default gradient fallback
  const defaultGradient = 'linear-gradient(135deg, #1E3A8A, #1D4ED8)'

  // Check if it's an actual image URL
  const isImage = src && (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/'))

  if (!isImage || error) {
    return (
      <div
        className={className}
        style={{ background: src || defaultGradient, width: '100%', height: '100%' }}
      />
    )
  }

  return (
    <>
      {!loaded && (
        <div
          className={className}
          style={{ background: defaultGradient, width: '100%', height: '100%' }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </>
  )
}

export default OptimizedImage
