import { Router } from 'express';
import { submitContact } from '../controllers/contactController';
import { contactRateLimit } from '../middleware/rateLimit';

const router = Router();

// Rate limited to prevent spam
router.post('/', contactRateLimit, submitContact);

export default router;
