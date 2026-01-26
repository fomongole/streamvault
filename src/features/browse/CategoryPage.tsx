import { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { tmdbApi } from '../../lib/tmdb';
import { getPosterImage } from '../../utils/tmdb-image';
import type { Movie, TVShow } from '../../types/tmdb';

const TITLES: Record<string, string> = {
  "trending": "Trending Now",
  "top-rated": "Top Rated Movies",
  "originals": "StreamVault Originals",
  "action": "Action Thrillers",
  "comedy": "Comedy Favorites",
  "horror": "Scary Movies"
};

export function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const title = id ? TITLES[id] : "List";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['category', id],
    queryFn: ({ pageParam = 1 }) => tmdbApi.getCategoryList(id || '', pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
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

  // Helper to determine media type
  const getMediaType = (item: Movie | TVShow) => {
    // 1. If API explicitly provides media_type (common in trending), use it
    if ('media_type' in item && item.media_type) return item.media_type;
    // 2. 'originals' category is always TV
    if (id === 'originals') return 'tv';
    // 3. 'top-rated', 'action', etc are all Movies in our API setup
    return 'movie'; 
  };

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-[#1C1F26] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#e5a00d] animate-spin" />
      </div>
    );
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

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          Browse our complete collection of {title.toLowerCase()}.
        </p>
      </div>

      <div className="px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {data?.pages.map((page) => (
          page?.results.map((item: Movie | TVShow) => (
            <div 
              key={item.id} 
              // FIXED: Added click navigation
              onClick={() => navigate(`/${getMediaType(item)}/${item.id}`)}
              className="group cursor-pointer flex flex-col gap-3"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-lg bg-gray-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-white/50">
                <img
                  src={getPosterImage(item.poster_path)}
                  alt={(item as Movie).title || (item as TVShow).name}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-200 truncate group-hover:text-white transition-colors">
                  {(item as Movie).title || (item as TVShow).name}
                </h3>
              </div>
            </div>
          ))
        ))}
        
        <div ref={lastElementRef} className="col-span-full h-20 flex items-center justify-center">
          {isFetchingNextPage && <Loader2 className="w-8 h-8 text-[#e5a00d] animate-spin" />}
        </div>
      </div>
    </div>
  );
}