import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
  },
});

// Global Error Interceptor
tmdb.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.response?.data?.status_message || error.message);
    return Promise.reject(error);
  }
);