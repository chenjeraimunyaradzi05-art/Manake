import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { contactRateLimit } from '../../middleware/rateLimit';
import { authenticate, authorize } from '../../utils/jwt';
import {
  createMessageSchema,
  messageSearchQuerySchema,
  messageQuerySchema,
  messageStatusSchema,
  sendMessageSchema,
  idParamsSchema,
} from '../../middleware/validation';
import { validate, validateAll } from '../../middleware/validation';
import {
  createMessage,
  listMessages,
  getMessage,
  updateMessageStatus,
  deleteMessage,
  markMessageRead,
  searchMessages,
  sendMessage,
} from '../../controllers/messageController';

const router = Router();

router.post(
  '/',
  contactRateLimit,
  validate(createMessageSchema, 'body'),
  asyncHandler(createMessage)
);

router.post(
  '/send',
  authenticate,
  contactRateLimit,
  validate(sendMessageSchema, 'body'),
  asyncHandler(sendMessage)
);

router.get(
  '/search',
  authenticate,
  validate(messageSearchQuerySchema, 'query'),
  asyncHandler(searchMessages)
);

router.patch(
  '/:id/read',
  authenticate,
  validate(idParamsSchema, 'params'),
  asyncHandler(markMessageRead)
);

router.get(
  '/',
  authenticate,
  validate(messageQuerySchema, 'query'),
  asyncHandler(listMessages)
);

router.get(
  '/:id',
  authenticate,
  authorize('admin', 'moderator'),
  validate(idParamsSchema, 'params'),
  asyncHandler(getMessage)
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'moderator'),
  validateAll({ params: idParamsSchema, body: messageStatusSchema }),
  asyncHandler(updateMessageStatus)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(idParamsSchema, 'params'),
  asyncHandler(deleteMessage)
);

export default router;
