import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Star, Play, Bookmark, Film } from 'lucide-react';
import { useWatchlist } from '../../stores/useWatchlist';
import { getPosterImage } from '../../utils/tmdb-image';
import type { Movie, TVShow } from '../../types/tmdb';

export function WatchlistPage() {
  const navigate = useNavigate();
  const { items, removeItem } = useWatchlist();

  // Helper to safely get title/name
  const getTitle = (item: Movie | TVShow) => 'title' in item ? item.title : item.name;
  const getDate = (item: Movie | TVShow) => 'release_date' in item ? item.release_date : item.first_air_date;
  const getType = (item: Movie | TVShow) => 'title' in item ? 'movie' : 'tv';

  const handleRemove = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent navigating to the detail page
    removeItem(id);
  };

  return (
      <div className="min-h-screen bg-[#121212] text-white pb-20 relative overflow-x-hidden">

        {/* 1. Abstract Background Mesh (Consistent with ActorPage) */}
        <div className="fixed top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-gray-900 to-[#121212] z-0 pointer-events-none" />
        <div className="fixed top-20 right-0 w-96 h-96 bg-[#e5a00d]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-12">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <button
                  onClick={() => navigate(-1)}
                  className="p-3 bg-white/5 rounded-full hover:bg-white/10 hover:scale-105 transition-all group border border-white/5"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                  My Watchlist
                  <span className="text-lg font-medium text-gray-500 self-end mb-1">
                  {items.length} {items.length === 1 ? 'Title' : 'Titles'}
                </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 z-10 relative">
                    <Bookmark className="w-10 h-10 text-gray-600" />
                  </div>
                  <div className="absolute inset-0 bg-[#e5a00d] blur-[40px] opacity-20" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Your watchlist is empty</h2>
                  <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                    Movies and TV shows you add to your list will appear here. <br/>
                    Start exploring to find your next favorite.
                  </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="mt-4 flex items-center gap-2 bg-[#e5a00d] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#ffb41f] transition active:scale-95 shadow-lg shadow-orange-500/10"
                >
                  <Film className="w-5 h-5" /> Browse Content
                </button>
              </div>
          ) : (
              /* Premium Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 pb-10">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => navigate(`/${getType(item)}/${item.id}`)}
                        className="group cursor-pointer flex flex-col gap-3 relative"
                    >
                      {/* Poster Card */}
                      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 relative shadow-lg ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-[#e5a00d] z-10">
                        <img
                            src={getPosterImage(item.poster_path)}
                            alt={getTitle(item)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />

                        {/* Top Right: Delete Button (Only visible on hover/touch) */}
                        <button
                            onClick={(e) => handleRemove(e, item.id)}
                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md text-white/70 hover:text-red-500 hover:bg-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-30"
                            title="Remove from Watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Bottom: Metadata Overlay (Gradient) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">

                            {/* Rating */}
                            <p className="text-[#e5a00d] font-bold text-lg flex items-center gap-1.5 mb-1">
                              <Star className="w-4 h-4 fill-current" /> {item.vote_average?.toFixed(1)}
                            </p>

                            {/* Meta Tags */}
                            <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                              <span>{getDate(item)?.split('-')[0] || 'N/A'}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-500" />
                              <span className="uppercase">{getType(item) === 'tv' ? 'TV Series' : 'Movie'}</span>
                            </div>

                            {/* View Details CTA */}
                            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-white/90">
                              <Play className="w-3 h-3 fill-current" /> View Details
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Title Below */}
                      <h3 className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors px-1">
                        {getTitle(item)}
                      </h3>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}