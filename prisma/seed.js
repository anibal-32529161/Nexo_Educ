const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando sembrado de la base de datos...');

  // Limpiar usuarios existentes para evitar duplicados
  await prisma.usuario.deleteMany();
  console.log('Usuarios existentes eliminados.');

  // Crear contraseñas hasheadas
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  // Crear administrador de prueba
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administrador Nexora',
      email: 'admin@nexora.com',
      contrasena_hash: adminHash,
      rol: 'admin',
    },
  });
  console.log(`Usuario administrador creado: ${admin.email}`);

  // Crear usuario normal de prueba
  const normalUser = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      email: 'user@nexora.com',
      contrasena_hash: userHash,
      rol: 'normal',
    },
  });
  console.log(`Usuario normal creado: ${normalUser.email}`);

  console.log('Sembrado completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el sembrado de base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
