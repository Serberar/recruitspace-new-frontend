import { useState, useEffect } from 'react';

/**
 * Hook para detectar si el dispositivo es móvil basándose en el ancho de la ventana.
 * @param breakpoint - Ancho máximo en píxeles para considerar móvil (default: 768)
 * @returns boolean indicando si es dispositivo móvil
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    // Usar matchMedia para mejor rendimiento
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    // Handler para cambios de media query
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Configurar listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antiguos
      window.addEventListener('resize', checkMobile);
    }

    // Check inicial
    setIsMobile(mediaQuery.matches);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        window.removeEventListener('resize', checkMobile);
      }
    };
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
