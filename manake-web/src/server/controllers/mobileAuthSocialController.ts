import type { Request, Response } from "express";

import crypto from "crypto";
import { prisma } from "../config/prisma";
import { type SocialPlatform } from "../models/SocialAccount";
import { generateTokenPair, hashToken, verifyRefreshToken } from "../utils/jwt";
import { BadRequestError } from "../errors";
import { exchangeAppleCode, verifyGoogleIdToken } from "../services/socialAuth";

type LegacySuccess<T> = { success: true; data: T; message?: string };
type LegacyFailure = { success: false; data: null; message: string };

type LegacyAuthData = {
  user: Record<string, unknown>;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
};

function ok(res: Response, data: LegacyAuthData, message = "Login successful") {
  const payload: LegacySuccess<LegacyAuthData> = {
    success: true,
    data,
    message,
  };
  res.json(payload);
}

function fail(res: Response, message: string) {
  const payload: LegacyFailure = { success: false, data: null, message };
  res.json(payload);
}

async function upsertUserFromSocial(profile: {
  provider: SocialPlatform;
  platformUserId: string;
  email?: string;
  name?: string;
  picture?: string;
}) {
  const existingAccount = await prisma.socialAccount.findFirst({
    where: {
      platform: profile.provider,
      platformUserId: profile.platformUserId,
    },
  });

  if (existingAccount) {
    const user = await prisma.user.findUnique({
      where: { id: existingAccount.userId },
    });
    if (user) return user;
  }

  if (profile.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
    });
    if (existingUser) return existingUser;
  }

  if (!profile.email) {
    throw new BadRequestError("Email is required to create a new account");
  }

  const passwordHash = crypto
    .createHash("sha256")
    .update(crypto.randomBytes(16))
    .digest("hex");

  return prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      passwordHash,
      role: "user",
      avatar: profile.picture,
    },
  });
}

async function upsertSocialAccount(args: {
  userId: string;
  provider: SocialPlatform;
  platformUserId: string;
  email?: string;
  name?: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}) {
  return prisma.socialAccount.upsert({
    where: {
      userId_platform_platformUserId: {
        userId: args.userId,
        platform: args.provider,
        platformUserId: args.platformUserId,
      },
    },
    update: {
      platformUsername: args.email,
      displayName: args.name,
      profilePictureUrl: args.picture,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiresAt: args.expiresAt,
      scopes: [],
      isActive: true,
      lastSyncAt: new Date(),
      syncError: undefined,
    },
    create: {
      userId: args.userId,
      platform: args.provider,
      platformUserId: args.platformUserId,
      platformUsername: args.email,
      displayName: args.name,
      profilePictureUrl: args.picture,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiresAt: args.expiresAt,
      scopes: [],
      isActive: true,
    },
  });
}

export async function legacySocialLoginGoogle(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { idToken } = (req.body || {}) as { idToken?: string };
    if (!idToken || typeof idToken !== "string") {
      return fail(res, "idToken is required");
    }

    const profile = await verifyGoogleIdToken(idToken);

    const user = await upsertUserFromSocial({
      provider: "google",
      platformUserId: profile.platformUserId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    await upsertSocialAccount({
      userId: user.id,
      provider: "google",
      platformUserId: profile.platformUserId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      accessToken: idToken,
      refreshToken: profile.refreshToken,
      expiresAt: profile.expiresAt,
    });

    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshPayload = verifyRefreshToken(tokens.refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken),
        deviceInfo: req.headers["user-agent"] as string | undefined,
        ipAddress: req.ip,
        expiresAt: new Date((refreshPayload.exp ?? 0) * 1000),
        revoked: false,
      },
    });

    const { passwordHash: _phGoogle, ...publicUser } = user;
    void _phGoogle;
    return ok(res, {
      user: publicUser as Record<string, unknown>,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Social login failed";
    return fail(res, message);
  }
}

export async function legacySocialLoginApple(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { code, codeVerifier, redirectUri } = (req.body || {}) as {
      code?: string;
      codeVerifier?: string;
      redirectUri?: string;
      clientId?: string;
    };

    if (!code || typeof code !== "string") {
      return fail(res, "code is required");
    }

    const profile = await exchangeAppleCode(code, redirectUri, codeVerifier);

    const user = await upsertUserFromSocial({
      provider: "apple",
      platformUserId: profile.platformUserId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    await upsertSocialAccount({
      userId: user.id,
      provider: "apple",
      platformUserId: profile.platformUserId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      accessToken: profile.accessToken || "",
      refreshToken: profile.refreshToken,
      expiresAt: profile.expiresAt,
    });

    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshPayload = verifyRefreshToken(tokens.refreshToken);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken),
        deviceInfo: req.headers["user-agent"] as string | undefined,
        ipAddress: req.ip,
        expiresAt: new Date((refreshPayload.exp ?? 0) * 1000),
        revoked: false,
      },
    });

    const { passwordHash: _phApple, ...publicUserApple } = user;
    void _phApple;
    return ok(res, {
      user: publicUserApple as Record<string, unknown>,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Social login failed";
    return fail(res, message);
  }
}
