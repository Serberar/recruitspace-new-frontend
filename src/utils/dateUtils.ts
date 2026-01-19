/**
 * Calcula el tiempo relativo desde una fecha hasta ahora.
 * Ej: "Hoy", "Ayer", "Hace 3 días", "Hace 2 semanas", "Hace 1 mes"
 */
export function getRelativeTime(
  date: Date,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('public.jobsList.postedToday');
  if (diffDays === 1) return t('public.jobsList.postedYesterday');
  if (diffDays < 7) return t('public.jobsList.postedDaysAgo', { days: diffDays });
  if (diffDays < 30) return t('public.jobsList.postedWeeksAgo', { weeks: Math.floor(diffDays / 7) });
  return t('public.jobsList.postedMonthsAgo', { months: Math.floor(diffDays / 30) });
}

/**
 * Verifica si una fecha es reciente (dentro de los últimos N días)
 */
export function isRecentDate(date: Date, daysThreshold: number = 3): boolean {
  const threshold = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;
  return new Date(date).getTime() > threshold;
}
