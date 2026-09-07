import { generateToken } from '../utils/auth.js';
import { isAdminUser, resolveUserRole } from '../utils/admin.js';
import { sendOTPEmail } from '../services/emailService.js';
import { randomInt } from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
  compareUserPassword,
  uploadUserAvatar,
  DEFAULT_USER_PREFERENCES,
} from '../services/supabaseDataService.js';

// Generate random OTP
const generateOTP = () => {
  return randomInt(100000, 1000000).toString();
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidPassword = (password) => typeof password === 'string' && password.length >= 8 && password.length <= 128;
const isValidName = (name) => typeof name === 'string' && name.length >= 2 && name.length <= 100;
const isValidPhone = (phone) => phone === null || (typeof phone === 'string' && phone.length <= 30 && phone.replace(/\D/g, '').length >= 7);
const preferenceShape = (preferences = {}) => ({
  theme: preferences.theme ?? DEFAULT_USER_PREFERENCES.theme,
  language: preferences.language ?? DEFAULT_USER_PREFERENCES.language,
  motion: preferences.motion ?? DEFAULT_USER_PREFERENCES.motion,
  notifications: {
    ...DEFAULT_USER_PREFERENCES.notifications,
    ...(preferences.notifications || {}),
  },
});
const isValidPreferences = (preferences) => {
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) return false;
  const normalized = preferenceShape(preferences);
  return ['system', 'light', 'dark'].includes(normalized.theme)
    && ['en', 'ar'].includes(normalized.language)
    && ['full', 'reduced'].includes(normalized.motion)
    && typeof normalized.notifications.serviceUpdates === 'boolean'
    && typeof normalized.notifications.productNews === 'boolean';
};
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  avatarUrl: user.avatarUrl ?? user.avatar_url ?? null,
  preferences: preferenceShape(user.preferences),
  role: user.role,
});

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email) || !isValidPassword(password)) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    let user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    const isMatch = await compareUserPassword(user.passwordHash, password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'User account is disabled' });
    }

    const effectiveRole = resolveUserRole(user);
    if (effectiveRole !== user.role) {
      user = await updateUser(user.id, { role: effectiveRole });
    }

    const token = generateToken(user.id, user.role, user.email, user.sessionVersion ?? 0);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Unable to complete login. Please try again.' });
  }
};

