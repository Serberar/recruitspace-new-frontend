import { useCallback, useState } from 'react';

interface UseErrorHandlerOptions {
  onError?: (error: Error) => void;
  throwOnError?: boolean;
}

interface UseErrorHandlerReturn {
  error: Error | null;
  handleError: (error: unknown) => void;
  clearError: () => void;
  withErrorHandling: <T>(promise: Promise<T>) => Promise<T | undefined>;
}

/**
 * Hook for handling async errors in functional components.
 * Unlike ErrorBoundary which catches render errors, this hook
 * helps manage errors from async operations like API calls.
 *
 * @example
 * const { error, handleError, withErrorHandling } = useErrorHandler();
 *
 * // Option 1: Wrap async calls
 * const data = await withErrorHandling(fetchData());
 *
 * // Option 2: Manual error handling
 * try {
 *   await someAsyncOperation();
 * } catch (e) {
 *   handleError(e);
 * }
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const { onError, throwOnError = false } = options;
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback(
    (err: unknown) => {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);

      if (throwOnError) {
        throw error;
      }
    },
    [onError, throwOnError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(
    async <T>(promise: Promise<T>): Promise<T | undefined> => {
      try {
        clearError();
        return await promise;
      } catch (err) {
        handleError(err);
        return undefined;
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    handleError,
    clearError,
    withErrorHandling,
  };
}

/**
 * Utility function to normalize any error to an Error object
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String((error as { message: unknown }).message));
  }
  return new Error('An unknown error occurred');
}

/**
 * Type guard to check if an error is an API error with response
 */
export function isApiError(error: unknown): error is Error & {
  response?: {
    status: number;
    data?: { message?: string; success?: boolean };
  };
} {
  return error instanceof Error && 'response' in error;
}

/**
 * Extract user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
  // Axios error con response del backend
  if (isApiError(error)) {
    const data = error.response?.data as { message?: string; errors?: Array<{ field: string; message: string }> };

    // Errores de validación con campos específicos
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
    }

    // Mensaje del backend
    if (data?.message) {
      return data.message;
    }

    // Errores HTTP comunes
    const status = error.response?.status;
    if (status === 429) {
      return 'Demasiados intentos. Espera un momento antes de intentar de nuevo.';
    }
    if (status === 503) {
      return 'El servicio no está disponible. Intenta más tarde.';
    }
    if (status === 500) {
      return 'Error del servidor. Intenta más tarde.';
    }
  }

  // Error con mensaje directo
  if (error instanceof Error && error.message) {
    // Evitar mensajes técnicos de red
    if (error.message.includes('Network Error')) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
    if (error.message.includes('timeout')) {
      return 'La solicitud tardó demasiado. Intenta de nuevo.';
    }
    if (error.message.includes('429')) {
      return 'Demasiados intentos. Espera un momento antes de intentar de nuevo.';
    }
    return error.message;
  }

  // Objeto con propiedad message
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return 'Ha ocurrido un error inesperado';
}

export default useErrorHandler;
