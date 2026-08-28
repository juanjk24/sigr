import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { db } from '../config/db';
import { pool } from '../config/db';
import { users, roles, categories, dishes } from './schema';
import { eq } from 'drizzle-orm';

const seed = async () => {
  console.log('✓ Sembrando datos iniciales...');

  const adminRole = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
  const clienteRole = await db.select().from(roles).where(eq(roles.name, 'cliente')).limit(1);

  if (adminRole[0]) {
    const existing = await db.select().from(users).where(eq(users.email, 'admin@sigr.com')).limit(1);
    if (!existing[0]) {
      const passwordHash = await bcrypt.hash('admin1234', 10);
      await db.insert(users).values({
        name: 'Administrador',
        email: 'admin@sigr.com',
        passwordHash,
        roleId: adminRole[0].id,
      });
      console.log('  + Usuario admin creado: admin@sigr.com / admin1234');
    } else {
      console.log('  = Usuario admin ya existe');
    }
  }

  if (clienteRole[0]) {
    const existing = await db.select().from(users).where(eq(users.email, 'cliente@sigr.com')).limit(1);
    if (!existing[0]) {
      const passwordHash = await bcrypt.hash('cliente1234', 10);
      await db.insert(users).values({
        name: 'Cliente Demo',
        email: 'cliente@sigr.com',
        passwordHash,
        roleId: clienteRole[0].id,
      });
      console.log('  + Usuario cliente creado: cliente@sigr.com / cliente1234');
    } else {
      console.log('  = Usuario cliente ya existe');
    }
  }

  const catCount = await db.select().from(categories);
  if (catCount.length === 0) {
    const [entradas] = await db
      .insert(categories)
      .values({ name: 'Entradas', description: 'Aperitivos y entrantes' })
      .returning();
    await db.insert(categories).values({ name: 'Platos Principales', description: 'Platos fuertes' });
    await db.insert(categories).values({ name: 'Bebidas', description: 'Bebidas y refrescos' });
    await db.insert(dishes).values({
      name: 'Ensalada César',
      description: 'Lechuga, crutones y parmesano',
      price: '45.50',
      categoryId: entradas.id,
    });
    console.log('  + Categorías y platos de ejemplo creados');
  } else {
    console.log('  = Categorías ya existen');
  }

  console.log('✓ Seed completado');
  await pool.end();
};

seed().catch((err) => {
  console.error('✗ Error en seed:', err);
  process.exit(1);
});
