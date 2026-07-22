import { prisma } from '../lib/db/client';

async function check() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users.map(u => ({ id: u.id, username: u.username, email: u.email, name: u.name })));
}

check();
