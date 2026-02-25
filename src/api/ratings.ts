import type { Rating } from '../constants';

const isJson = (res: Response) =>
  res.headers.get('content-type')?.includes('application/json') ?? false;

export const getRatings = async (): Promise<Rating[]> => {
  const res = await fetch('/api/ratings');
  if (!res.ok || !isJson(res)) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const saveRating = async (
  rating: Partial<Rating> & { night_id: string; artist_name: string }
): Promise<boolean> => {
  const res = await fetch('/api/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rating),
  });
  return res.ok;
};
