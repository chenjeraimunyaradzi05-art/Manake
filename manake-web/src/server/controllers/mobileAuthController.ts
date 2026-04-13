import type { NextFunction, Request, Response } from "express";

import { prisma } from "../config/prisma";
import { authService } from "../services/authService";
import {
  extractBearerToken,
  type TokenPayload,
  verifyAccessToken,
} from "../utils/jwt";

type LegacySuccess<T> = { success: true; data: T; message?: string };
type LegacyFailure = { success: false; data: null; message: string };

type MobileUserRole = "user" | "volunteer" | "admin" | "moderator";

type MobileUserPreferences = {
  notifications: boolean;
  emailUpdates: boolean;
  darkMode: boolean;
  language: string;
};

type MobileUserStats = {
  storiesLiked: number;
  commentsMade: number;
  totalDonated: number;
  storiesShared: number;
};

type MobileUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  joinedAt: string;
  role: MobileUserRole;
  preferences: MobileUserPreferences;
  stats: MobileUserStats;
};

type LegacyAuthData = {
  user: MobileUser;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function extractUserId(value: unknown): string {
  const record = asRecord(value);
  const idValue = record.id ?? record._id;
  if (typeof idValue === "string") return idValue;
  if (idValue === null || typeof idValue === "undefined") return "";
  return String(idValue);
}

function ok<T>(res: Response, data: T, message?: string): void {
  const payload: LegacySuccess<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  res.json(payload);
}

function fail(res: Response, message: string): void {
  const payload: LegacyFailure = { success: false, data: null, message };
  res.json(payload);
}

function normalizeZwPhone(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  let phone = value.trim();
  if (!phone) return undefined;

  phone = phone.replace(/[^\d+]/g, "");
  if (phone.startsWith("+")) {
    phone = "+" + phone.slice(1).replace(/\+/g, "");
  } else {
    phone = phone.replace(/\+/g, "");
  }

  if (phone.startsWith("0") && phone.length === 10) {
    phone = `+263${phone.slice(1)}`;
  } else if (phone.startsWith("263")) {
    phone = `+${phone}`;
  }

  return phone;
}

function isValidZwPhone(phone: string): boolean {
  return /^\+263[0-9]{9}$/.test(phone);
}

function toMobileUser(rawInput: unknown): MobileUser {
  const raw = asRecord(rawInput);
  const preferences = asRecord(raw["preferences"]);
  const profile = asRecord(raw["profile"]);

  const notifications =
    typeof preferences["notifications"] === "boolean"
      ? (preferences["notifications"] as boolean)
      : typeof preferences["pushNotifications"] === "boolean"
        ? (preferences["pushNotifications"] as boolean)
        : true;

  const emailUpdates =
    typeof preferences["emailUpdates"] === "boolean"
      ? (preferences["emailUpdates"] as boolean)
      : typeof preferences["emailNotifications"] === "boolean"
        ? (preferences["emailNotifications"] as boolean)
        : true;

  const darkMode =
    typeof preferences["darkMode"] === "boolean"
      ? (preferences["darkMode"] as boolean)
      : false;

  const languageValue = preferences["language"];
  const language =
    typeof languageValue === "string" && languageValue.trim()
      ? languageValue.trim()
      : "en";

  const joinedAtValue = raw["joinedAt"] ?? raw["createdAt"];
  const joinedAtDate =
    joinedAtValue instanceof Date
      ? joinedAtValue
      : typeof joinedAtValue === "string" || typeof joinedAtValue === "number"
        ? new Date(joinedAtValue)
        : joinedAtValue
          ? new Date(String(joinedAtValue))
          : null;
  const joinedAt =
    joinedAtDate && !Number.isNaN(joinedAtDate.getTime())
      ? joinedAtDate.toISOString()
      : new Date().toISOString();

  const bioValue = raw["bio"] ?? profile["bio"];

  const role: MobileUserRole =
    raw["role"] === "admin" || raw["role"] === "moderator"
      ? (raw["role"] as MobileUserRole)
      : "user";

  const avatarValue = raw["avatar"];
  const phoneValue = raw["phone"];

  return {
    id: extractUserId(raw),
    email: String(raw["email"] ?? ""),
    name: String(raw["name"] ?? ""),
    avatar:
      typeof avatarValue === "string" && avatarValue.trim()
        ? avatarValue.trim()
        : undefined,
    phone:
      typeof phoneValue === "string" && phoneValue.trim()
        ? phoneValue.trim()
        : undefined,
    bio:
      typeof bioValue === "string" && bioValue.trim()
        ? bioValue.trim()
        : undefined,
    joinedAt,
    role,
    preferences: {
      notifications,
      emailUpdates,
      darkMode,
      language,
    },
    stats: {
      storiesLiked: 0,
      commentsMade: 0,
      totalDonated: 0,
      storiesShared: 0,
    },
  };
}

export const legacyAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    fail(res, "Authentication required");
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid token";
    fail(res, message);
  }
};

