import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { authService } from '../services/api';

const INITIAL_SECONDS = 10 * 60;

export const PasswordResetPage = () => {
  const [stage, setStage] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetAuthorization, setResetAuthorization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (stage !== 'otp' || secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(timer);
  }, [stage, secondsLeft]);

  const clearFeedback = () => {
    setError('');
    setNotice('');
  };

  const showRequestError = (requestError, fallback) => {
    setError(requestError.response?.data?.error || fallback);
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      await authService.requestPasswordReset(normalizedEmail);
      setEmail(normalizedEmail);
      setStage('otp');
      setSecondsLeft(INITIAL_SECONDS);
      setNotice('If an account exists for this email, a code may arrive shortly.');
    } catch (requestError) {
      showRequestError(requestError, 'Unable to process this request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    clearFeedback();
    setLoading(true);
    try {
      const response = await authService.verifyPasswordResetOtp(email, otp);
      setResetAuthorization(response.data.resetAuthorization);
      setStage('password');
    } catch (requestError) {
      showRequestError(requestError, 'The code could not be verified. Request a new code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    clearFeedback();
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setOtp('');
      setSecondsLeft(INITIAL_SECONDS);
      setNotice('If an account exists for this email, a new code may arrive shortly.');
    } catch (requestError) {
      showRequestError(requestError, 'Unable to process this request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    clearFeedback();
    if (password.length < 8 || password.length > 128) {
      setError('Password must be between 8 and 128 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(resetAuthorization, password, confirmation);
      setResetAuthorization('');
      setPassword('');
      setConfirmation('');
      setStage('success');
    } catch (requestError) {
      showRequestError(requestError, 'Unable to reset the password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const heading = {
    email: ['Account recovery', 'Forgot password?'],
    otp: ['Verify your identity', 'Check your email'],
    password: ['Choose a new password', 'Reset password'],
    success: ['Password updated', 'You are all set'],
  }[stage];

  return (
    <main className="min-h-screen app-shell flex items-center justify-center px-3 sm:px-4 md:px-6 py-6 sm:py-12">
      <section className="w-full max-w-md" aria-labelledby="reset-heading">
        <header className="mb-6 sm:mb-10">
          <p className="eyebrow mb-3">{heading[0]}</p>
          <h1 id="reset-heading" className="display-heading text-4xl sm:text-5xl font-normal text-white mb-3">{heading[1]}</h1>
          <p className="text-slate-400 text-sm">
            {stage === 'email' && 'Enter the email address associated with your account.'}
            {stage === 'otp' && `Enter the six-digit code for ${email}.`}
            {stage === 'password' && 'Your new password must be 8 to 128 characters.'}
            {stage === 'success' && 'Your password has been changed. Sign in with your new password.'}
          </p>
        </header>

        <div className="border border-white/10 rounded-lg p-4 sm:p-6 md:p-8 bg-[#101e2d]/90 shadow-2xl shadow-black/20">
          {stage === 'email' && (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div>
                <label htmlFor="reset-email" className="block text-slate-200 text-sm font-medium mb-3">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:border-red-600 focus:outline-none" placeholder="you@example.com" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors text-sm">
                {loading ? 'Sending...' : 'Send verification code'}
              </button>
            </form>
          )}

          {stage === 'otp' && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label htmlFor="reset-otp" className="block text-slate-200 text-sm font-medium mb-3">Verification Code</label>
                <input id="reset-otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-4 py-4 bg-gray-900 border border-gray-800 rounded-lg text-white text-center text-2xl font-mono font-bold tracking-[0.3em] placeholder-gray-600 focus:border-red-600 focus:outline-none" placeholder="000000" />
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
                <p className="text-gray-400 text-xs">Code expires in</p>
                <p className={`text-2xl font-mono font-bold mt-1 ${secondsLeft <= 60 ? 'text-red-500' : 'text-white'}`}>{formatTime(secondsLeft)}</p>
              </div>
              <button type="submit" disabled={loading || otp.length !== 6 || secondsLeft === 0} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors text-sm">
                {loading ? 'Verifying...' : 'Verify code'}
              </button>
              <div className="flex items-center justify-between border-t border-gray-800 pt-4 text-xs">
                <button type="button" onClick={handleResendCode} disabled={loading} className="text-red-500 hover:text-red-400 disabled:opacity-50">Resend code</button>
                <button type="button" onClick={() => { clearFeedback(); setOtp(''); setStage('email'); }} className="text-gray-400 hover:text-white">Change email</button>
              </div>
            </form>
          )}

          {stage === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {[
                { id: 'new-password', label: 'New Password', value: password, setValue: setPassword, visible: showPassword, setVisible: setShowPassword },
                { id: 'confirm-password', label: 'Confirm Password', value: confirmation, setValue: setConfirmation, visible: showConfirmation, setVisible: setShowConfirmation },
              ].map(({ id, label, value, setValue, visible, setVisible }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-slate-200 text-sm font-medium mb-3">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input id={id} type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={128} value={value} onChange={(event) => setValue(event.target.value)} className="w-full pl-12 pr-12 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-600 focus:border-red-600 focus:outline-none" />
                    <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading || !resetAuthorization} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors text-sm">
                {loading ? 'Updating password...' : 'Set new password'}
              </button>
            </form>
          )}

          {stage === 'success' && (
            <div className="space-y-5">
              <div role="status" className="bg-green-900/20 border border-green-800/50 text-green-300 px-4 py-3 rounded-lg text-sm">Password changed successfully.</div>
              <Link to="/login" className="block w-full bg-red-600 hover:bg-red-700 text-center text-white font-medium py-3 rounded-lg transition-colors text-sm">Back to sign in</Link>
            </div>
          )}

          {error && <div role="alert" className="mt-5 bg-red-900/20 border border-red-900/50 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}
          {notice && stage === 'otp' && <div role="status" className="mt-5 bg-green-900/20 border border-green-800/50 text-green-300 px-4 py-3 rounded-lg text-sm">{notice}</div>}
        </div>

        {stage !== 'success' && <p className="text-gray-500 text-sm text-center mt-6"><Link to="/login" className="text-red-500 hover:text-red-400">Back to sign in</Link></p>}
      </section>
    </main>
  );
};