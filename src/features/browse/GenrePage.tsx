import { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { tmdbApi } from '../../lib/tmdb';
import { getPosterImage } from '../../utils/tmdb-image';
import type { Movie } from '../../types/tmdb';

const GENRE_MAP: Record<string, string> = {
  "28": "Action",
  "16": "Animation",
  "35": "Comedy",
  "80": "Crime",
  "99": "Documentary",
  "18": "Drama",
  "27": "Horror",
  "878": "Sci-Fi",
  "53": "Thriller",
  "37": "Western"
};

export function GenrePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const genreName = id ? GENRE_MAP[id] : "Genre";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['genre', id],
    queryFn: ({ pageParam = 1 }) => tmdbApi.getByGenre(Number(id), pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined;
    },
    enabled: !!id,
  });

  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-[#1C1F26] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#e5a00d] animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Loading {genreName}...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return <div className="min-h-screen bg-[#1C1F26] text-white flex items-center justify-center">Error loading movies.</div>;
  }

  return (
    <div className="min-h-screen bg-[#1C1F26] text-gray-100 pb-20">
      <div className="px-6 md:px-12 pt-8 pb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Browse
        </button>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {genreName}
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          Ever wonder what makes a {genreName} great? We put together a collection of the best {genreName} movies so you can watch and learn from the best in the biz.
        </p>
      </div>

      <div className="px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {data?.pages.map((page) => (
          page.results.map((movie: Movie) => (
            <div 
              key={movie.id} 
              // FIXED: Added navigation to detail page (Assume Movie for genre pages)
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="group cursor-pointer flex flex-col gap-3"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-lg bg-gray-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-white/50">
                <img
                  src={getPosterImage(movie.poster_path)}
                  alt={movie.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-200 truncate group-hover:text-white transition-colors">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  <span className="border border-gray-600 px-1 rounded text-[10px]">HD</span>
                </div>
              </div>
            </div>
          ))
        ))}

        <div ref={lastElementRef} className="col-span-full h-20 flex items-center justify-center">
          {isFetchingNextPage && (
            <Loader2 className="w-8 h-8 text-[#e5a00d] animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
}