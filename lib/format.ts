export function formatPlayed(
  startDate: string,
  endDate: string | undefined,
  status: 'in-progress' | 'complete'
): string {
  const startYear = startDate.slice(0, 4);

  if (!endDate) {
    return status === 'in-progress' ? `${startYear}–` : startYear;
  }

  const endYear = endDate.slice(0, 4);
  if (endYear === startYear) return startYear;

  return `${startYear}–${endYear.slice(2)}`;
}
