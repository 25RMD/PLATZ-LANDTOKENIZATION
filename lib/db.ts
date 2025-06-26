import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: https://pris.ly/d/help/next-js-best-practices

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Provide a runtime alias so legacy code using `prisma.landListing` continues to work
// after the model was renamed to `land_listings` in the Prisma schema. This avoids
// a sweeping refactor across dozens of files. We intentionally add the property on
// the instantiated client so it behaves just like a normal delegate.

export const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'], // Uncomment for detailed logging
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Ensure there is a default export for module systems

// Ensure legacy delegate alias is present (runtime only)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!(prisma as any).landListing && (prisma as any).land_listings) {
  // Map camelCase alias to the snake_case delegate
  (prisma as any).landListing = (prisma as any).land_listings;
}

// Add alias for user -> users delegate
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!(prisma as any).user && (prisma as any).users) {
  (prisma as any).user = (prisma as any).users;
}

export default prisma; 