import { tmdb } from './axios';
import type { Movie, TVShow, PaginatedResponse, Person } from '../types/tmdb';

// This object contains all the "endpoints" the app uses.
export const tmdbApi = {
  // 1. The "Hero" Section & Trending Row
  getTrending: async () => {
    const { data } = await tmdb.get<PaginatedResponse<Movie>>('/trending/all/week?language=en-US');
    return data.results;
  },

  // 2. Netflix Originals (Specific Network ID: 213)
  getNetflixOriginals: async () => {
    const { data } = await tmdb.get<PaginatedResponse<TVShow>>('/discover/tv?with_networks=213');
    return data.results;
  },

  // 3. Top Rated Movies
  getTopRated: async () => {
    const { data } = await tmdb.get<PaginatedResponse<Movie>>('/movie/top_rated?language=en-US');
    return data.results;
  },

  // 4. Action Movies (Genre ID: 28)
  getActionMovies: async () => {
    const { data } = await tmdb.get<PaginatedResponse<Movie>>('/discover/movie?with_genres=28');
    return data.results;
  },

  // 5. Comedy Movies (Genre ID: 35)
  getComedyMovies: async () => {
    const { data } = await tmdb.get<PaginatedResponse<Movie>>('/discover/movie?with_genres=35');
    return data.results;
  },

  // 6. Horror Movies (Genre ID: 27)
  getHorrorMovies: async () => {
    const { data } = await tmdb.get<PaginatedResponse<Movie>>('/discover/movie?with_genres=27');
    return data.results;
  },

  // 7. Romance Movies (Genre ID: 10749)
  getRomanceMovies: async () => {
    const { data } = await tmdb.get<PaginatedResponse<Movie>>('/discover/movie?with_genres=10749');
    return data.results;
  },

  // 8. Documentaries (Genre ID: 99)
  getDocumentaries: async () => {
    const { data } = await tmdb.get<PaginatedResponse<Movie>>('/discover/movie?with_genres=99');
    return data.results;
  },
  
  // 9. Get details for a specific movie
  getMovieDetails: async (movieId: number) => {
    // "append_to_response" is a magic parameter that fetches videos and credits 
    // in the SAME request. This saves us 2 extra network calls.
    const { data } = await tmdb.get(`/movie/${movieId}?append_to_response=videos,credits,similar`);
    return data;
  },

  // 10. Dynamic Genre Fetch with Pagination
  getByGenre: async (genreId: number, page: number = 1) => {
    // We pass the 'page' param to TMDB
    const { data } = await tmdb.get<PaginatedResponse<Movie>>(
      `/discover/movie?with_genres=${genreId}&page=${page}`
    );
    // Return the FULL data object (not just results) so we know the total_pages
    return data;
  },

  // 11. Paginated Helper for Categories (Trending, Top Rated, etc.)
  getCategoryList: async (category: string, page: number = 1) => {
    let endpoint = '';
    
    switch (category) {
      case 'trending': endpoint = `/trending/all/week?language=en-US&page=${page}`; break;
      case 'top-rated': endpoint = `/movie/top_rated?language=en-US&page=${page}`; break;
      case 'originals': endpoint = `/discover/tv?with_networks=213&page=${page}`; break;
      case 'action': endpoint = `/discover/movie?with_genres=28&page=${page}`; break;
      case 'comedy': endpoint = `/discover/movie?with_genres=35&page=${page}`; break;
      case 'horror': endpoint = `/discover/movie?with_genres=27&page=${page}`; break;
      default: return null;
    }

    const { data } = await tmdb.get<PaginatedResponse<Movie | TVShow>>(endpoint);
    return data;
  },

  // 12. Search Multi (Movies & TV)
  searchContent: async (query: string) => {
    const { data } = await tmdb.get<PaginatedResponse<Movie | TVShow>>(
      `/search/multi?query=${encodeURIComponent(query)}&include_adult=false`
    );
    // Filter out "person" results, we only want content
    const content = data.results.filter(
      item => item.media_type === 'movie' || item.media_type === 'tv'
    );
    return content;
  },

  // 13. Get Full Details (Movie OR TV)
  getContentDetails: async (type: 'movie' | 'tv', id: number) => {
    const { data } = await tmdb.get(
      `/${type}/${id}?append_to_response=credits,similar,videos`
    );
    return data;
  },

  // 14. Get Person Details (Actor/Director)
  getPerson: async (personId: number) => {
    // We append 'combined_credits' to get everything they've been in (Movies + TV)
    const { data } = await tmdb.get<Person>(`/person/${personId}?append_to_response=combined_credits`);
    return data;
  },

  // 15. Get Watch Providers (Where to Stream)
  getWatchProviders: async (type: 'movie' | 'tv', id: number) => {
    const { data } = await tmdb.get(`/${type}/${id}/watch/providers`);
    return data.results;
  }
};