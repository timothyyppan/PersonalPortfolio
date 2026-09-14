export type CollectionKey = 'projects' | 'experience';

export interface CollectionConfig {
  key: CollectionKey;
  label: string;
  singular: string;
  nine: 'OUT' | 'IN';
  itemHeader: string;
  sections: readonly string[];
}

export const COLLECTIONS: Record<CollectionKey, CollectionConfig> = {
  projects: {
    key: 'projects',
    label: 'Projects',
    singular: 'Project',
    nine: 'OUT',
    itemHeader: 'PROJECT',
    sections: ['Overview', 'Design', 'Plan', 'What I Learned', 'Troubles / Debugging'],
  },
  experience: {
    key: 'experience',
    label: 'Experience',
    singular: 'Role',
    nine: 'IN',
    itemHeader: 'ROLE',
    sections: ['Overview', 'What I Built', 'What I Learned', 'Highlights'],
  },
};

export const COLLECTION_KEYS = Object.keys(COLLECTIONS) as CollectionKey[];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isCollectionKey(value: string): value is CollectionKey {
  return Object.prototype.hasOwnProperty.call(COLLECTIONS, value);
}

export function assertCollection(value: string): CollectionConfig {
  if (!isCollectionKey(value)) throw new Error(`Unknown collection "${value}"`);
  return COLLECTIONS[value];
}

export function assertSlug(value: string): string {
  if (!SLUG_PATTERN.test(value)) throw new Error(`Invalid slug "${value}"`);
  return value;
}
