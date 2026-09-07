const getAdminEmails = () => {
  const configured = (import.meta.env.VITE_ADMIN_EMAILS || 'belalmohamedyousry@gmail.com').trim();
  return configured
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

export const isAdminUser = (user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const email = user.email?.toLowerCase();
  return Boolean(email && getAdminEmails().includes(email));
};