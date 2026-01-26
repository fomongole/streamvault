import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data will be considered "fresh" for 5 minutes.
      // We won't refetch automatically during this time.
      staleTime: 1000 * 60 * 5, 
      refetchOnWindowFocus: false, // Don't refetch just because I clicked another tab
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Provide the client to the App */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)