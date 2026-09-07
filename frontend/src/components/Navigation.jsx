import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Settings, Lock, Menu, X } from 'lucide-react';
import { isAdminUser } from '../utils/adminAccess';

const AUTHENTICATION_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/register',
  '/verify-otp',
  '/verify',
  '/verify-email',
  '/otp',
];

export const Navigation = ({ onSettingsClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticationRoute = AUTHENTICATION_ROUTES.includes(location.pathname);

  const isAdmin = isAdminUser(user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Cars', to: '/cars' },
    { label: 'Service', to: '/service-maintenance' },
    { label: 'Modifications', to: '/cars-editing' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = user?.name?.trim() || 'Driver';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const isActive = (path) => path === '/admin'
    ? ['/admin', '/admin/dashboard'].includes(location.pathname)
    : location.pathname === path;

  const renderNavItem = (item) => (
    <Link
      key={item.to}
      to={item.to}
      className={`group relative flex items-center px-3 py-2 text-sm font-semibold transition duration-200 ${
        isActive(item.to) ? 'text-orange-200' : 'text-slate-300 hover:text-white'
      }`}
    >
      {item.label}
      <span
        className={`absolute inset-x-3 bottom-0 h-0.5 origin-left bg-orange-300 transition-transform duration-200 ${
          isActive(item.to) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
      />
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#08111c]/90 shadow-[0_12px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <Link to={user ? '/home' : '/'} className="group flex min-w-0 items-center gap-3 transition duration-300 hover:opacity-90 active:scale-[0.98]">
          <span className="min-w-0">
            <img
              src="/images/logo.jpg"
              alt="TOP SPEED Logo"
              className="h-auto w-24 object-contain object-left mix-blend-screen transition duration-300 group-hover:brightness-110 sm:w-40"
            />
            <span className="mt-0.5 hidden text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-slate-500 sm:block">Performance / Craft</span>
          </span>
        </Link>

        {!isAuthenticationRoute && (
          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
            {navItems.map(renderNavItem)}
            {isAdmin && (
              <Link
                to="/admin" 
                className={`group relative flex items-center gap-2 px-3 py-2 text-sm font-semibold transition duration-200 ${isActive('/admin') ? 'text-orange-200' : 'text-orange-300 hover:text-orange-100'}`}
              >
                <Lock size={16} />
                Dashboard
                <span className={`absolute inset-x-3 bottom-0 h-0.5 origin-left bg-orange-300 transition-transform duration-200 ${isActive('/admin') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-300 text-xs font-black text-[#08111c]">
                  {initials || 'D'}
                </span>
                <span className="max-w-[9rem] leading-tight">
                  <span className="block truncate text-sm font-bold text-white">{displayName}</span>
                  <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{isAdmin ? 'Administrator' : 'Customer'}</span>
                </span>
              </div>
              <button
                onClick={onSettingsClick}
                className="flex items-center justify-center rounded-full border border-transparent p-2.5 text-slate-400 transition duration-200 hover:border-white/10 hover:bg-white/5 hover:text-orange-300"
                title="Settings"
                aria-label="Open account settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="hidden items-center justify-center rounded-full border border-transparent p-2.5 text-slate-400 transition duration-200 hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300 sm:flex"
                title="Logout"
                aria-label="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : null}
          {user && !isAuthenticationRoute && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
              className="flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] p-2.5 text-slate-300 transition hover:border-orange-300/40 hover:text-orange-300 md:hidden"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          )}
        </div>
      </div>
      {user && !isAuthenticationRoute && isMobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#0d1b2a] px-3 py-4 md:hidden sm:px-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-300 text-sm font-black text-[#08111c]">{initials || 'D'}</span>
            <div>
              <p className="text-sm font-bold text-white">{displayName}</p>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{isAdmin ? 'Administrator' : 'Customer account'}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${isActive(item.to) ? 'bg-orange-300/10 text-orange-200' : 'text-slate-200 hover:bg-white/5 hover:text-orange-300'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isActive(item.to) ? 'bg-orange-300' : 'bg-slate-600'}`} />
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${isActive('/admin') ? 'bg-orange-300/10 text-orange-200' : 'text-orange-300 hover:bg-white/5'}`}
              >
                <Lock size={15} />
                Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="mt-2 flex items-center gap-3 rounded-lg border-t border-white/10 px-3 py-3 text-left text-sm font-semibold text-slate-400 transition hover:text-red-300">
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
