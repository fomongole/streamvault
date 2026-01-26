export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  media_type: 'movie';
  adult: boolean;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  release_date: string;
  vote_average: number;
  vote_count: number;
  // Detail fields
  runtime?: number;
  status?: string; // e.g., "Released"
  genres?: { id: number; name: string }[];
  credits?: Credits;
  similar?: PaginatedResponse<Movie>;
  videos?: { results: Video[] };
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  media_type: 'tv';
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  // Detail fields
  episode_run_time?: number[];
  number_of_seasons?: number; // Added this
  status?: string;            // Added this (e.g., "Ended", "Returning Series")
  genres?: { id: number; name: string }[];
  credits?: Credits;
  similar?: PaginatedResponse<TVShow>;
  videos?: { results: Video[] };
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  combined_credits: {
    cast: (Movie | TVShow)[];
  };
}