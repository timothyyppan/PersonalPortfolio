const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatMonthYear(date: string): string {
  const [year, month] = date.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatDateRange(startDate: string, endDate?: string): string {
  const start = formatMonthYear(startDate);
  if (!endDate) return `${start} – Present`;
  return `${start} – ${formatMonthYear(endDate)}`;
}
