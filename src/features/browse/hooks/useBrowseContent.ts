import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '../../../lib/tmdb';

// This hook fetches ALL the rows needed for the homepage in parallel.
// It returns an object containing data for every section.
export const useBrowseContent = () => {
  // 1. Fetch Trending (This will also be used for the Hero Banner)
  const trendingQuery = useQuery({
    queryKey: ['trending'],
    queryFn: tmdbApi.getTrending,
  });

  // 2. Fetch Netflix Originals
  const originalsQuery = useQuery({
    queryKey: ['originals'],
    queryFn: tmdbApi.getNetflixOriginals,
  });

  // 3. Fetch Top Rated
  const topRatedQuery = useQuery({
    queryKey: ['top-rated'],
    queryFn: tmdbApi.getTopRated,
  });

  // 4. Fetch Action
  const actionQuery = useQuery({
    queryKey: ['action'],
    queryFn: tmdbApi.getActionMovies,
  });

  // 5. Fetch Comedy
  const comedyQuery = useQuery({
    queryKey: ['comedy'],
    queryFn: tmdbApi.getComedyMovies,
  });

  // 6. Fetch Horror
  const horrorQuery = useQuery({
    queryKey: ['horror'],
    queryFn: tmdbApi.getHorrorMovies,
  });

  // 7. Fetch Romance
  const romanceQuery = useQuery({
    queryKey: ['romance'],
    queryFn: tmdbApi.getRomanceMovies,
  });

  // 8. Fetch Documentaries
  const documentariesQuery = useQuery({
    queryKey: ['documentaries'],
    queryFn: tmdbApi.getDocumentaries,
  });

  // We return all queries so the UI can check 'isLoading' for any of them
  return {
    trending: trendingQuery,
    originals: originalsQuery,
    topRated: topRatedQuery,
    action: actionQuery,
    comedy: comedyQuery,
    horror: horrorQuery,
    romance: romanceQuery,
    documentaries: documentariesQuery,
    
    // Global Loading State: True if ANY essential row is still loading
    isLoading: 
      trendingQuery.isLoading || 
      originalsQuery.isLoading || 
      topRatedQuery.isLoading,
  };
};