import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Loader2, Share2, Instagram } from 'lucide-react';
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
      <div className="min-h-screen bg-[#1C1F26] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#e5a00d] animate-spin" />
      </div>
    );
  }

  // Calculate age
  const age = person.birthday 
    ? new Date().getFullYear() - new Date(person.birthday).getFullYear() 
    : null;

  // Sort credits by popularity to show "Known For" best items first
  const knownFor = person.combined_credits.cast
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 15); // Top 15 items

  return (
    <div className="min-h-screen bg-[#1C1F26] text-white font-sans pb-20">
      {/* 1. Header Section */}
      <div className="container mx-auto px-6 md:px-12 pt-12 pb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          
          {/* Circular Avatar (Screenshot style) */}
          <div className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0 rounded-full overflow-hidden ring-4 ring-white/10 shadow-2xl mx-auto md:mx-0">
             {person.profile_path ? (
               <img 
                 src={getPosterImage(person.profile_path)} 
                 alt={person.name} 
                 className="w-full h-full object-cover"
               />
             ) : (
               <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">?</div>
             )}
          </div>

          {/* Actor Info */}
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">{person.name}</h1>
            
            <div className="text-gray-400 text-sm md:text-base flex flex-wrap gap-4">
               <span>{person.known_for_department}</span>
               {person.birthday && (
                 <>
                   <span>•</span>
                   <span>Born {person.birthday} {age && `(${age} years)`}</span>
                 </>
               )}
               {person.place_of_birth && (
                 <>
                   <span>•</span>
                   <span>{person.place_of_birth}</span>
                 </>
               )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition">
                <Share2 className="w-4 h-4" /> Share
              </button>
              {/* Fake Instagram button for UI match */}
              <button className="p-2 rounded-full border border-gray-600 hover:bg-white/10 transition">
                <Instagram className="w-5 h-5" />
              </button>
            </div>

            {/* Biography with "Read More" */}
            <div className="max-w-3xl">
              <p className={`text-gray-300 leading-relaxed ${!showFullBio && 'line-clamp-4'}`}>
                {person.biography || "No biography available."}
              </p>
              {person.biography && person.biography.length > 300 && (
                <button 
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="text-[#e5a00d] font-semibold mt-2 hover:underline"
                >
                  {showFullBio ? "Read Less" : "More >"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Known For Section */}
      {knownFor.length > 0 && (
        <div className="mt-8">
           <ContentRow 
             title="Known For" 
             data={knownFor} 
             // We don't pass categoryPath because we don't have a "view all" page for a specific actor yet
           />
        </div>
      )}
    </div>
  );
}