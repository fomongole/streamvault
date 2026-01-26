import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Check, Bookmark, Share2, ChevronLeft, Star, Loader2, X } from 'lucide-react';
import { tmdbApi } from '../../lib/tmdb';
import { getOriginalImage, getPosterImage } from '../../utils/tmdb-image';
import { ContentRow } from '../browse/components/ContentRow';
import { useWatchlist } from '../../stores/useWatchlist';
import type { Movie, TVShow, CastMember, Video } from '../../types/tmdb';

export function DetailsPage() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  // Watchlist Hook
  const { addItem, removeItem, isInWatchlist } = useWatchlist();
  const isSaved = id ? isInWatchlist(Number(id)) : false;

  // 1. Fetch Main Content
  const { data: content, isLoading } = useQuery({
    queryKey: ['details', type, id],
    queryFn: () => tmdbApi.getContentDetails(type as 'movie' | 'tv', Number(id)),
    enabled: !!id && !!type,
  });

  // 2. Fetch Watch Providers (NEW)
  const { data: providers } = useQuery({
    queryKey: ['providers', type, id],
    queryFn: () => tmdbApi.getWatchProviders(type as 'movie' | 'tv', Number(id)),
    enabled: !!id && !!type,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading || !content) {
    return (
      <div className="min-h-screen bg-[#1C1F26] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#e5a00d] animate-spin" />
      </div>
    );
  }

  const isMovie = type === 'movie';
  const title = isMovie ? (content as Movie).title : (content as TVShow).name;
  const releaseDate = isMovie ? (content as Movie).release_date : (content as TVShow).first_air_date;
  const runtime = isMovie ? (content as Movie).runtime : (content as TVShow).episode_run_time?.[0];
  const year = releaseDate?.split('-')[0];
  const seasons = !isMovie ? (content as TVShow).number_of_seasons : null;
  const status = content.status;

  // Get US Providers (Change 'US' to your country code if needed, e.g., 'GB' for UK)
  // We prioritize 'flatrate' (streaming), then 'rent', then 'buy'
  const countryProviders = providers?.US || providers?.GB || null; 
  const streamingServices = countryProviders?.flatrate || [];

  // Find Trailer
  const trailer = content.videos?.results.find(
    (vid: Video) => vid.type === "Trailer" && vid.site === "YouTube"
  );

  const handleWatchlistToggle = () => {
    if (isSaved) {
      removeItem(content.id);
    } else {
      addItem(content as Movie | TVShow);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1F26] text-white font-sans pb-20">
      
      {/* 0. BACK BUTTON OVERLAY */}
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-md transition-all group"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* 1. BACKDROP HEADER */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
           <img 
             src={getOriginalImage(content.backdrop_path)} 
             alt="" 
             className="w-full h-full object-cover opacity-50 blur-sm scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#1C1F26] via-[#1C1F26]/60 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-r from-[#1C1F26] via-[#1C1F26]/40 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 h-full flex flex-col md:flex-row items-center md:items-end pb-12 gap-8">
          
          <div className="hidden md:block w-64 aspect-[2/3] rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/10 flex-shrink-0">
            <img src={getPosterImage(content.poster_path)} alt={title} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold drop-shadow-xl leading-tight">{title}</h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm md:text-base text-gray-300 font-medium">
              {status && <span className="px-2 py-0.5 rounded text-xs uppercase font-bold border border-gray-500 text-gray-400">{status}</span>}
              <span>{year}</span>
              {isMovie && runtime && <span>{Math.floor(runtime / 60)}h {runtime % 60}m</span>}
              {!isMovie && seasons && <span>{seasons} {seasons === 1 ? 'Season' : 'Seasons'}</span>}
              <span className="flex items-center gap-1 text-[#e5a00d]"><Star className="w-4 h-4 fill-current" /> {content.vote_average.toFixed(1)}</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <button 
                onClick={() => trailer ? setShowTrailer(true) : alert('No trailer available')}
                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" /> {trailer ? 'Watch Trailer' : 'No Trailer'}
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleWatchlistToggle}
                  className={`p-3 rounded-full border transition ${isSaved ? 'bg-[#e5a00d] border-[#e5a00d] text-black' : 'border-gray-500 hover:border-white hover:bg-white/10'}`} 
                  title={isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                  {isSaved ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
                <button className="p-3 rounded-full border border-gray-500 hover:border-white hover:bg-white/10 transition"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>
            
            {/* NEW: WHERE TO WATCH SECTION */}
            {streamingServices.length > 0 && (
              <div className="flex flex-col items-center md:items-start gap-2 animate-fade-in">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Streaming On</span>
                <div className="flex gap-3">
                  {streamingServices.map((provider: any) => (
                    <div key={provider.provider_id} className="w-10 h-10 rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10" title={provider.provider_name}>
                      <img 
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                        alt={provider.provider_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

             <p className="text-gray-300 text-lg leading-relaxed max-w-3xl line-clamp-3 md:line-clamp-none">{content.overview}</p>
          </div>
        </div>
      </div>

      {/* 2. CAST SECTION */}
      <div className="container mx-auto px-6 md:px-12 py-10">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">Cast of {title}</h3>
        <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x">
          {content.credits?.cast.slice(0, 15).map((person: CastMember) => (
            <div key={person.id} onClick={() => navigate(`/person/${person.id}`)} className="flex-none w-32 flex flex-col items-center gap-2 snap-start cursor-pointer group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/10 bg-gray-800 group-hover:ring-[#e5a00d] transition-all">
                {person.profile_path ? <img src={getPosterImage(person.profile_path)} alt={person.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Image</div>}
              </div>
              <div className="text-center group-hover:text-white transition-colors">
                <p className="font-semibold text-sm truncate w-full text-gray-200 group-hover:text-[#e5a00d]">{person.name}</p>
                <p className="text-xs text-gray-400 truncate w-full">{person.character}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SIMILAR TITLES */}
      {content.similar && content.similar.results.length > 0 && (
         <div className="mt-4">
             <ContentRow title="Titles You Might Like" data={content.similar.results} categoryPath="similar" />
         </div>
      )}

      {/* 4. TRAILER MODAL */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <button 
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 text-white hover:text-[#e5a00d] z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}