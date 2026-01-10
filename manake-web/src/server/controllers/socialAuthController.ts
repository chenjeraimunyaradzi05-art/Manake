import { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/User";
import {
  SocialAccount,
  SocialPlatform,
  ISocialAccount,
} from "../models/SocialAccount";
import { generateTokenPair } from "../utils/jwt";
import { BadRequestError, UnauthorizedError } from "../errors";
import {
  verifySocialToken,
  SocialProvider,
  generateRandomPassword,
  buildAuthUrl,
  exchangeCodeForProfile,
} from "../services/socialAuth";

interface SocialAuthBody {
  token: string;
  mode?: "login" | "link";
  scopes?: string[];
  pageId?: string;
  pageName?: string;
}

const sanitizeAccount = (account: ISocialAccount) => {
  const json = account.toObject({ getters: true, versionKey: false });
  delete (json as Record<string, unknown>).accessToken;
  delete (json as Record<string, unknown>).refreshToken;
  delete (json as Record<string, unknown>).pageAccessToken;
  return json;
};

const upsertUserFromSocial = async (
  provider: SocialProvider,
  profile: {
    email?: string;
    name?: string;
    platformUserId: string;
    picture?: string;
  },
) => {
  // Try find by social account first
  const existingAccount = await SocialAccount.findOne({
    platform: provider as SocialPlatform,
    platformUserId: profile.platformUserId,
  });

  if (existingAccount) {
    const user = await User.findById(existingAccount.userId);
    if (user) return user;
  }

  // Then by email
  if (profile.email) {
    const existingUser = await User.findOne({ email: profile.email });
    if (existingUser) return existingUser;
  }

  if (!profile.email) {
    throw new BadRequestError("Email is required to create a new account");
  }

  // Create new user with random password (since social auth)
  const passwordHash = await crypto
    .createHash("sha256")
    .update(generateRandomPassword())
    .digest("hex");

  const user = await User.create({
    email: profile.email,
    name: profile.name || profile.email.split("@")[0],
    passwordHash,
    role: "user",
    avatar: profile.picture,
    socialProfiles: {
      [provider]: profile.platformUserId,
    },
  });

  return user;
};

const upsertSocialAccount = async (
  userId: string,
  provider: SocialProvider,
  profile: Awaited<ReturnType<typeof verifySocialToken>>, // includes tokens
  scopes?: string[],
  pageId?: string,
  pageName?: string,
) => {
  const expiresAt = profile.expiresAt;

  const account = await SocialAccount.findOneAndUpdate(
    {
      userId,
      platform: provider,
      platformUserId: profile.platformUserId,
    },
    {
      platformUsername: profile.email,
      displayName: profile.name,
      profilePictureUrl: profile.picture,
      accessToken: profile.accessToken || "",
      refreshToken: profile.refreshToken,
      tokenExpiresAt: expiresAt,
      scopes: scopes || [],
      pageId,
      pageName,
      isActive: true,
      lastSyncAt: new Date(),
      syncError: undefined,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return account;
};

export const socialAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const provider = req.params.provider as SocialProvider;
  const {
    token,
    mode = "login",
    scopes,
    pageId,
    pageName,
  } = req.body as SocialAuthBody;

  const profile = await verifySocialToken(provider, token);

  let user = await upsertUserFromSocial(provider, profile);

  if (mode === "link") {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication required to link accounts");
    }
    user = (await User.findById(req.user.userId)) || user;
  }

  const socialAccount = await upsertSocialAccount(
    user.id,
    provider,
    profile,
    scopes,
    pageId,
    pageName,
  );

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(mode === "link" ? 200 : 201).json({
    message: mode === "link" ? "Account linked" : "Login successful",
    user: user.toPublicJSON(),
    socialAccount: sanitizeAccount(socialAccount),
    ...tokens,
  });
};

export const socialAuthRedirect = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const provider = req.params.provider as SocialProvider;
  const { redirectUri } = req.query as { redirectUri?: string };

  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = buildAuthUrl(provider, state, redirectUri);

  res.json({ authUrl, state });
};

export const socialAuthCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const provider = req.params.provider as SocialProvider;
  const {
    code,
    redirectUri,
    mode = "login",
  } = req.query as {
    code: string;
    redirectUri?: string;
    mode?: "login" | "link";
  };

  const profile = await exchangeCodeForProfile(provider, code, redirectUri);

  let user = await upsertUserFromSocial(provider, profile);

  if (mode === "link") {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication required to link accounts");
    }
    user = (await User.findById(req.user.userId)) || user;
  }

  const socialAccount = await upsertSocialAccount(
    user.id,
    provider,
    profile,
    undefined,
    undefined,
    undefined,
  );

  const tokens = generateTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(mode === "link" ? 200 : 201).json({
    message: mode === "link" ? "Account linked" : "Login successful",
    user: user.toPublicJSON(),
    socialAccount: sanitizeAccount(socialAccount),
    ...tokens,
  });
};
