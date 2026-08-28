import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import { profileHandler, listHandler } from '../controllers/users.controller';

const router = Router();

router.get('/me', authenticate, profileHandler);
router.get('/', authenticate, listHandler);

export default router;
