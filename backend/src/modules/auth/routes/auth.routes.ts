import { Router } from 'express';
import { registerHandler, loginHandler } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../validations/auth.validation';

const router = Router();

router.post('/register', validateRegister, registerHandler);
router.post('/login', validateLogin, loginHandler);

export default router;
