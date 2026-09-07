import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  BellRing,
  Camera,
  Check,
  ChevronRight,
  Database,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  LogOut,
  MailCheck,
  MonitorCheck,
  Palette,
  Phone,
  Save,
  Server,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { authService, systemService } from '../services/api';

const PREFERENCES_KEY = 'top-speed-preferences';
const DEFAULT_PREFERENCES = {
  theme: 'system',
  language: 'en',
  motion: 'full',
  notifications: {
    serviceUpdates: true,
    productNews: false,
  },
};

const sections = [
  { id: 'profile', label: 'Profile', description: 'Identity and account details', icon: User },
  { id: 'preferences', label: 'Preferences', description: 'Appearance and notifications', icon: MonitorCheck },
  { id: 'security', label: 'Security', description: 'Sessions and account protection', icon: ShieldCheck },
  { id: 'system', label: 'System', description: 'Service health and runtime', icon: Server },
  { id: 'about', label: 'About', description: 'Product and version details', icon: KeyRound },
];

const readPreferences = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
    return {
      ...DEFAULT_PREFERENCES,
      ...stored,
      notifications: { ...DEFAULT_PREFERENCES.notifications, ...(stored.notifications || {}) },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

const getInitials = (name = '') => name
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase() || 'TS';

const statusStyles = {
  success: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200',
  error: 'border-red-300/20 bg-red-300/10 text-red-200',
  info: 'border-orange-300/20 bg-orange-300/10 text-orange-100',
};

const SettingRow = ({ icon: Icon, title, description, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-white/[0.07] py-4 last:border-0">
    <span className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 rounded-lg border border-white/10 bg-white/[0.04] p-2 text-orange-200">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span>
      </span>
    </span>
    <span className="relative shrink-0">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span className="block h-6 w-11 rounded-full border border-white/10 bg-slate-700 transition peer-checked:border-orange-200/50 peer-checked:bg-orange-300/80 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-200/60" />
      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
    </span>
  </label>
);

const SystemStatus = ({ icon: Icon, title, description, status }) => {
  const isHealthy = ['Connected', 'Configured'].includes(status);
  return <div className="flex items-center justify-between gap-4 py-4"><span className="flex items-center gap-3"><Icon size={17} className="text-slate-500" /><span><span className="block text-sm font-semibold text-white">{title}</span><span className="block text-xs text-slate-500">{description}</span></span></span><span className={`text-xs font-bold ${isHealthy ? 'text-emerald-200' : 'text-slate-400'}`}>{status}</span></div>;
};

export const SettingsPanel = ({ isOpen, onClose }) => {
  const { user, updateEmail, updateProfile, updatePassword, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [preferences, setPreferences] = useState(readPreferences);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [health, setHealth] = useState(null);

  useEffect(() => {
    setNewEmail(user?.email || '');
    setProfile({ name: user?.name || '', phone: user?.phone || '' });
    if (user?.preferences) {
      setPreferences({ ...DEFAULT_PREFERENCES, ...user.preferences, notifications: { ...DEFAULT_PREFERENCES.notifications, ...(user.preferences.notifications || {}) } });
    }
  }, [user?.email, user?.name, user?.phone, user?.avatarUrl, user?.preferences]);

  useEffect(() => {
    if (!isOpen || activeSection !== 'system') return undefined;
    let isMounted = true;
    systemService.getHealth().then(({ data }) => {
      if (isMounted) setHealth(data);
    }).catch(() => {
      if (isMounted) setHealth({ status: 'unavailable', databaseConfigured: false, emailConfigured: false, distributedRateLimitConfigured: false });
    });
    return () => { isMounted = false; };
  }, [isOpen, activeSection]);

  useEffect(() => {
    const theme = preferences.theme || 'system';
    const resolvedTheme = theme === 'system' ? (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : theme;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.lang = preferences.language || 'en';
    document.documentElement.dir = preferences.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.reducedMotion = preferences.motion === 'reduced' ? 'true' : 'false';
  }, [preferences.theme, preferences.language, preferences.motion]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const showMessage = (type, text) => setMessage({ type, text });

  const saveSettings = async (updates, successMessage) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await authService.updateProfile(updates);
      updateProfile(response.data.user);
      if (updates.preferences) {
        setPreferences(updates.preferences);
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updates.preferences));
      }
      showMessage('success', successMessage);
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Unable to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (key, value) => {
    const nextPreferences = { ...preferences, [key]: value };
    saveSettings({ preferences: nextPreferences }, 'Preferences saved');
  };

  const updateNotification = (key) => {
    const nextPreferences = { ...preferences, notifications: { ...preferences.notifications, [key]: !preferences.notifications[key] } };
    saveSettings({ preferences: nextPreferences }, 'Notification settings saved');
  };

  const handleProfileSave = (event) => {
    event.preventDefault();
    saveSettings(profile, 'Profile details saved');
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      showMessage('error', 'Choose a PNG, JPG, JPEG, or WebP image smaller than 8MB');
      return;
    }

    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => { image.src = reader.result; };
    image.onload = async () => {
      const canvas = document.createElement('canvas');
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) {
        showMessage('error', 'Unable to prepare this image');
        return;
      }

      const scale = Math.max(size / image.width, size / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.fillStyle = '#142538';
      context.fillRect(0, 0, size, size);
      context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
      const optimizedImage = canvas.toDataURL('image/jpeg', 0.9);

      setIsLoading(true);
      try {
        const response = await authService.uploadAvatar(optimizedImage);
        updateProfile(response.data.user);
        showMessage('success', 'Profile image updated');
      } catch (error) {
        showMessage('error', error.response?.data?.error || 'Unable to upload profile image');
      } finally {
        setIsLoading(false);
      }
    };
    image.onerror = () => showMessage('error', 'Unable to read this image');
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      updatePassword(response.data.token, response.data.user);
      setCurrentPassword('');
      setNewPassword('');
      showMessage('success', 'Password updated and other sessions signed out');
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Unable to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async (event) => {
    event.preventDefault();
    if (newEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
      showMessage('info', 'Enter a different email address');
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await authService.updateEmail(newEmail.trim(), password);
      updateEmail(response.data.token, response.data.user);
      setPassword('');
      setIsEditingEmail(false);
      showMessage('success', 'Email address updated successfully');
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Unable to update your email address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEmail = () => {
    setIsEditingEmail(false);
    setNewEmail(user?.email || '');
    setPassword('');
    setMessage({ type: '', text: '' });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await logout();
    setIsSigningOut(false);
    onClose();
  };

  const renderAlert = () => message.text && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${statusStyles[message.type] || statusStyles.info}`}
      role="status"
    >
      {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      <span>{message.text}</span>
    </motion.div>
  );

  const renderProfile = () => (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-orange-200/20 bg-[linear-gradient(135deg,rgba(239,155,74,0.18),rgba(20,37,56,0.65)_52%,rgba(8,17,28,0.8))] p-5">
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border border-orange-200/10" />
        <div className="relative flex items-center gap-4">
          <label className="relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-orange-300 text-xl font-black text-[#08111c] shadow-[0_10px_30px_rgba(239,155,74,0.25)]" title="Upload profile image">
            {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="settings-avatar-image h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : getInitials(user?.name)}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition hover:opacity-100"><Camera size={18} /></span><input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="sr-only" onChange={handleAvatarUpload} disabled={isLoading} />
          </label>
          <span className="min-w-0">
            <span className="block truncate text-xl font-bold text-white">{user?.name || 'Driver'}</span>
            <span className="mt-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-100/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {user?.role === 'admin' ? 'Administrator' : 'Member'}
            </span>
          </span>
        </div>
        <p className="relative mt-5 max-w-md text-sm leading-6 text-slate-300">Your Top Speed profile is the control room for your service requests, vehicle builds, and account access.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Account identity</p>
            <h3 className="mt-2 text-lg font-bold text-white">Contact details</h3>
          </div>
          <User size={20} className="text-slate-500" />
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Full name</span><input className="settings-input mt-2" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} minLength={2} maxLength={100} required /></label>
            <label className="block"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Phone number</span><span className="relative mt-2 block"><Phone size={16} className="settings-leading-icon absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input className="settings-input has-leading-icon" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="+1 555 000 0000" maxLength={30} /></span></label>
          </div>
          <div className="rounded-xl border border-orange-200/10 bg-orange-200/[0.04] p-3 text-xs leading-5 text-slate-400">Your profile image is managed through the upload button on your avatar. Only image files are accepted.</div>
          <button type="submit" disabled={isLoading} className="settings-primary-button w-full sm:w-auto"><Save size={15} />{isLoading ? 'Saving...' : 'Save profile'}</button>
        </form>
        <div className="mt-5 space-y-4 border-t border-white/[0.07] pt-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Email address</span>
            {!isEditingEmail ? (
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 break-all text-sm font-semibold text-slate-100">{user?.email}</p>
                <button type="button" onClick={() => setIsEditingEmail(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-orange-200/20 px-3 py-2 text-xs font-bold text-orange-100 transition hover:border-orange-200/50 hover:bg-orange-200/10">
                  Change email <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailChange} className="mt-3 space-y-3">
                <input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} className="settings-input" placeholder="New email address" required />
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="settings-input pr-11" placeholder="Confirm with your password" required minLength={8} />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button type="submit" disabled={isLoading} className="settings-primary-button">{isLoading ? 'Updating...' : 'Save email'}</button>
                  <button type="button" onClick={handleCancelEmail} disabled={isLoading} className="settings-secondary-button">Cancel</button>
                </div>
              </form>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 border-t border-white/[0.07] pt-4 sm:grid-cols-2">
            <div className="settings-account-meta">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Account type</span>
              <p className="mt-1 text-sm font-semibold capitalize text-slate-100">{user?.role || 'Member'}</p>
            </div>
            <div className="settings-account-meta">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Account status</span>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Your experience</p>
            <h3 className="mt-2 text-lg font-bold text-white">Notifications</h3>
          </div>
          <Bell size={20} className="text-orange-200" />
        </div>
        <SettingRow icon={BellRing} title="Service updates" description="Receive updates about your requests, appointments, and vehicle work." checked={preferences.notifications.serviceUpdates} onChange={() => updateNotification('serviceUpdates')} />
        <SettingRow icon={MailCheck} title="Product news" description="Occasional news about new builds, modifications, and Top Speed releases." checked={preferences.notifications.productNews} onChange={() => updateNotification('productNews')} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Interface</p>
            <h3 className="mt-2 text-lg font-bold text-white">Display preferences</h3>
          </div>
          <MonitorCheck size={20} className="text-orange-200" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><Palette size={14} /> Theme</span><select className="settings-input mt-2" value={preferences.theme} onChange={(event) => updatePreference('theme', event.target.value)}><option value="system">System</option><option value="dark">Dark</option><option value="light">Light</option></select></label>
          <label className="block"><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"><Globe2 size={14} /> Language</span><select className="settings-input mt-2" value={preferences.language} onChange={(event) => updatePreference('language', event.target.value)}><option value="en">English</option><option value="ar">Arabic</option></select></label>
        </div>
        <SettingRow icon={MonitorCheck} title="Reduced motion" description="Use calmer transitions throughout the workspace when possible." checked={preferences.motion === 'reduced'} onChange={() => updatePreference('motion', preferences.motion === 'reduced' ? 'full' : 'reduced')} />
      </div>
      <div className="rounded-xl border border-orange-200/10 bg-orange-200/[0.04] p-4 text-sm leading-6 text-slate-300">These settings are saved to your account and follow you across devices. Account-critical communication remains enabled for service requests.</div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Account protection</p>
            <h3 className="mt-2 text-lg font-bold text-white">Security overview</h3>
          </div>
          <ShieldCheck size={20} className="text-emerald-200" />
        </div>
        <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-200" />
            <div><p className="text-sm font-bold text-emerald-100">Session protected</p><p className="mt-1 text-xs leading-5 text-slate-400">Your current session is authenticated and tied to your account security state.</p></div>
          </div>
        </div>
        <div className="mt-4 divide-y divide-white/[0.07]">
          <div className="flex items-center justify-between gap-4 py-4"><span><span className="block text-sm font-semibold text-white">Password</span><span className="mt-1 block text-xs text-slate-400">Required to confirm sensitive account changes.</span></span><span className="rounded-full border border-white/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-400">Managed</span></div>
          <div className="flex items-center justify-between gap-4 py-4"><span><span className="block text-sm font-semibold text-white">Email verification</span><span className="mt-1 block text-xs text-slate-400">Your verified email is used for account recovery and OTP.</span></span><span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200"><Check size={14} /> Verified</span></div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="mb-5 flex items-start justify-between gap-4"><div><p className="eyebrow">Credentials</p><h3 className="mt-2 text-lg font-bold text-white">Change password</h3></div><KeyRound size={20} className="text-orange-200" /></div>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="relative"><input className="settings-input pr-11" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Current password" minLength={8} maxLength={128} required /><button type="button" onClick={() => setShowCurrentPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}>{showCurrentPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          <div className="relative"><input className="settings-input pr-11" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" minLength={8} maxLength={128} required /><button type="button" onClick={() => setShowNewPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}>{showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          <p className="text-xs leading-5 text-slate-500">Changing your password invalidates other active sessions.</p>
          <button type="submit" disabled={isLoading} className="settings-primary-button w-full sm:w-auto"><ShieldCheck size={15} />{isLoading ? 'Updating...' : 'Update password'}</button>
        </form>
      </div>
      <div className="rounded-2xl border border-red-300/15 bg-red-300/[0.04] p-5">
        <div className="flex items-start gap-3"><LogOut size={18} className="mt-0.5 shrink-0 text-red-200" /><div><h3 className="text-sm font-bold text-white">End this session</h3><p className="mt-1 text-xs leading-5 text-slate-400">Sign out from this device and invalidate the current session token.</p><button type="button" onClick={handleSignOut} disabled={isSigningOut} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300/20 px-3 py-2 text-xs font-bold text-red-100 transition hover:bg-red-300/10 disabled:opacity-60"><LogOut size={14} />{isSigningOut ? 'Signing out...' : 'Sign out'}</button></div></div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="eyebrow">Runtime status</p><h3 className="mt-2 text-lg font-bold text-white">Service connections</h3></div><Server size={20} className="text-orange-200" /></div><div className="divide-y divide-white/[0.07]"><SystemStatus icon={Server} title="Backend API" description="Application gateway" status={health?.status === 'Backend is running' ? 'Connected' : 'Unavailable'} /><SystemStatus icon={Database} title="Account database" description="Profile and preference persistence" status={health ? (health.databaseConfigured ? 'Configured' : 'Unavailable') : 'Checking...'} /><SystemStatus icon={MailCheck} title="Email delivery" description="Verification and service notifications" status={health ? (health.emailConfigured ? 'Configured' : 'Unavailable') : 'Checking...'} /><SystemStatus icon={ShieldCheck} title="Distributed protection" description="Shared rate limiting" status={health ? (health.distributedRateLimitConfigured ? 'Configured' : 'Local fallback') : 'Checking...'} /></div></div>
      <div className="rounded-xl border border-orange-200/10 bg-orange-200/[0.04] p-4 text-sm leading-6 text-slate-300">Connection status is based on the authenticated workspace session. Sensitive credentials are never displayed here.</div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-5"><div className="rounded-2xl border border-orange-200/20 bg-[linear-gradient(135deg,rgba(239,155,74,0.18),rgba(20,37,56,0.65)_52%,rgba(8,17,28,0.8))] p-6"><p className="eyebrow">TOP SPEED</p><h3 className="mt-3 text-2xl font-bold text-white">Performance / Craft</h3><p className="mt-3 text-sm leading-6 text-slate-300">A connected automotive workspace for discovering vehicles, planning modifications, and coordinating service.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center justify-between border-b border-white/[0.07] py-3"><span className="text-sm text-slate-400">Version</span><span className="text-sm font-semibold text-white">1.0.0</span></div><div className="flex items-center justify-between py-3"><span className="text-sm text-slate-400">Account access</span><span className="text-sm font-semibold capitalize text-white">{user?.role || 'member'}</span></div></div></div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-[#02070c]/75 backdrop-blur-sm" />
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 30 }} className="fixed right-0 top-0 z-50 flex h-full w-full max-w-3xl flex-col border-l border-white/10 bg-[#0b1724] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-[#08111c]/90 px-4 py-4 backdrop-blur-xl sm:px-8 sm:py-5">
              <div className="min-w-0"><p className="eyebrow">TOP SPEED / Workspace</p><h2 id="settings-title" className="display-heading mt-2 text-2xl text-white sm:text-4xl">Settings</h2><p className="mt-2 max-w-sm text-sm text-slate-400">Shape your account, preferences, and access.</p></div>
              <button type="button" onClick={onClose} className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-orange-200/40 hover:text-orange-100" aria-label="Close settings"><X size={21} /></button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-8 sm:py-7">
              {renderAlert()}
              <div className="mt-5 grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
                <nav aria-label="Settings sections" className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2">
                  {sections.map(({ id, label, description, icon: Icon }) => {
                    const isActive = activeSection === id;
                    return <button key={id} type="button" onClick={() => setActiveSection(id)} className={`flex min-w-max items-center gap-3 rounded-xl border px-3 py-3 text-left transition lg:w-full ${isActive ? 'border-orange-200/25 bg-orange-200/10 text-orange-100' : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white'}`} aria-current={isActive ? 'page' : undefined}><Icon size={17} /><span><span className="block text-sm font-bold">{label}</span><span className="mt-0.5 hidden text-[0.68rem] leading-4 text-slate-500 lg:block">{description}</span></span></button>;
                  })}
                </nav>
                <main className="min-w-0">{activeSection === 'profile' && renderProfile()}{activeSection === 'preferences' && renderPreferences()}{activeSection === 'security' && renderSecurity()}{activeSection === 'system' && renderSystem()}{activeSection === 'about' && renderAbout()}</main>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
