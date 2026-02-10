import { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronLeft, Loader2, Star } from 'lucide-react';
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

  const getMediaType = (item: Movie | TVShow) => {
    if ('media_type' in item && item.media_type) return item.media_type;
    if (id === 'originals') return 'tv';
    return 'movie';
  };

  if (status === 'pending') {
    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#e5a00d] animate-spin" />
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#121212] text-white pb-20">

        {/* 1. Sticky Glass Header */}
        <div className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-4">
            <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors group"
            >
              <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-white" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">{title}</h1>
              <p className="text-xs text-gray-400 hidden md:block">StreamVault Collection</p>
            </div>
          </div>
        </div>

        {/* 2. Premium Grid Layout */}
        <div className="px-6 md:px-12 pt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {data?.pages.map((page) => (
              page?.results.map((item: Movie | TVShow) => (
                  <div
                      key={item.id}
                      onClick={() => navigate(`/${getMediaType(item)}/${item.id}`)}
                      className="group cursor-pointer flex flex-col gap-3 relative"
                  >
                    {/* Card Image Container */}
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 relative shadow-lg ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-[#e5a00d] z-10">
                      <img
                          src={getPosterImage(item.poster_path)}
                          alt={(item as Movie).title || (item as TVShow).name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-[#e5a00d] font-bold text-lg flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-current" /> {item.vote_average?.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-300 font-medium mt-1">
                            {((item as Movie).release_date || (item as TVShow).first_air_date)?.split('-')[0] || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Title Below */}
                    <h3 className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors px-1">
                      {(item as Movie).title || (item as TVShow).name}
                    </h3>
                  </div>
              ))
          ))}

          {/* Loading Spinner */}
          <div ref={lastElementRef} className="col-span-full h-24 flex items-center justify-center">
            {isFetchingNextPage && <Loader2 className="w-8 h-8 text-[#e5a00d] animate-spin" />}
          </div>
        </div>
      </div>
  );
}