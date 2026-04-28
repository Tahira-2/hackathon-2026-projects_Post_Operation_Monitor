
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.callSession.findMany({
    take: 5,
    include: {
      transcripts: {
        take: 1
      }
    }
  });
  console.log(JSON.stringify(sessions, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
