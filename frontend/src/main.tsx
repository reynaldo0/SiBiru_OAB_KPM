import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { App } from './app/App';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <App />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className:
              '!rounded-xl !border !border-ink-border !font-sans !text-xs !shadow-lift',
          }}
        />
      </MotionConfig>
    </QueryClientProvider>
  </React.StrictMode>,
);
