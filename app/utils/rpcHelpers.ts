const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  baseDelay = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && error.toString().includes('429')) {
      const nextDelay = baseDelay * (2 ** (3 - retries));
      console.log(`RPC rate limited. Retrying in ${nextDelay}ms... (${retries} retries left)`);
      await delay(nextDelay);
      return withRetry(operation, retries - 1, baseDelay);
    }
    throw error;
  }
} 