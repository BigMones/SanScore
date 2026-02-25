export const updateProfile = async (bio: string, profile_image: string): Promise<boolean> => {
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio, profile_image }),
  });
  return res.ok;
};
