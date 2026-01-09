import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import { ingestWebhook } from '../../controllers/webhookController';

const router = Router();

router.post('/:provider', asyncHandler(ingestWebhook));

export default router;
