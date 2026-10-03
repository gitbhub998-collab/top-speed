import { createHmac, timingSafeEqual } from 'node:crypto';

const getOtpKey = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  return process.env.JWT_SECRET;
};

export const hashOtp = (otp) => createHmac('sha256', getOtpKey()).update(otp).digest('hex');

export const verifyOtpHash = (otp, storedHash) => {
  if (typeof storedHash !== 'string' || !/^[a-f0-9]{64}$/i.test(storedHash)) return false;

  const candidate = Buffer.from(hashOtp(otp), 'hex');
  const expected = Buffer.from(storedHash, 'hex');
  return timingSafeEqual(candidate, expected);
};
