import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  return process.env.JWT_SECRET;
};

export const generateToken = (userId, role, email = null, sessionVersion = 0) => {
  return jwt.sign({ userId, role, email, sessionVersion }, getJwtSecret(), {
    expiresIn: '7d',
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export const isSessionValid = (tokenUser, databaseUser) => {
  return Boolean(
    databaseUser &&
    databaseUser.isActive &&
    databaseUser.isEmailVerified &&
    tokenUser.userId === databaseUser.id &&
    tokenUser.role === databaseUser.role &&
    tokenUser.sessionVersion === (databaseUser.sessionVersion ?? 0)
  );
};
