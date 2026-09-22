// Title, subtitle and page-specific CSS class for every page that lives inside AppLayout.
// `subtitle` may be a function of the signed-in user.

const PAGE_META = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: (user) => `Welcome back, ${user?.firstName || user?.userName || ''}`.trim(),
  },
  '/beneficiaries': {
    title: 'Beneficiaries',
    subtitle: 'Manage your transfer recipients',
    className: 'beneficiary-management',
  },
  '/investments': {
    title: 'Investments',
    subtitle: 'Practice with a simulated stock portfolio',
    className: 'investment-plans',
  },
  '/savings': {
    title: 'Savings',
    subtitle: 'Build your financial future with smart savings',
    className: 'savings-management',
  },
  '/ledger': {
    title: 'Ledger',
    subtitle: 'View accounting entries and account statement.',
  },
  '/notifications': {
    title: 'Notifications',
    subtitle: 'Track activity alerts and control email preference by category.',
  },
  '/profile': {
    title: 'My Profile',
    subtitle: 'Manage your account information securely',
    className: 'profile-page',
  },
  '/admin': {
    title: 'Admin Dashboard',
    subtitle: 'Platform Overview & Management',
    className: 'admin-dashboard-page',
    variant: 'admin',
  },
};

const normalizePath = (pathname) => String(pathname || '').replace(/\/+$/, '') || '/';

export const getPageMeta = (pathname, user) => {
  const meta = PAGE_META[normalizePath(pathname)] || { title: 'Zurich Bank', subtitle: '' };

  return {
    title: meta.title,
    subtitle: typeof meta.subtitle === 'function' ? meta.subtitle(user) : meta.subtitle,
    className: meta.className || '',
    variant: meta.variant || 'user',
  };
};

export default PAGE_META;
