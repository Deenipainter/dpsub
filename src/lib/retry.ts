import { Prisma } from "@prisma/client";

/**
 * Transient database-connection errors that are worth retrying. These surface
 * during brief pod restarts, network blips and connection resets — exactly the
 * "Can't reach database server" failures that should recover on the next
 * attempt rather than permanently degrading the request.
 */
const TRANSIENT_PRISMA_CODES = new Set(["P1001", "P1002", "P1017"]);

const TRANSIENT_MESSAGE =
  /can't reach database server|connection refused|connection reset|connection terminated|socket|timed out|econnrefused|etimedout|econnreset|epipe/i;

export function isTransientDbError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientUnknownRequestError) return true;
  if (error instanceof Prisma.PrismaClientRustPanicError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_PRISMA_CODES.has(error.code);
  }
  if (error instanceof Error) {
    return TRANSIENT_MESSAGE.test(error.message);
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run a database operation, retrying only on transient connection errors with
 * exponential backoff. Permanent errors (bad query, missing table, unique
 * violation, …) are rethrown immediately on the first attempt.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { retries?: number; baseDelayMs?: number; factor?: number } = {},
): Promise<T> {
  const { retries = 2, baseDelayMs = 250, factor = 2 } = options;

  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const canRetry = attempt < retries && isTransientDbError(error);
      if (!canRetry) throw error;
      await sleep(baseDelayMs * factor ** attempt);
    }
  }
}
