const isJson = (res: Response) =>
  res.headers.get('content-type')?.includes('application/json') ?? false;

export const loginUser = async (username: string, password: string) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!isJson(res)) throw new Error('Errore del server');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login fallito');
  return data;
};

export const registerUser = async (username: string, password: string) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!isJson(res)) throw new Error('Errore del server');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registrazione fallita');
  return data;
};

export const logoutUser = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
};

export const getCurrentUser = async () => {
  const res = await fetch('/api/auth/me');
  if (!res.ok || !isJson(res)) return null;
  return res.json();
};
