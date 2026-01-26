import axios from 'axios';

// We load the API key from the environment variables (we will set this up next)
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Create a configured instance of Axios
export const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
  },
});

// Enterprise Grade: Global Error Interceptor
// This catches errors like 401 (Unauthorized) or 500 (Server Error)
// from TMDB in one central place.
tmdb.interceptors.response.use(
  (response) => response,
  (error) => {
    // In a real enterprise app, you would log this to Sentry or Datadog here.
    console.error('[API Error]', error.response?.data?.status_message || error.message);
    return Promise.reject(error);
  }
);