import { Router } from "express";
import type { RequestHandler } from "express";
import { getDatabaseHealth, getPrisma, isDatabaseReady } from "./config/db";
import { getAllowedOrigins } from "./config/origins";

const router = Router();

const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const requireDatabase: RequestHandler = (_req, res, next) => {
  const health = getDatabaseHealth();

  if (!health.configured) {
    res.status(503).json({
      error: "Database is not configured",
      dbReady: false,
    });
    return;
  }

  if (!health.ready) {
    res.status(503).json({
      error: "Database connection is not ready",
      dbReady: false,
    });
    return;
  }

  next();
};

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    dbReady: isDatabaseReady(),
    database: getDatabaseHealth(),
    apiBase: "/api",
  });
});

router.get("/diagnostics/public", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: getDatabaseHealth(),
    cors: {
      configuredOriginCount: getAllowedOrigins().length,
    },
    auth: {
      jwtConfigured: Boolean(process.env.JWT_SECRET),
      jwtRefreshConfigured: Boolean(process.env.JWT_REFRESH_SECRET),
      googleConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      facebookConfigured: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
    },
    callbacks: {
      google: "/auth/google/callback",
      facebook: "/auth/facebook/callback",
    },
  });
});

router.get(
  "/stories",
  requireDatabase,
  asyncHandler(async (_req, res) => {
    const stories = await getPrisma().story.findMany({
      where: {
        status: "published",
      },
      orderBy: [
        {
          featured: "desc",
        },
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 24,
    });

    res.json({ stories });
  }),
);

router.post(
  "/contact",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body as Record<string, string | undefined>;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ error: "Name, email, and message are required" });
      return;
    }

    const contact = await getPrisma().contact.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        subject: subject?.trim() || "Website contact",
        message: message.trim(),
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(201).json({ contact });
  }),
);

router.post(
  "/donations",
  requireDatabase,
  asyncHandler(async (req, res) => {
    const { amount, donorName, donorEmail, message, purpose } = req.body as Record<string, unknown>;
    const parsedAmount = typeof amount === "number" ? amount : Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || typeof donorName !== "string" || typeof donorEmail !== "string") {
      res.status(400).json({ error: "A valid amount, donor name, and donor email are required" });
      return;
    }

    const donation = await getPrisma().donation.create({
      data: {
        amount: parsedAmount,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        message: typeof message === "string" ? message.trim() : undefined,
        purpose: typeof purpose === "string" && purpose.trim() ? purpose.trim() : "general_donation",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(201).json({ donation });
  }),
);

export default router;
