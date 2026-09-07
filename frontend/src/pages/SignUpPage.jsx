import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Lock, Mail, Eye, EyeOff, User } from 'lucide-react';

export const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.name === 'email' ? e.target.value.toLowerCase() : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!name) {
      setError('Full name is required');
      return;
    }

    if (name.length < 2) {
      setError('Full name must be at least 2 characters');
      return;
    }

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authService.register(name, email, password);
      navigate('/verify-otp', { state: { email, name } });
    } catch (err) {
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-shell flex items-center justify-center px-3 py-6 sm:px-4 sm:py-10 md:px-6">
      <div className="w-full max-w-[29rem]">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 text-white">
            <div className="flex items-baseline gap-1 text-2xl font-black tracking-[-0.08em] text-white sm:text-3xl">
              <span className="text-white">TOP</span>
              <span className="text-[#f3b152]">SPEED</span>
            </div>
          </div>
          <div className="mt-3 text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-slate-400">
            Performance / Craft
          </div>
        </div>

        <div className="rounded-xl border border-[#1a2b3c] bg-[#0d1b2a]/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:p-6">
          <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold text-slate-100">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-700 bg-[#eef2f7] py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none"
                  placeholder="bebo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-slate-100">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-700 bg-[#eef2f7] py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none"
                  placeholder="baligao198@gmail.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-slate-100">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-700 bg-[#eef2f7] py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="mb-2 block text-sm font-semibold text-slate-100">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-700 bg-[#eef2f7] py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-500 focus:border-orange-300 focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                  aria-pressed={showConfirmPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-md border border-slate-800 bg-[#101d2b] p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Password Requirements:</p>
              <ul className="space-y-1 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f3b152]" />
                  Minimum 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f3b152]" />
                  Easy to remember and secure
                </li>
              </ul>
            </div>

            {error && (
              <div role="alert" className="rounded-md border border-red-800 bg-red-900/20 px-3 py-3 text-sm font-medium text-red-300">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div role="status" className="rounded-md border border-green-800 bg-green-900/20 px-3 py-3 text-sm font-medium text-green-300">
                <p>{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#f3b152] py-3 text-base font-bold text-[#0d1b2a] transition-colors duration-200 hover:bg-[#f7c476] disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0d1b2a] border-t-transparent" />
                  Creating Account
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-orange-300 transition-colors hover:text-orange-200">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
