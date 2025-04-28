// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

// Declare a global variable to hold the PrismaClient instance in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  // In production, always create a new instance
  prisma = new PrismaClient();
} else {
  // In development, reuse the instance attached to the 'global' object
  // This prevents exhausting database connections during hot-reloading
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;