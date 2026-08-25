/**
 * Simple bounded concurrency queue to prevent Drive API rate limit spikes.
 * Limits the maximum number of concurrent Drive API requests.
 */

const MAX_CONCURRENT = 8;
let running = 0;
const queue: (() => void)[] = [];

export async function runWithConcurrencyLimit<T>(task: () => Promise<T>): Promise<T> {
  if (running >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => {
      queue.push(resolve);
    });
  }
  
  running++;
  try {
    return await task();
  } finally {
    running--;
    if (queue.length > 0) {
      const next = queue.shift();
      if (next) next();
    }
  }
}
