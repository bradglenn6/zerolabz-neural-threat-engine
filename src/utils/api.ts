/**
 * ZeroLabz Resilient Cloud-Native API Client
 * Provides graceful fallbacks, safe error handling, and robust network resilience.
 */

export async function safeFetchJson<T>(
  url: string,
  options?: RequestInit,
  fallback?: T
): Promise<{ ok: boolean; data: T }> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      return { ok: false, data: (fallback as T) };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch {
    // Gracefully return fallback without triggering unhandled console rejections
    return { ok: false, data: (fallback as T) };
  }
}
