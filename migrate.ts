import { prisma } from './lib/db/client';

async function main() {
  const users = await prisma.user.findMany();
  let updated = 0;
  for (const user of users) {
    if (!user.username && user.email) {
      const baseUsername = user.email.split('@')[0];
      let newUsername = baseUsername;
      let counter = 1;
      
      while (true) {
        const exists = await prisma.user.findUnique({ where: { username: newUsername } });
        if (!exists) break;
        newUsername = baseUsername + counter;
        counter++;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { username: newUsername }
      });
      updated++;
    }
  }
  console.log(`Updated ${updated} users with a username.`);
}
main().catch(console.error).then(() => process.exit(0));
