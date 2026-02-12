import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Loader2, Share2, Globe, MapPin, Calendar, Clock } from 'lucide-react';
import { tmdbApi } from '../../lib/tmdb';
import { getPosterImage } from '../../utils/tmdb-image';
import { ContentRow } from '../browse/components/ContentRow';

export function ActorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', id],
    queryFn: () => tmdbApi.getPerson(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading || !person) {
    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#e5a00d] animate-spin" />
        </div>
    );
  }

  const age = person.birthday
      ? new Date().getFullYear() - new Date(person.birthday).getFullYear()
      : null;

  // Sort credits by popularity
  const knownFor = person.combined_credits.cast
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 15);

  return (
      <div className="min-h-screen bg-[#121212] text-white font-sans pb-20 overflow-x-hidden relative">

        {/* 1. Abstract Background Mesh */}
        <div className="fixed top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-gray-900 to-[#121212] z-0 pointer-events-none" />
        <div className="fixed -top-20 -right-20 w-96 h-96 bg-[#e5a00d]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed top-40 -left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-12">
          {/* Back Button */}
          <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors w-fit"
          >
            <div className="p-2 bg-white/5 rounded-full group-hover:bg-[#e5a00d] group-hover:text-black transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm tracking-wide">Back</span>
          </button>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

            {/* LEFT COLUMN: Avatar & Quick Actions */}
            <div className="flex flex-col items-center lg:items-start w-full lg:w-auto">
              <div className="relative w-48 h-48 md:w-72 md:h-72 mb-6">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 rotate-3 group hover:rotate-0 transition-transform duration-500 ease-out bg-gray-800">
                  {person.profile_path ? (
                      <img
                          src={getPosterImage(person.profile_path)}
                          alt={person.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600">?</div>
                  )}
                </div>
                {/* Decorative blurred backdrop behind image */}
                <div className="absolute inset-0 bg-[#e5a00d] blur-[40px] opacity-20 -z-10 rounded-full" />
              </div>

              <div className="flex gap-3 w-full max-w-[300px]">
                <button className="flex-1 bg-white text-black py-2.5 rounded-xl font-bold hover:bg-[#e5a00d] transition-colors text-sm shadow-lg shadow-white/5">
                  Follow
                </button>
                <button className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors border border-white/5">
                  <Share2 className="w-5 h-5" />
                </button>
                {person.homepage && (
                    <a href={person.homepage} target="_blank" rel="noreferrer" className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors border border-white/5">
                      <Globe className="w-5 h-5" />
                    </a>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Info & Bio */}
            <div className="flex-1 w-full text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-black mb-3 tracking-tight text-white drop-shadow-sm">
                {person.name}
              </h1>
              <p className="text-[#e5a00d] font-bold tracking-widest uppercase text-xs md:text-sm mb-8">
                {person.known_for_department}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-bold">Born</span>
                  </div>
                  <p className="font-semibold text-sm md:text-base">{person.birthday || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-bold">Age</span>
                  </div>
                  <p className="font-semibold text-sm md:text-base">{age || 'N/A'} Years</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors col-span-2 md:col-span-1">
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-400 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-bold">Origin</span>
                  </div>
                  <p className="font-semibold text-sm md:text-base truncate">{person.place_of_birth || 'N/A'}</p>
                </div>
              </div>

              {/* Biography */}
              <div className="relative">
                <h3 className="text-lg font-bold mb-3 text-white flex items-center justify-center lg:justify-start gap-2">
                  Biography
                </h3>
                <div className={`prose prose-invert max-w-none text-gray-300 text-sm md:text-base leading-relaxed ${!showFullBio && 'line-clamp-4 mask-linear-fade'}`}>
                  {person.biography || "No biography available for this actor."}
                </div>
                {person.biography && person.biography.length > 300 && (
                    <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="mt-3 text-[#e5a00d] text-sm font-bold hover:text-white transition-colors flex items-center gap-1 mx-auto lg:mx-0"
                    >
                      {showFullBio ? "Read Less" : "Read More"}
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Known For Section (Credits) */}
        <div className="relative z-10 mt-16 border-t border-white/5 pt-8">
          {knownFor.length > 0 && (
              <ContentRow
                  title={`Starring ${person.name}`}
                  data={knownFor}
              />
          )}
        </div>
      </div>
  );
}