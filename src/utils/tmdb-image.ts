const BASE_URL = 'https://image.tmdb.org/t/p';

// Using 'original' for the big Hero banner (highest quality)
export const getOriginalImage = (path: string | null) => {
  return path ? `${BASE_URL}/original${path}` : '';
};

// Using 'w500' for the row posters (faster loading)
export const getPosterImage = (path: string | null) => {
  return path ? `${BASE_URL}/w500${path}` : '';
};