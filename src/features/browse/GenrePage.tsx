import { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronLeft, Loader2, Star, Filter } from 'lucide-react';
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
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#e5a00d] animate-spin" />
        </div>
    );
  }

  if (status === 'error') {
    return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Error loading content.</div>;
  }

  return (
      <div className="min-h-screen bg-[#121212] text-white pb-20">

        {/* 1. Sticky Glass Header */}
        <div className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors group"
            >
              <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-white" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {genreName}
              </h1>
              <p className="text-xs text-gray-400 hidden md:block">Browsing by Genre</p>
            </div>
          </div>
          <div className="p-2 rounded-full bg-white/5 border border-white/5">
            <Filter className="w-5 h-5 text-[#e5a00d]" />
          </div>
        </div>

        {/* 2. Premium Grid */}
        <div className="px-6 md:px-12 pt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {data?.pages.map((page) => (
              page.results.map((movie: Movie) => (
                  <div
                      key={movie.id}
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      className="group cursor-pointer flex flex-col gap-3 relative"
                  >
                    {/* Poster Container */}
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 relative shadow-lg ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-[#e5a00d] z-10">
                      <img
                          src={getPosterImage(movie.poster_path)}
                          alt={movie.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-[#e5a00d] font-bold text-lg flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-current" /> {movie.vote_average?.toFixed(1)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-300 font-medium mt-1">
                            <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-500" />
                            <span className="border border-gray-600 px-1 rounded text-[10px]">HD</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors px-1">
                      {movie.title}
                    </h3>
                  </div>
              ))
          ))}

          {/* Loading Spinner */}
          <div ref={lastElementRef} className="col-span-full h-24 flex items-center justify-center">
            {isFetchingNextPage && (
                <Loader2 className="w-8 h-8 text-[#e5a00d] animate-spin" />
            )}
          </div>
        </div>
      </div>
  );
}