import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { assertCollection, assertSlug, type CollectionKey } from './collections';

export const CONTENT_ROOT = path.join(process.cwd(), 'content');

export type EntryStatus = 'in-progress' | 'complete';

export interface EntryFrontmatter {
  title: string;
  tags: string[];
  startDate: string;
  endDate?: string;
  status?: EntryStatus;
  hook?: string;
  org?: string;
  role?: string;
  location?: string;
  order?: number;
}

export interface Entry extends EntryFrontmatter {
  collection: CollectionKey;
  slug: string;
  content: string;
}

export function collectionDir(collection: CollectionKey, root: string = CONTENT_ROOT): string {
  return path.join(root, assertCollection(collection).key);
}

export function getEntries(collection: CollectionKey, root: string = CONTENT_ROOT): Entry[] {
  const dir = collectionDir(collection, root);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => getEntry(collection, d.name, root))
    .filter((e): e is Entry => e !== null)
    .sort((a, b) => {
      const orderA = a.order ?? Number.POSITIVE_INFINITY;
      const orderB = b.order ?? Number.POSITIVE_INFINITY;
      if (orderA !== orderB) return orderA - orderB;
      return b.startDate.localeCompare(a.startDate);
    });
}

export function getEntry(
  collection: CollectionKey,
  slug: string,
  root: string = CONTENT_ROOT
): Entry | null {
  let safeSlug: string;
  try {
    safeSlug = assertSlug(slug);
  } catch {
    return null;
  }

  const filePath = path.join(collectionDir(collection, root), safeSlug, 'index.mdx');
  if (!fs.existsSync(filePath)) return null;

  try {
    const { data, content } = matter(fs.readFileSync(filePath, 'utf-8'));

    if (!data.title || !data.startDate) {
      throw new Error('missing required frontmatter (title or startDate)');
    }

    return {
      collection,
      slug: safeSlug,
      title: data.title,
      tags: data.tags ?? [],
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      hook: data.hook,
      org: data.org,
      role: data.role,
      location: data.location,
      order: data.order,
      content,
    };
  } catch (error) {
    console.error(`Skipping ${collection}/${safeSlug}: ${(error as Error).message}`);
    return null;
  }
}
