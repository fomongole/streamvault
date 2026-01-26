import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useBrowseContent } from './hooks/useBrowseContent';
import { ContentRow } from './components/ContentRow';
import { tmdbApi } from '../../lib/tmdb';
import { getPosterImage } from '../../utils/tmdb-image';
import type { Movie, TVShow } from '../../types/tmdb';

export function Browse() {
  const navigate = useNavigate();
  const { trending, originals, action, comedy, horror, isLoading } = useBrowseContent();
  
  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch Search Results
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => tmdbApi.searchContent(searchQuery),
    enabled: searchQuery.length > 2, 
  });

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = (item: Movie | TVShow) => {
    const type = 'name' in item ? 'tv' : 'movie';
    navigate(`/${type}/${item.id}`);
    setShowResults(false);
    setSearchQuery('');
  };

  // ... Genres Array ...
  const genres = [
    { name: "Action", id: 28 },
    { name: "Animation", id: 16 },
    { name: "Comedy", id: 35 },
    { name: "Crime", id: 80 },
    { name: "Documentary", id: 99 },
    { name: "Drama", id: 18 },
    { name: "Horror", id: 27 },
    { name: "Sci-Fi", id: 878 },
    { name: "Thriller", id: 53 },
    { name: "Western", id: 37 }
  ];

  if (isLoading) return <div className="min-h-screen bg-[#1C1F26]" />;

  return (
    <div className="min-h-screen pb-20 bg-[#1C1F26] font-sans text-gray-100">
      
      {/* 1. TOP NAVIGATION BAR */}
      <div className="sticky top-0 z-50 bg-[#1C1F26]/95 backdrop-blur-sm px-6 md:px-12 py-4 flex items-center justify-between border-b border-white/5">
        <div 
          className="text-2xl font-bold text-[#e5a00d] tracking-wider uppercase cursor-pointer"
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }}
        >
          StreamVault
        </div>
        
        {/* --- LIVE SEARCH INPUT --- */}
        <div className="relative hidden md:block w-96" ref={searchRef}>
          <input 
            type="text" 
            placeholder="Search for movies, TV shows..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="w-full bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e5a00d]/50 focus:bg-white/20 transition-all placeholder:text-gray-400"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          {searchQuery && (
            <X 
              className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 cursor-pointer hover:text-white"
              onClick={() => setSearchQuery('')} 
            />
          )}

          {/* --- SEARCH DROPDOWN RESULTS --- */}
          {showResults && searchQuery.length > 2 && (
            <div className="absolute top-full mt-2 left-0 w-full bg-[#2A2E32] rounded-xl shadow-2xl border border-white/10 overflow-hidden max-h-[400px] overflow-y-auto scrollbar-hide">
              
              {/* LOADING STATE */}
              {isSearching ? (
                <div className="p-6 flex justify-center items-center text-[#e5a00d]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleSearchClick(item)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                  >
                    <div className="w-10 h-14 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                       <img 
                         src={getPosterImage(item.poster_path)} 
                         alt="" 
                         className="w-full h-full object-cover"
                       />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white leading-tight">
                        {(item as Movie).title || (item as TVShow).name}
                      </h4>
                      <span className="text-xs text-gray-400 capitalize">
                        {(item as Movie).release_date?.split('-')[0] || (item as TVShow).first_air_date?.split('-')[0] || 'N/A'} • {item.media_type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">No results found</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* WATCHLIST BUTTON */}
          <button 
            onClick={() => navigate('/watchlist')}
            className="flex items-center gap-2 text-gray-300 font-medium hover:text-[#e5a00d] transition"
          >
            <Bookmark className="w-5 h-5" />
            <span className="hidden md:inline">Watchlist</span>
          </button>
          {/* Sign In Button REMOVED */}
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <div className="px-6 md:px-12 pt-10 pb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome to StreamVault!
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          Stream thousands of movies and TV shows for free. No credit card required.
        </p>

        {/* 3. GENRE CHIPS */}
        <div className="mt-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              Browse by Genre <span className="text-gray-500 text-sm font-normal">On Demand</span>
            </h3>
          </div>
          <div className="flex flex-wrap gap-3 w-full">
            {genres.map((genre) => (
              <button 
                key={genre.id}
                onClick={() => navigate(`/genre/${genre.id}`)}
                className="flex-grow text-center px-6 py-3 rounded-full bg-white/5 hover:bg-white/20 text-gray-300 font-medium transition-all border border-white/5 hover:border-gray-500 hover:text-white active:scale-95"
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. CONTENT ROWS */}
      <div className="space-y-4"> 
        {trending.data && <ContentRow title="Trending Now" data={trending.data} categoryPath="trending" />}
        {originals.data && <ContentRow title="Binge-Worthy Shows" data={originals.data} categoryPath="originals" />}
        {action.data && <ContentRow title="Adrenaline Rush" data={action.data} categoryPath="action" />}
        {comedy.data && <ContentRow title="Comedy Favorites" data={comedy.data} categoryPath="comedy" />}
        {horror.data && <ContentRow title="Late Night Scares" data={horror.data} categoryPath="horror" />}
      </div>
    </div>
  );
}