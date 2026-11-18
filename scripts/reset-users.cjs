/* eslint-disable @typescript-eslint/no-require-imports */
// Uso: node scripts/reset-users.cjs          -> solo muestra conteos
//      node scripts/reset-users.cjs --delete -> elimina usuarios y todos sus datos dependientes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function counts() {
  const [users, admins, employees, shifts, tasks, ghost, coachings] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'EMPLOYEE' } }),
    prisma.shift.count(),
    prisma.taskMetric.count(),
    prisma.ghostMessage.count(),
    prisma.coaching.count(),
  ]);
  return { users, admins, employees, shifts, tasks, ghostMessages: ghost, coachings };
}

async function main() {
  console.log('Antes:', await counts());
  if (!process.argv.includes('--delete')) return;

  // Orden respetando llaves foráneas: hijos primero, usuarios al final
  await prisma.$transaction([
    prisma.coaching.deleteMany(),
    prisma.ghostMessage.deleteMany(),
    prisma.taskMetric.deleteMany(),
    prisma.shift.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log('Después:', await counts());
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
