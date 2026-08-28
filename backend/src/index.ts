import { app } from './app';
import { env } from './config/env';
import { pool } from './config/db';
import { ensureRole } from './modules/auth/repositories/auth.repository';

const start = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✓ Conexión a PostgreSQL establecida');

    await Promise.all([
      ensureRole('admin'),
      ensureRole('staff'),
      ensureRole('cliente'),
    ]);

    app.listen(env.port, () => {
      console.log(`✓ Servidor SIGR en http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('✗ Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

start();
