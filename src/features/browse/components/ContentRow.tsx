import { useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Movie, TVShow } from '../../../types/tmdb';
import { getPosterImage } from '../../../utils/tmdb-image';

interface ContentRowProps {
    title: string;
    data: (Movie | TVShow)[];
    categoryPath?: string;
}

export function ContentRow({ title, data, categoryPath }: ContentRowProps) {
    const navigate = useNavigate();
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { clientWidth } = rowRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5;
            rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="relative px-6 md:px-12 group/row">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <h2
                    onClick={() => categoryPath && navigate(`/category/${categoryPath}`)}
                    className={`text-lg md:text-xl font-bold text-white flex items-center gap-1 ${categoryPath ? 'cursor-pointer hover:text-[#e5a00d] transition-colors' : ''}`}
                >
                    {title}
                    {categoryPath && <ChevronRight className="w-4 h-4 text-[#e5a00d] opacity-0 group-hover/row:opacity-100 transition-opacity -ml-1 translate-x-0 group-hover/row:translate-x-1" />}
                </h2>
            </div>

            {/* Navigation Arrows (Desktop Only) */}
            <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full items-center justify-center text-white opacity-0 group-hover/row:opacity-100 hover:bg-[#e5a00d] hover:text-black transition-all active:scale-95 disabled:opacity-0"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full items-center justify-center text-white opacity-0 group-hover/row:opacity-100 hover:bg-[#e5a00d] hover:text-black transition-all active:scale-95"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Cards Row */}
            <div
                ref={rowRef}
                className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            >
                {data.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => navigate(`/${'title' in item ? 'movie' : 'tv'}/${item.id}`)}
                        className="flex-none w-[140px] md:w-[180px] snap-start cursor-pointer group/card"
                    >
                        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 relative shadow-md transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-xl group-hover/card:z-10 ring-1 ring-white/5 group-hover/card:ring-[#e5a00d]">
                            <img
                                src={getPosterImage(item.poster_path)}
                                alt={(item as Movie).title}
                                className="w-full h-full object-cover transition-opacity duration-300"
                                loading="lazy"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}