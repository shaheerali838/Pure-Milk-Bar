import { Router } from 'express';
import { login, refreshToken, getMe, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { validateLogin } from '../validators/auth.validator.js';

const router = Router();


router.post('/login', validateLogin, login);


router.post('/refresh', refreshToken);


router.get('/me', authenticate, getMe);


router.post('/logout', authenticate, logout);

export default router;
