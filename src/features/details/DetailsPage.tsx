import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Check, Plus, Share2, ChevronLeft, Star, Loader2, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { tmdbApi } from '../../lib/tmdb';
import { getOriginalImage, getPosterImage } from '../../utils/tmdb-image';
import { ContentRow } from '../browse/components/ContentRow';
import { useWatchlist } from '../../stores/useWatchlist';
import type { Movie, TVShow, CastMember, Video } from '../../types/tmdb';

export function DetailsPage() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);
  const [showNoTrailerModal, setShowNoTrailerModal] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

  const { addItem, removeItem, isInWatchlist } = useWatchlist();
  const isSaved = id ? isInWatchlist(Number(id)) : false;

  // 1. Fetch Main Content
  const { data: content, isLoading } = useQuery({
    queryKey: ['details', type, id],
    queryFn: () => tmdbApi.getContentDetails(type as 'movie' | 'tv', Number(id)),
    enabled: !!id && !!type,
  });

  // 2. Fetch Watch Providers
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
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
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

  const countryProviders = providers?.US || providers?.GB || null;
  const streamingServices = countryProviders?.flatrate || [];

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
      <div className="min-h-screen bg-[#121212] text-white font-sans pb-24 md:pb-20 relative">

        {/*  MOBILE NAVBAR / BACK BUTTON */}
        <div className="fixed top-0 left-0 w-full z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <button
              onClick={() => navigate(-1)}
              className="pointer-events-auto p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* HERO SECTION */}
        <div className="relative w-full">
          {/* Backdrop Image */}
          <div className="relative h-[55vh] md:h-[75vh] w-full overflow-hidden">
            <img
                src={getOriginalImage(content.backdrop_path)}
                alt=""
                className="w-full h-full object-cover opacity-80 md:opacity-60"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/80 via-transparent to-transparent hidden md:block" />
          </div>

          {/* Content Container - Overlaps the backdrop on mobile using negative margin */}
          <div className="relative z-10 container mx-auto px-4 md:px-12 -mt-32 md:-mt-64 flex flex-col md:flex-row gap-6 md:gap-10">

            {/* POSTER (Visible on Mobile now) */}
            <div className="flex-shrink-0 mx-auto md:mx-0 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <div className="w-40 md:w-72 aspect-[2/3] rounded-lg overflow-hidden border-2 border-white/10 bg-gray-800">
                <img
                    src={getPosterImage(content.poster_path)}
                    alt={title}
                    className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* TEXT INFO */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-24">

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-3">
                {title}
              </h1>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-xs md:text-sm text-gray-300 font-medium mb-6">
                {status && status !== "Released" && (
                    <span className="px-2 py-0.5 rounded-md bg-gray-800 border border-gray-600 uppercase text-[10px] tracking-wider">{status}</span>
                )}
                {year && <span className="text-white">{year}</span>}
                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                {isMovie && runtime ? (
                    <span>{Math.floor(runtime / 60)}h {runtime % 60}m</span>
                ) : seasons ? (
                    <span>{seasons} {seasons === 1 ? 'Season' : 'Seasons'}</span>
                ) : null}
                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                <div className="flex items-center gap-1 text-[#e5a00d]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{content.vote_average.toFixed(1)}</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="w-full max-w-md md:max-w-none flex flex-col md:flex-row gap-3 mb-8">
                <button
                    onClick={() => trailer ? setShowTrailer(true) : setShowNoTrailerModal(true)} // FIXED: Trigger custom modal
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#e5a00d] text-black px-8 py-3.5 rounded-xl font-bold hover:bg-[#c4890b] transition active:scale-95 shadow-lg shadow-orange-500/20"
                >
                  <Play className="w-5 h-5 fill-black" /> {trailer ? 'Watch Trailer' : 'No Trailer'}
                </button>

                <div className="flex gap-3 justify-center">
                  <button
                      onClick={handleWatchlistToggle}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold border transition active:scale-95 ${
                          isSaved
                              ? 'bg-white text-black border-white'
                              : 'bg-white/5 border-white/20 hover:bg-white/10 text-white'
                      }`}
                  >
                    {isSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span className="md:hidden">{isSaved ? 'Added' : 'My List'}</span>
                    <span className="hidden md:inline">{isSaved ? 'In Watchlist' : 'Add to Watchlist'}</span>
                  </button>

                  <button className="p-3.5 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 active:scale-95 transition">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* OVERVIEW */}
              <div className="w-full max-w-3xl mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 hidden md:block">Overview</h3>
                <p className={`text-gray-300 text-sm md:text-lg leading-relaxed ${!isOverviewExpanded ? 'line-clamp-3 md:line-clamp-none' : ''}`}>
                  {content.overview}
                </p>
                <button
                    onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                    className="md:hidden mt-2 text-[#e5a00d] text-sm font-medium flex items-center gap-1"
                >
                  {isOverviewExpanded ? <>Show Less <ChevronUp className="w-4 h-4"/></> : <>Read More <ChevronDown className="w-4 h-4"/></>}
                </button>
              </div>

              {/* STREAMING PROVIDERS */}
              {streamingServices.length > 0 && (
                  <div className="flex flex-col items-center md:items-start gap-3 mb-8 w-full">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Available On</span>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      {streamingServices.map((provider: any) => (
                          <div key={provider.provider_id} className="group relative w-12 h-12 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10 cursor-pointer hover:scale-110 transition-transform">
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
            </div>
          </div>
        </div>

        {/* 2. CAST CARDS (Horizontal Scroll) */}
        <div className="container mx-auto px-4 md:px-12 py-8 border-t border-white/5 mt-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">Top Cast</h3>
          <div className="flex overflow-x-auto gap-4 pb-8 scrollbar-hide snap-x md:grid md:grid-cols-6 lg:grid-cols-8 md:overflow-visible">
            {content.credits?.cast.slice(0, 12).map((person: CastMember) => (
                <div key={person.id} onClick={() => navigate(`/person/${person.id}`)} className="flex-none w-28 md:w-auto snap-start cursor-pointer group">
                  <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-3 relative">
                    {person.profile_path ? (
                        <img src={getPosterImage(person.profile_path)} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-medium">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <h4 className="font-semibold text-sm truncate text-white group-hover:text-[#e5a00d] transition-colors">{person.name}</h4>
                  <p className="text-xs text-gray-400 truncate">{person.character}</p>
                </div>
            ))}
          </div>
        </div>

        {/* 3. SIMILAR CONTENT */}
        {content.similar && content.similar.results.length > 0 && (
            <div className="mt-4 px-4 md:px-0">
              <ContentRow title="More Like This" data={content.similar.results} categoryPath="similar" />
            </div>
        )}

        {/* 4. TRAILER MODAL */}
        {showTrailer && trailer && (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <button
                    onClick={() => setShowTrailer(false)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-[#e5a00d] hover:text-black text-white rounded-full transition-all z-10"
                >
                  <X className="w-6 h-6" />
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

        {/* 5. NO TRAILER MODAL (NEW) */}
        {showNoTrailerModal && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-[#1a1a1a] p-6 rounded-2xl max-w-sm w-full border border-white/10 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-[#e5a00d]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">No Trailer Available</h3>
                    <p className="text-gray-400 text-sm">
                      Sorry, we couldn't find a trailer for <span className="text-white font-medium">"{title}"</span> at this time.
                    </p>
                  </div>
                  <button
                      onClick={() => setShowNoTrailerModal(false)}
                      className="w-full bg-[#e5a00d] text-black font-bold py-3 rounded-xl hover:bg-[#c4890b] transition active:scale-95 mt-2"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}