import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { validateAll } from "../../middleware/validation";
import {
  socialAuth,
  socialAuthRedirect,
  socialAuthCallback,
  appleCodeExchange,
} from "../../controllers/socialAuthController";
import {
  listConnectedAccounts,
  disconnectAccount,
} from "../../controllers/socialAccountsController";
import {
  getSocialFeed,
  getInstagramFeed,
  getFacebookFeed,
  getTwitterFeed,
  getSocialPost,
  likeSocialPost,
  unlikeSocialPost,
  shareSocialPost,
} from "../../controllers/socialFeedController";
import { strictRateLimit } from "../../middleware/rateLimit";
import { authenticate, optionalAuth } from "../../utils/jwt";
import {
  socialAuthBodySchema,
  socialProviderParamsSchema,
  socialAuthorizeQuerySchema,
  socialCallbackQuerySchema,
  appleCodeExchangeSchema,
} from "../../middleware/validation";

const router = Router();

// ===== Apple PKCE Code Exchange (for mobile apps) =====
router.post(
  "/apple/exchange",
  strictRateLimit,
  validateAll({
    body: appleCodeExchangeSchema,
  }),
  asyncHandler(appleCodeExchange),
);

// ===== Social Feed Endpoints (must be defined BEFORE :provider params) =====
router.get("/feed", optionalAuth, asyncHandler(getSocialFeed));
router.get("/instagram/feed", optionalAuth, asyncHandler(getInstagramFeed));
router.get("/facebook/feed", optionalAuth, asyncHandler(getFacebookFeed));
router.get("/twitter/feed", optionalAuth, asyncHandler(getTwitterFeed));

// ===== Connected Accounts (must be defined BEFORE :provider params) =====
router.get("/accounts", authenticate, asyncHandler(listConnectedAccounts));
router.delete(
  "/accounts/:platform/:platformUserId",
  authenticate,
  asyncHandler(disconnectAccount),
);

// Single post details (mobile client contract)
router.get(
  "/:platform/posts/:postId",
  optionalAuth,
  asyncHandler(getSocialPost),
);
router.post(
  "/instagram/posts/:postId/like",
  optionalAuth,
  asyncHandler(likeSocialPost),
);
router.delete(
  "/instagram/posts/:postId/like",
  optionalAuth,
  asyncHandler(unlikeSocialPost),
);
router.post(
  "/instagram/posts/:postId/share",
  optionalAuth,
  asyncHandler(shareSocialPost),
);
router.post(
  "/facebook/posts/:postId/like",
  optionalAuth,
  asyncHandler(likeSocialPost),
);
router.delete(
  "/facebook/posts/:postId/like",
  optionalAuth,
  asyncHandler(unlikeSocialPost),
);
router.post(
  "/facebook/posts/:postId/share",
  optionalAuth,
  asyncHandler(shareSocialPost),
);
router.post(
  "/twitter/posts/:postId/like",
  optionalAuth,
  asyncHandler(likeSocialPost),
);
router.delete(
  "/twitter/posts/:postId/like",
  optionalAuth,
  asyncHandler(unlikeSocialPost),
);
router.post(
  "/twitter/posts/:postId/share",
  optionalAuth,
  asyncHandler(shareSocialPost),
);

// ===== Social Auth Endpoints =====

router.post(
  "/:provider",
  strictRateLimit,
  validateAll({
    params: socialProviderParamsSchema,
    body: socialAuthBodySchema,
  }),
  asyncHandler(socialAuth),
);

router.post(
  "/:provider/link",
  authenticate,
  validateAll({
    params: socialProviderParamsSchema,
    body: socialAuthBodySchema,
  }),
  asyncHandler(socialAuth),
);

router.get(
  "/:provider/authorize",
  strictRateLimit,
  validateAll({
    params: socialProviderParamsSchema,
    query: socialAuthorizeQuerySchema,
  }),
  asyncHandler(socialAuthRedirect),
);

router.get(
  "/:provider/callback",
  validateAll({
    params: socialProviderParamsSchema,
    query: socialCallbackQuerySchema,
  }),
  asyncHandler(socialAuthCallback),
);

export default router;
