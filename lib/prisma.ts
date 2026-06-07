import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Your correct generated path!
import { PrismaClient } from '../generated/prisma/client';

neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  // We will use your environment variable now. 
  // (If Next.js gives you cache trouble again, you can paste the hardcoded URL here instead).
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("🔴 DATABASE_URL is missing!");
  }

  // The correct v7 adapter setup!
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
};

declare global {
  // Brand new cache name to ensure Next.js uses this new code
  var prismaCacheV4: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaCacheV4 ?? prismaClientSingleton();

// Export this single instance to the rest of your app!
export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaCacheV4 = prisma;