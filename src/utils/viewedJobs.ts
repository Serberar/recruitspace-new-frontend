const STORAGE_KEY = 'recruitspace_viewed_jobs';

export function getViewedJobIds(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set();
    return new Set(JSON.parse(stored));
  } catch {
    return new Set();
  }
}

export function markJobAsViewed(jobId: string): void {
  try {
    const viewed = getViewedJobIds();
    viewed.add(jobId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...viewed]));
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function isJobViewed(jobId: string): boolean {
  return getViewedJobIds().has(jobId);
}
