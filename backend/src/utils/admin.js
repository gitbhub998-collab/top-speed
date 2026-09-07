const DEFAULT_ADMIN_EMAILS = [];

export const normalizeAdminEmailList = (value) => {
  if (!value) return DEFAULT_ADMIN_EMAILS;

  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

export const getConfiguredAdminEmails = () => {
  const configured = process.env.ADMIN_EMAILS || '';
  const normalized = normalizeAdminEmailList(configured);
  return normalized.length > 0 ? normalized : DEFAULT_ADMIN_EMAILS;
};

export const isAdminUser = (user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const email = user.email?.toLowerCase();
  if (!email) return false;
  return getConfiguredAdminEmails().includes(email);
};

export const resolveUserRole = (user) => {
  return isAdminUser(user) ? 'admin' : user?.role || 'user';
};