export async function legacyLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = (req.body || {}) as {
      email?: string;
      password?: string;
    };

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      fail(res, "Email and password are required");
      return;
    }

    const result = await authService.login(
      { email, password },
      {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    );

    const userId = extractUserId(result.user);
    const fullUser = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null;
    const mobileUser = toMobileUser(fullUser || result.user);

    const data: LegacyAuthData = {
      user: mobileUser,
      token: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn,
    };

    ok(res, data, "Login successful");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    fail(res, message);
  }
}

export async function legacyRegister(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email, password, name, phone } = (req.body || {}) as {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
      confirmPassword?: string;
    };

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string" ||
      !name ||
      typeof name !== "string"
    ) {
      fail(res, "Email, password, and name are required");
      return;
    }

    const normalizedPhone = normalizeZwPhone(phone);
    if (normalizedPhone && !isValidZwPhone(normalizedPhone)) {
      fail(res, "Invalid Zimbabwe phone number (format: +263XXXXXXXXX)");
      return;
    }

    const result = await authService.register(
      {
        email,
        password,
        name,
        phone: normalizedPhone,
      },
      {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    );

    const userId = extractUserId(result.user);
    const fullUser = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null;
    const mobileUser = toMobileUser(fullUser || result.user);

    const data: LegacyAuthData = {
      user: mobileUser,
      token: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn,
    };

    ok(res, data, "Registration successful");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    fail(res, message);
  }
}

export async function legacyLogout(req: Request, res: Response): Promise<void> {
  try {
    const tokenUser = req.user as TokenPayload;
    await authService.logout(tokenUser.userId);
    ok(res, null, "Logged out successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Logout failed";
    fail(res, message);
  }
}

export async function legacyGetProfile(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const tokenUser = req.user as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
    });
    if (!user) {
      fail(res, "User not found");
      return;
    }

    ok(res, toMobileUser(user));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load profile";
    fail(res, message);
  }
}

export async function legacyUpdateProfile(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const tokenUser = req.user as TokenPayload;
    const updates = (req.body || {}) as {
      name?: unknown;
      phone?: unknown;
      avatar?: unknown;
      bio?: unknown;
      profile?: unknown;
      preferences?: unknown;
    };

    const setData: Record<string, unknown> = {};

    if (typeof updates.name === "string" && updates.name.trim()) {
      setData.name = updates.name.trim();
    }

    if (typeof updates.phone === "string") {
      const normalizedPhone = normalizeZwPhone(updates.phone);
      if (normalizedPhone && !isValidZwPhone(normalizedPhone)) {
        fail(res, "Invalid Zimbabwe phone number (format: +263XXXXXXXXX)");
        return;
      }
      if (normalizedPhone) {
        setData.phone = normalizedPhone;
      }
    }

    if (typeof updates.avatar === "string") {
      setData.avatar = updates.avatar;
    }

    const profile = asRecord(updates.profile);
    const bioValue =
      typeof updates.bio === "string"
        ? updates.bio
        : typeof profile["bio"] === "string"
          ? (profile["bio"] as string)
          : undefined;

    if (typeof bioValue === "string") {
      const trimmed = bioValue.trim();
      if (trimmed.length > 500) {
        fail(res, "Bio cannot exceed 500 characters");
        return;
      }
      if (trimmed) {
        setData.bio = trimmed;
      }
    }

    const prefs = isRecord(updates.preferences)
      ? (updates.preferences as Record<string, unknown>)
      : undefined;
    if (prefs) {
      const notifications =
        typeof prefs.notifications === "boolean"
          ? prefs.notifications
          : typeof prefs.pushNotifications === "boolean"
            ? prefs.pushNotifications
            : undefined;

      const emailUpdates =
        typeof prefs.emailUpdates === "boolean"
          ? prefs.emailUpdates
          : typeof prefs.emailNotifications === "boolean"
            ? prefs.emailNotifications
            : undefined;

      if (typeof notifications === "boolean")
        setData.pushNotifications = notifications;
      if (typeof emailUpdates === "boolean")
        setData.emailNotifications = emailUpdates;
    }

    const existing = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
    });
    if (!existing) {
      fail(res, "User not found");
      return;
    }

    const user =
      Object.keys(setData).length > 0
        ? await prisma.user.update({
            where: { id: tokenUser.userId },
            data: setData,
          })
        : existing;

    ok(res, toMobileUser(user), "Profile updated");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile";
    fail(res, message);
  }
}

export async function legacyForgotPassword(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email } = (req.body || {}) as { email?: string };

    if (!email || typeof email !== "string") {
      fail(res, "Email is required");
      return;
    }

    await authService.requestPasswordReset(email);

    ok(
      res,
      null,
      "If an account with that email exists, a password reset link has been sent",
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to request password reset";
    fail(res, message);
  }
}
