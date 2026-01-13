import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { authenticate } from "../../utils/jwt";
import {
  getConnections,
  getConnectionRequests,
  sendConnectionRequest,
  respondToRequest,
  removeConnection,
  getSuggestions,
} from "../../controllers/connectionController";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getConnections));
router.get("/requests", asyncHandler(getConnectionRequests));
router.post("/requests/:targetUserId", asyncHandler(sendConnectionRequest));
router.patch("/requests/:requestId", asyncHandler(respondToRequest));
router.delete("/:connectionId", asyncHandler(removeConnection));
router.get("/suggestions", asyncHandler(getSuggestions));

export default router;
