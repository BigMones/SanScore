export interface StreamingRating {
  id?: number;
  user_id?: number;
  username?: string;
  artist_name: string;
  song_name: string;
  score: number;
}

export const getStreamingRatings = async (): Promise<StreamingRating[]> => {
  const res = await fetch('/api/streaming-ratings');
  if (!res.ok) return [];
  return res.json();
};

export const saveStreamingRating = async (
  artist_name: string,
  song_name: string,
  score: number,
): Promise<boolean> => {
  const res = await fetch('/api/streaming-ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artist_name, song_name, score }),
  });
  return res.ok;
};

export const getCompagniaStreamingRatings = async (
  compagniaId: string,
): Promise<{ members: any[]; ratings: StreamingRating[] } | null> => {
  const res = await fetch(`/api/compagnie/${compagniaId}/streaming-ratings`);
  if (!res.ok) return null;
  return res.json();
};
