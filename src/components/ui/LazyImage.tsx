import { useState, useRef, useEffect, memo, type ImgHTMLAttributes } from 'react';
import { useLazyLoad } from '../../hooks/useIntersectionObserver';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  placeholderSrc?: string;
  fallbackSrc?: string;
  rootMargin?: string;
}

function LazyImageInner({
  src,
  placeholderSrc,
  fallbackSrc,
  alt = '',
  rootMargin = '50px',
  className,
  style,
  ...props
}: LazyImageProps) {
  const imageRef = useRef<HTMLImageElement>(null!);
  const [imageSrc, setImageSrc] = useState(placeholderSrc || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isVisible = useLazyLoad(imageRef, rootMargin);

  // Load image when in view
  useEffect(() => {
    if (isVisible && !isLoaded && !hasError) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setHasError(true);
        if (fallbackSrc) {
          setImageSrc(fallbackSrc);
        }
      };
      img.src = src;
    }
  }, [isVisible, src, isLoaded, hasError, fallbackSrc]);

  const combinedStyle = {
    ...style,
    opacity: isLoaded ? 1 : 0.5,
    transition: 'opacity 0.3s ease-in-out',
  };

  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      className={className}
      style={combinedStyle}
      {...props}
    />
  );
}

export const LazyImage = memo(LazyImageInner);

// Native lazy loading fallback for simpler use cases
export function NativeLazyImage({
  src,
  alt = '',
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError ? '' : src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
