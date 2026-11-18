import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Always route through Neon's connection pooler with connection timeout to prevent serverless hanging
const pooledUrl =
  process.env.DATABASE_URL_POOLED ||
  process.env.DATABASE_URL?.replace('.c-8.us-east-2.aws.neon.tech', '-pooler.c-8.us-east-2.aws.neon.tech');

const finalUrl = pooledUrl
  ? pooledUrl.includes('connect_timeout')
    ? pooledUrl
    : `${pooledUrl}${pooledUrl.includes('?') ? '&' : '?'}connect_timeout=15`
  : undefined;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: finalUrl
      ? {
          db: {
            url: finalUrl,
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