export const register = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    if (!isValidName(name) || !EMAIL_PATTERN.test(email) || !isValidPassword(password)) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    let user = await getUserByEmail(email);
    if (user) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    const isAdminEmail = isAdminUser({ email, role: 'user' });

    user = await createUser({
      name,
      email,
      password,
      role: isAdminEmail ? 'admin' : 'user',
      otp,
      otpExpiresAt,
      isActive: false,
      isEmailVerified: false,
    });

    try {
      await sendOTPEmail(email, name, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      await deleteUser(user.id);
      return res.status(502).json({
        error: 'Unable to send verification email. Please check the email address and try again.',
      });
    }

    res.status(201).json({
      message: 'Account created. Please check your email for the verification code. If it does not arrive within a minute, use resend.',
      email,
      requiresOTP: true,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Unable to create your account. Please try again.' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email) || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    let user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if OTP is expired
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(401).json({ error: 'OTP has expired. Please sign up again.' });
    }

    // Check if OTP is correct
    if (user.otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Mark as verified and activate
    user = await updateUser(user.id, {
      isEmailVerified: true,
      isActive: true,
      otp: null,
      otpExpiresAt: null,
    });

    const effectiveRole = resolveUserRole(user);
    if (effectiveRole !== user.role) {
      user = await updateUser(user.id, { role: effectiveRole });
    }

    const token = generateToken(user.id, user.role, user.email, user.sessionVersion ?? 0);

    res.json({
      message: 'Email verified successfully. Welcome to TOP SPEED!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to verify the email address. Please try again.' });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const previousOtp = user.otp;
    const previousOtpExpiresAt = user.otpExpiresAt;
    await updateUser(user.id, {
      otp,
      otpExpiresAt,
    });

    try {
      await sendOTPEmail(email, user.name, otp);
    } catch (emailError) {
      console.error('Failed to resend OTP email:', emailError);
      await updateUser(user.id, {
        otp: previousOtp,
        otpExpiresAt: previousOtpExpiresAt,
      });
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }

    res.json({
      message: 'New OTP sent to your email',
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to resend the verification email. Please try again.' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!isValidName(name) || !EMAIL_PATTERN.test(email) || !isValidPassword(password)) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    let user = await getUserByEmail(email);
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    user = await createUser({
      name,
      email,
      password,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
    });
    const token = generateToken(user.id, user.role, user.email, user.sessionVersion ?? 0);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to create the administrator account.' });
  }
};

export const updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body || {};
    const userId = req.user.userId;

    if (typeof newEmail !== 'string' || !EMAIL_PATTERN.test(newEmail) || !isValidPassword(password)) {
      return res.status(400).json({ error: 'New email and password are required' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password before allowing email change
    const isMatch = await compareUserPassword(user.passwordHash, password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Check if new email is already taken
    const existingUser = await getUserByEmail(newEmail);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Update email
    const updatedUser = await updateUser(user.id, {
      email: newEmail,
    });

    // Generate new token with updated email
    const token = generateToken(updatedUser.id, updatedUser.role, updatedUser.email, updatedUser.sessionVersion ?? 0);

    res.json({
      message: 'Email updated successfully',
      token,
      user: {
        id: user.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to update the email address.' });
  }
};

export const getCurrentUser = async (req, res) => {
  const currentUser = await getUserById(req.user.userId);
  res.json({
    user: publicUser(currentUser || req.user),
  });
};

export const updateProfile = async (req, res) => {
  const allowedFields = ['name', 'phone', 'preferences'];
  const body = req.body || {};
  const unknownFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
  if (unknownFields.length > 0) return res.status(400).json({ error: 'Unsupported profile field' });
  if (body.name !== undefined && !isValidName(body.name)) return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
  if (body.phone !== undefined && !isValidPhone(body.phone)) return res.status(400).json({ error: 'Invalid phone number' });
  if (body.preferences !== undefined && !isValidPreferences(body.preferences)) return res.status(400).json({ error: 'Invalid preferences' });

  try {
    const updates = { ...body };
    if (updates.name !== undefined) updates.name = updates.name.trim();
    if (updates.phone !== undefined) updates.phone = updates.phone?.trim() || null;
    if (updates.preferences !== undefined) updates.preferences = preferenceShape(updates.preferences);
    const updatedUser = await updateUser(req.user.userId, updates);
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: publicUser(updatedUser) });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Unable to update profile' });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!isValidPassword(currentPassword) || !isValidPassword(newPassword)) {
    return res.status(400).json({ error: 'Passwords must be between 8 and 128 characters' });
  }
  if (currentPassword === newPassword) return res.status(400).json({ error: 'New password must be different' });

  try {
    const user = await getUserById(req.user.userId);
    if (!user || !(await compareUserPassword(user.passwordHash, currentPassword))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const updatedUser = await updateUser(user.id, {
      password: newPassword,
      sessionVersion: (user.sessionVersion ?? 0) + 1,
    });
    const token = generateToken(updatedUser.id, updatedUser.role, updatedUser.email, updatedUser.sessionVersion ?? 0);
    return res.json({ message: 'Password updated successfully', token, user: publicUser(updatedUser) });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ error: 'Unable to update password' });
  }
};

export const uploadAvatar = async (req, res) => {
  const { image } = req.body || {};
  const match = typeof image === 'string' && image.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return res.status(400).json({ error: 'Upload a PNG, JPEG, or WebP image' });
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0 || buffer.length > 600 * 1024) return res.status(400).json({ error: 'Image must be smaller than 600KB' });

  try {
    const detectedType = await fileTypeFromBuffer(buffer);
    const expectedMime = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
    if (!detectedType || detectedType.mime !== expectedMime) return res.status(400).json({ error: 'The uploaded file type is invalid' });
    const avatarUrl = await uploadUserAvatar(req.user.userId, buffer, expectedMime);
    const updatedUser = await updateUser(req.user.userId, { avatarUrl });
    return res.json({ user: publicUser(updatedUser) });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return res.status(503).json({ error: 'Unable to upload profile image' });
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'Session is no longer valid' });
    }

    await updateUser(user.id, { sessionVersion: (user.sessionVersion ?? 0) + 1 });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
