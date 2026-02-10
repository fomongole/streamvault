import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Loader2, Bookmark, Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useBrowseContent } from './hooks/useBrowseContent';
import { ContentRow } from './components/ContentRow';
import { tmdbApi } from '../../lib/tmdb';
import { getPosterImage, getOriginalImage } from '../../utils/tmdb-image';
import type { Movie, TVShow } from '../../types/tmdb';

export function Browse() {
  const navigate = useNavigate();
  const { trending, originals, action, comedy, horror, isLoading } = useBrowseContent();

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // --- FEATURED CONTENT (Stable Random Selection) ---
  const featured = useMemo(() => {
    if (!trending.data || trending.data.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * Math.min(5, trending.data.length));
    return trending.data[randomIndex];
  }, [trending.data]);

  // Search Query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => tmdbApi.searchContent(searchQuery),
    enabled: searchQuery.length > 2,
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleClickOutside = (e: MouseEvent) => {
      // Desktop search outside click
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      // Mobile search outside click
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchClick = (item: Movie | TVShow) => {
    const type = 'name' in item ? 'tv' : 'movie';
    navigate(`/${type}/${item.id}`);
    setShowResults(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  };

  const genres = [
    { name: "Action", id: 28 }, { name: "Comedy", id: 35 },
    { name: "Drama", id: 18 }, { name: "Sci-Fi", id: 878 },
    { name: "Horror", id: 27 }, { name: "Thriller", id: 53 }
  ];

  // Type Guard Helper
  const getTitle = (item: Movie | TVShow) => 'title' in item ? item.title : item.name;
  const getReleaseDate = (item: Movie | TVShow) => 'release_date' in item ? item.release_date : item.first_air_date;

  if (isLoading) return <div className="min-h-screen bg-[#121212] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#e5a00d] animate-spin" /></div>;

  return (
      <div className="min-h-screen pb-20 bg-[#121212] font-sans text-white">

        {/* 1. GLASSMORPHIC NAVBAR */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-4 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-[#121212]/90 backdrop-blur-md shadow-lg' : 'bg-transparent bg-gradient-to-b from-black/80 to-transparent'}`}>
          {/* Logo */}
          <div
              className="text-xl md:text-2xl font-black text-[#e5a00d] tracking-widest cursor-pointer hover:scale-105 transition-transform z-50"
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); }}
          >
            STREAM<span className="text-white">VAULT</span>
          </div>

          {/* DESKTOP Search Bar */}
          <div className="relative hidden md:block w-96 group" ref={searchRef}>
            <div className={`flex items-center bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-all ${showResults ? 'bg-[#121212] border-[#e5a00d] ring-1 ring-[#e5a00d]' : 'focus-within:bg-black/50 focus-within:border-gray-500'}`}>
              <Search className="w-4 h-4 text-gray-400 group-focus-within:text-[#e5a00d]" />
              <input
                  type="text"
                  placeholder="Titles, people, genres..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm ml-3 text-white placeholder:text-gray-400"
              />
              {searchQuery && <X className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />}
            </div>

            {/* Desktop Search Dropdown */}
            {showResults && searchQuery.length > 2 && (
                <div className="absolute top-full mt-3 left-0 w-full bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden max-h-[60vh] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                  {isSearching ? (
                      <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#e5a00d]" /></div>
                  ) : searchResults?.length ? (
                      searchResults.map((item) => (
                          <div key={item.id} onClick={() => handleSearchClick(item)} className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0">
                            <img src={getPosterImage(item.poster_path)} className="w-12 h-16 object-cover rounded shadow-md" alt="" />
                            <div>
                              <h4 className="font-bold text-sm text-gray-100 group-hover:text-[#e5a00d]">{getTitle(item)}</h4>
                              <span className="text-xs text-gray-500 font-medium">{getReleaseDate(item)?.split('-')[0] || 'N/A'}</span>
                            </div>
                          </div>
                      ))
                  ) : (
                      <div className="p-6 text-center text-gray-500 text-sm">No results found for "{searchQuery}"</div>
                  )}
                </div>
            )}
          </div>

          {/* MOBILE ACTIONS */}
          <div className="flex items-center gap-3 md:hidden">
            <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-2 rounded-full hover:bg-white/10 transition"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => navigate('/watchlist')} className="p-2 rounded-full hover:bg-white/10 transition">
              <Bookmark className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* DESKTOP WATCHLIST BUTTON */}
          <button onClick={() => navigate('/watchlist')} className="hidden md:block p-2 rounded-full hover:bg-white/10 transition group" title="Watchlist">
            <Bookmark className="w-6 h-6 text-gray-300 group-hover:text-[#e5a00d]" />
          </button>
        </nav>

        {/* MOBILE SEARCH OVERLAY */}
        {isMobileSearchOpen && (
            <div className="fixed inset-x-0 top-[60px] z-40 bg-[#121212] border-b border-white/10 p-4 animate-in slide-in-from-top-2 md:hidden" ref={mobileSearchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                    autoFocus
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-white placeholder:text-gray-400 focus:ring-1 focus:ring-[#e5a00d]"
                />
                {searchQuery && (
                    <X
                        className="absolute right-3 top-3 w-4 h-4 text-gray-400"
                        onClick={() => setSearchQuery('')}
                    />
                )}
              </div>

              {/* Mobile Search Results */}
              {searchQuery.length > 2 && (
                  <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {isSearching ? (
                        <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#e5a00d]" /></div>
                    ) : searchResults?.length ? (
                        <div className="space-y-2">
                          {searchResults.map((item) => (
                              <div key={item.id} onClick={() => handleSearchClick(item)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 active:bg-white/10">
                                <img src={getPosterImage(item.poster_path)} className="w-10 h-14 object-cover rounded bg-gray-800" alt="" />
                                <div>
                                  <h4 className="font-medium text-sm text-gray-100">{getTitle(item)}</h4>
                                  <span className="text-xs text-gray-500">{getReleaseDate(item)?.split('-')[0] || 'N/A'}</span>
                                </div>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 text-sm py-4">No results found</div>
                    )}
                  </div>
              )}
            </div>
        )}

        {/* 2. IMMERSIVE HERO SECTION */}
        {featured && (
            <div className="relative h-[85vh] w-full overflow-hidden">
              <div className="absolute inset-0">
                <img src={getOriginalImage(featured.backdrop_path)} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/90 via-[#121212]/40 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col gap-4 max-w-2xl">
            <span className="text-[#e5a00d] font-bold tracking-widest text-xs uppercase bg-black/50 backdrop-blur-md px-3 py-1 rounded-md w-fit">
              #1 in Trending
            </span>
                <h1 className="text-4xl md:text-6xl font-black leading-tight drop-shadow-2xl">
                  {getTitle(featured)}
                </h1>
                <p className="text-gray-300 text-sm md:text-lg line-clamp-3 drop-shadow-md">
                  {featured.overview}
                </p>
                <div className="flex gap-4 mt-4">
                  <button
                      onClick={() => navigate(`/${'title' in featured ? 'movie' : 'tv'}/${featured.id}`)}
                      className="flex items-center gap-2 bg-[#e5a00d] text-black px-6 md:px-8 py-3 rounded-xl font-bold hover:bg-[#ffb41f] transition active:scale-95 text-sm md:text-base"
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-black" /> Play Now
                  </button>
                  <button
                      onClick={() => navigate(`/${'title' in featured ? 'movie' : 'tv'}/${featured.id}`)}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 md:px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition active:scale-95 text-sm md:text-base"
                  >
                    <Info className="w-4 h-4 md:w-5 md:h-5" /> More Info
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* 3. GENRE PILLS - Responsive Spacing */}
        <div className="px-4 md:px-12 mt-4 md:-mt-8 relative z-20 mb-8 md:mb-12">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mask-linear-fade">
            {genres.map((genre) => (
                <button
                    key={genre.id}
                    onClick={() => navigate(`/genre/${genre.id}`)}
                    className="flex-none px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm font-medium text-gray-300 hover:bg-[#e5a00d] hover:text-black hover:border-[#e5a00d] transition-all active:scale-95 whitespace-nowrap"
                >
                  {genre.name}
                </button>
            ))}
          </div>
        </div>

        {/* 4. CONTENT STACKS */}
        <div className="space-y-8 md:space-y-16 pb-10">
          <ContentRow title="Trending Now" data={trending.data || []} categoryPath="trending" />
          <ContentRow title="Originals" data={originals.data || []} categoryPath="originals" />
          <ContentRow title="Action Movies" data={action.data || []} categoryPath="action" />
          <ContentRow title="Comedy Hits" data={comedy.data || []} categoryPath="comedy" />
          <ContentRow title="Horror & Thriller" data={horror.data || []} categoryPath="horror" />
        </div>
      </div>
  );
}