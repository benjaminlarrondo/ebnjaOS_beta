export async function runSilently<T>(
  job: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await job();
  } catch {
    return fallback;
  }
}

export async function safeJsonFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
