import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Movie, TVShow } from '../../../types/tmdb';
import { getPosterImage } from '../../../utils/tmdb-image';

interface ContentRowProps {
  title: string;
  data: (Movie | TVShow)[];
  categoryPath?: string; // Made optional
}

export function ContentRow({ title, data, categoryPath }: ContentRowProps) {
  const navigate = useNavigate();

  // Helper to detect type
  const getMediaType = (item: Movie | TVShow) => {
    if (item.media_type) return item.media_type;
    return 'name' in item ? 'tv' : 'movie';
  };

  return (
    <div className="space-y-4 px-6 md:px-12 my-10">
      {/* Clickable Header */}
      <div 
        onClick={() => categoryPath && navigate(`/category/${categoryPath}`)}
        className={`flex items-center gap-2 group w-fit ${categoryPath ? 'cursor-pointer' : ''}`}
      >
        <h2 className="text-xl md:text-2xl font-bold text-gray-100 group-hover:text-[#E5A00D] transition-colors">
          {title}
        </h2>
        {categoryPath && <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#E5A00D] transition-colors" />}
      </div>

      <div className="flex overflow-x-auto gap-5 pb-8 pt-4 scrollbar-hide snap-x snap-mandatory">
        {data.map((item) => (
          <div 
            key={item.id}
            // FIXED: Navigate to the correct detail page
            onClick={() => navigate(`/${getMediaType(item)}/${item.id}`)}
            className="flex-none w-[160px] md:w-[180px] snap-start group/card cursor-pointer flex flex-col gap-3"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-lg bg-gray-800 transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-2xl group-hover/card:ring-2 group-hover/card:ring-white/50">
              <img
                src={getPosterImage(item.poster_path)}
                alt={(item as Movie).title || (item as TVShow).name}
                className="w-full h-full object-cover opacity-90 group-hover/card:opacity-100 transition-opacity"
                loading="lazy"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-200 truncate group-hover/card:text-white transition-colors">
                {(item as Movie).title || (item as TVShow).name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}