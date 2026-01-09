/**
 * Authentication Controller
 * Handles user registration, login, and token management
 */
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  generateTokenPair,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../errors';

// Note: In production, you'd use a User model from MongoDB
// For now, we'll create placeholder functions

/**
 * User login
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // TODO: Replace with actual User model lookup
  // const user = await User.findOne({ email });
  const user = await findUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Store refresh token hash
  // await storeRefreshToken(user.id, hashToken(tokens.refreshToken));

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    ...tokens,
  });
};

/**
 * User registration
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, phone } = req.body;

  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // TODO: Create user in database
  // const user = await User.create({ email, passwordHash, name, phone });
  const user = {
    id: 'new-user-id',
    email,
    name,
    phone,
    role: 'user' as const,
    passwordHash,
  };

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    message: 'Registration successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    ...tokens,
  });
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new BadRequestError('Refresh token is required');
  }

  // Verify the refresh token
  const payload = verifyRefreshToken(token);

  // TODO: Verify token exists in database and hasn't been revoked
  // const storedToken = await RefreshToken.findOne({
  //   userId: payload.userId,
  //   tokenHash: hashToken(token),
  //   revoked: false,
  // });
  // if (!storedToken) {
  //   throw new UnauthorizedError('Invalid refresh token');
  // }

  // TODO: Get user from database
  // const user = await User.findById(payload.userId);
  const user = await findUserById(payload.userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  // Generate new token pair
  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Rotate refresh token (revoke old, store new)
  // await storedToken.updateOne({ revoked: true });
  // await storeRefreshToken(user.id, hashToken(tokens.refreshToken));

  res.json({
    message: 'Token refreshed',
    ...tokens,
  });
};

/**
 * User logout
 * POST /api/v1/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  // Get user for potential token revocation
  void (req.user as TokenPayload);

  // TODO: Revoke all refresh tokens for this user
  // const user = req.user as TokenPayload;
  // await RefreshToken.updateMany(
  //   { userId: user.userId },
  //   { revoked: true }
  // );

  res.json({ message: 'Logged out successfully' });
};

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const tokenUser = req.user as TokenPayload;

  // TODO: Get user from database
  // const user = await User.findById(tokenUser.userId).select('-passwordHash');
  const user = await findUserById(tokenUser.userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  });
};

/**
 * Update user profile
 * PATCH /api/v1/auth/profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const tokenUser = req.user as TokenPayload;
  const { name, phone } = req.body;

  // TODO: Update user in database
  // const user = await User.findByIdAndUpdate(
  //   tokenUser.userId,
  //   { name, phone },
  //   { new: true }
  // ).select('-passwordHash');

  const user = {
    id: tokenUser.userId,
    email: tokenUser.email,
    name: name || 'Updated Name',
    phone,
    role: tokenUser.role,
  };

  res.json({
    message: 'Profile updated',
    user,
  });
};

/**
 * Request password reset
 * POST /api/v1/auth/password-reset/request
 */
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  // Always return success to prevent email enumeration
  const user = await findUserByEmail(email);

  if (user) {
    // TODO: Generate reset token and send email
    // const resetToken = crypto.randomBytes(32).toString('hex');
    // const resetTokenHash = hashToken(resetToken);
    // const resetExpires = new Date(Date.now() + 3600000); // 1 hour
    //
    // await User.findByIdAndUpdate(user.id, {
    //   passwordResetToken: resetTokenHash,
    //   passwordResetExpires: resetExpires,
    // });
    //
    // await sendPasswordResetEmail(email, resetToken);
  }

  res.json({
    message: 'If an account with that email exists, a password reset link has been sent',
  });
};

/**
 * Reset password
 * POST /api/v1/auth/password-reset
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  // Token will be validated once reset flow is fully implemented
  void token;

  // TODO: Find user with valid reset token
  // const tokenHash = hashToken(_token);
  // const user = await User.findOne({
  //   passwordResetToken: tokenHash,
  //   passwordResetExpires: { $gt: Date.now() },
  // });
  //
  // if (!user) {
  //   throw new BadRequestError('Invalid or expired reset token');
  // }

  // Hash new password for future use
  void await bcrypt.hash(password, 12);

  // TODO: Update password and clear reset token
  // const passwordHash = await bcrypt.hash(password, 12);
  // await user.updateOne({
  //   passwordHash,
  //   passwordResetToken: undefined,
  //   passwordResetExpires: undefined,
  // });

  res.json({ message: 'Password reset successful' });
};

// ============================================
// Placeholder functions - Replace with actual DB queries
// ============================================

interface UserRecord {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin' | 'moderator';
  passwordHash: string;
  createdAt: Date;
}

async function findUserByEmail(email: string): Promise<UserRecord | null> {
  // Placeholder - replace with User.findOne({ email })
  if (email === 'admin@manake.org.zw') {
    return {
      id: 'admin-user-id',
      email: 'admin@manake.org.zw',
      name: 'Admin User',
      role: 'admin',
      passwordHash: await bcrypt.hash('password123', 12),
      createdAt: new Date(),
    };
  }
  return null;
}

async function findUserById(id: string): Promise<UserRecord | null> {
  // Placeholder - replace with User.findById(id)
  if (id === 'admin-user-id') {
    return {
      id: 'admin-user-id',
      email: 'admin@manake.org.zw',
      name: 'Admin User',
      role: 'admin',
      passwordHash: '',
      createdAt: new Date(),
    };
  }
  return null;
}
