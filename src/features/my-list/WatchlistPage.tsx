import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useWatchlist } from '../../stores/useWatchlist';
import { getPosterImage } from '../../utils/tmdb-image';
import type { Movie, TVShow } from '../../types/tmdb';

export function WatchlistPage() {
  const navigate = useNavigate();
  const { items } = useWatchlist();

  return (
    <div className="min-h-screen bg-[#1C1F26] text-white pb-20">
      <div className="container mx-auto px-6 md:px-12 pt-12">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
             onClick={() => navigate('/')}
             className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">My Watchlist</h1>
          <span className="text-gray-400 text-lg mt-2">({items.length})</span>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-4xl">📺</span>
            </div>
            <h2 className="text-2xl font-semibold">Your watchlist is empty</h2>
            <p className="text-gray-400 max-w-md">
              Movies and TV shows you add to your watchlist will appear here.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#e5a00d] text-black font-bold px-6 py-2 rounded-full hover:bg-[#ffb41f] transition"
            >
              Browse Content
            </button>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/${'title' in item ? 'movie' : 'tv'}/${item.id}`)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-lg bg-gray-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-[#e5a00d]">
                  <img
                    src={getPosterImage(item.poster_path)}
                    alt={(item as Movie).title || (item as TVShow).name}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  {/* Remove Button Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      View Details
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-200 truncate group-hover:text-white">
                  {(item as Movie).title || (item as TVShow).name}
                </h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}