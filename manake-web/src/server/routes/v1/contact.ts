/**
 * Contact Routes - API v1
 */
import { Router, Request, Response } from "express";
import { submitContact } from "../../controllers/contactController";
import { asyncHandler } from "../../middleware/errorHandler";
import {
  validate,
  contactSchema,
  paginationSchema,
  idParamsSchema,
} from "../../middleware/validation";
import { contactRateLimit } from "../../middleware/rateLimit";
import { authenticate, authorize } from "../../utils/jwt";
import { Contact } from "../../models/Contact";
import { z } from "zod";

const router = Router();

// Public routes
router.post(
  "/",
  contactRateLimit,
  validate(contactSchema, "body"),
  asyncHandler(submitContact),
);

// Protected routes (admin only)
router.get(
  "/",
  authenticate,
  authorize("admin"),
  validate(paginationSchema, "query"),
  asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Contact.countDocuments(),
    ]);

    res.json({
      data: contacts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  }),
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  validate(idParamsSchema, "params"),
  validate(
    z.object({
      status: z.enum(["pending", "reviewed", "resolved", "spam"]),
    }),
    "body",
  ),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  }),
);

export default router;
