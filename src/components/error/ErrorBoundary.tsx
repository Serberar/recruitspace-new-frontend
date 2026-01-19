import { logger } from '@/lib/logger';
import { Component, type ReactNode, type ErrorInfo } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    logger.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional onError callback (for external logging like Sentry)
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasResetKeyChanged) {
        this.resetError();
      }
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // If fallback is a function, call it with error and reset function
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }

      // If fallback is a ReactNode, render it
      if (fallback) {
        return fallback;
      }

      // Default fallback
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Algo salio mal</h2>
          <p>Ha ocurrido un error inesperado.</p>
          <button onClick={this.resetError}>Intentar de nuevo</button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
