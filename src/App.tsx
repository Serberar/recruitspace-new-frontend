import { logger } from '@/lib/logger';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ErrorBoundary } from './components/error';
import { ErrorFallback } from './components/error';
import { ToastProvider } from './components/ui';

const App: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <BrowserRouter>
          <ErrorFallback error={error} resetError={resetError} />
        </BrowserRouter>
      )}
      onError={(error, errorInfo) => {
        // Log to external service in production (e.g., Sentry)
        logger.error('Global error:', error, errorInfo);
      }}
    >
      <BrowserRouter>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
