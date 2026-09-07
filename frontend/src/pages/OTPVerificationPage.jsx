import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const OTPVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setResendMessage('');

    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (otp.length !== 6 || isNaN(otp)) {
      setError('Verification code must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyOTP(email, otp);
      login(response.data.token, response.data.user);
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');
    setResendMessage('');

    try {
      await authService.resendOTP(email);
      setResendMessage('New code sent to your email. Please check inbox and spam.');
      setTimeLeft(600); // Reset timer
      setOtp('');
      setTimeout(() => setResendMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-surface flex items-center justify-center px-3 sm:px-4 md:px-6 py-6 sm:py-12">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 md:mb-10 text-center">
          <h1 className="display-heading text-4xl sm:text-5xl font-normal text-white mb-1 sm:mb-2">Verify Email</h1>
          <p className="text-gray-500 text-xs sm:text-sm">We&apos;ve sent a verification code to</p>
          <p className="text-gray-400 text-xs sm:text-sm font-medium mt-1">{email}</p>
        </div>

        {/* Form Card */}
        <div className="form-surface border rounded-lg p-4 sm:p-6 md:p-8">
          <form onSubmit={handleVerifyOTP} className="space-y-4 sm:space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2 sm:mb-3">Verification Code</label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  className="w-full px-2 sm:px-3 md:px-4 py-3 sm:py-4 bg-gray-900 border border-gray-800 rounded-lg text-white text-center text-lg sm:text-xl md:text-2xl font-mono letter-spacing font-bold placeholder-gray-600 focus:border-red-600 focus:outline-none transition-colors duration-200"
                  placeholder="000000"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1.5 sm:mt-2">Enter the 6-digit code from your email</p>
            </div>

            {/* Timer */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-2 sm:p-3 md:p-4 text-center">
              <p className="text-gray-400 text-xs sm:text-sm">Code expires in</p>
              <p className={`text-xl sm:text-2xl font-mono font-bold mt-1 ${timeLeft <= 60 ? 'text-red-600' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {resendMessage && (
              <div className="bg-green-900/20 border border-green-900/50 text-green-400 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                <p>{resendMessage}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full accent-button disabled:opacity-50 font-bold py-2 sm:py-3 rounded-lg transition-colors duration-200 text-xs sm:text-sm md:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying
                </span>
              ) : (
                'Verify Email'
              )}
            </button>

            {/* Resend Link */}
            <div className="border-t border-gray-800 pt-4 sm:pt-6">
              <p className="text-gray-500 text-xs sm:text-sm text-center">
                Didn&apos;t receive a code?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-red-600 hover:text-red-500 font-medium transition-colors disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Info Text */}
        <p className="text-gray-600 text-xs text-center mt-4 sm:mt-6 md:mt-8">
          The code usually arrives within a minute. If not, check spam or tap resend.
        </p>
      </div>
    </div>
  );
};
