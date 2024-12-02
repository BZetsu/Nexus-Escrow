export async function batchRequests<T>(
  items: any[],
  batchSize: number,
  requestFn: (item: any) => Promise<T>
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => requestFn(item))
    );
    results.push(...batchResults);
  }
  
  return results;
} 