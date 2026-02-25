import type { Compagnia } from '../constants';

const isJson = (res: Response) =>
  res.headers.get('content-type')?.includes('application/json') ?? false;

export const getCompagnie = async (): Promise<Compagnia[]> => {
  const res = await fetch('/api/compagnie');
  if (!res.ok || !isJson(res)) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export const createCompagnia = async (name: string) => {
  const res = await fetch('/api/compagnie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const data = isJson(res) ? await res.json() : {};
    throw new Error(data.error || 'Failed to create compagnia');
  }
  return res.json();
};

export const joinCompagnia = async (code: string) => {
  const res = await fetch('/api/compagnie/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const data = isJson(res) ? await res.json() : {};
    throw new Error(data.error || 'Failed to join compagnia');
  }
};

export const getCompagniaRatings = async (id: string) => {
  const res = await fetch(`/api/compagnie/${id}/ratings`);
  if (!res.ok || !isJson(res)) return null;
  return res.json();
};
