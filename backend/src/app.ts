import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/routes/auth.routes';
import usersRoutes from './modules/users/routes/users.routes';
import menuRoutes from './modules/menu/routes/menu.routes';
import { errorHandler, notFound } from './shared/middlewares/error.middleware';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'SIGR API funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/menu', menuRoutes);

app.use(notFound);
app.use(errorHandler);
