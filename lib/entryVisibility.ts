import type { EntryStatus } from './content';

export function canShowEntryContent(status?: EntryStatus): boolean {
  return status !== 'in-progress' || process.env.NODE_ENV === 'development';
}
