export function formatPlayed(
  startDate: string,
  endDate: string | undefined,
  status: 'in-progress' | 'complete'
): string {
  const startYear = startDate.slice(0, 4);

  if (status === 'in-progress') return `${startYear}–`;
  if (!endDate) return startYear;

  const endYear = endDate.slice(0, 4);
  if (endYear === startYear) return startYear;

  return `${startYear}–${endYear.slice(2)}`;
}
