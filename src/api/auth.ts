const isJson = (res: Response) =>
  res.headers.get('content-type')?.includes('application/json') ?? false;

export const registerUser = async (username: string, password: string, email: string, birth_date: string) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email, birth_date }),
  });
  if (!isJson(res)) throw new Error('Errore del server');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registrazione fallita');
  return data;
};

export const verifyEmail = async (email: string, code: string) => {
  const res = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  if (!isJson(res)) throw new Error('Errore del server');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Verifica fallita');
  return data;
};

export const resendVerificationCode = async (email: string) => {
  const res = await fetch('/api/auth/resend-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!isJson(res)) throw new Error('Errore del server');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Reinvio fallito');
  return data;
};

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

export const forgotPassword = async (email: string) => {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!isJson(res)) throw new Error('Errore del server');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Richiesta fallita');
  return data;
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  });
  if (!isJson(res)) throw new Error('Errore del server');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Reset fallito');
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
