import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { assertCollection, assertSlug, type CollectionKey } from './collections';
import { CONTENT_ROOT, collectionDir, type EntryFrontmatter } from './content';

export type SectionMap = Record<string, string>;

export interface EntryInput extends EntryFrontmatter {
  sections: SectionMap;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildBody(sections: SectionMap, sectionNames: readonly string[]): string {
  return sectionNames.map((name) => `## ${name}\n\n${(sections[name] ?? '').trim()}\n`).join('\n');
}

// Treats any line starting with "## " as a section boundary, with no awareness of fenced
// code blocks or quoted examples. If a section's own prose contains a "## <real section name>"
// line (e.g. someone pastes example Markdown), that line is mistaken for a real boundary. This
// is a known limitation for hand-edited content; not guarded against here.
export function parseSections(body: string, sectionNames: readonly string[]): SectionMap {
  const result: SectionMap = {};
  for (const name of sectionNames) result[name] = '';

  const matches = [...body.matchAll(/^##\s+(.+)$/gm)];
  const boundaries = matches.filter((m) => sectionNames.includes(m[1].trim()));

  for (let i = 0; i < boundaries.length; i++) {
    const current = boundaries[i];
    const start = current.index! + current[0].length;
    const next = boundaries[i + 1];
    const end = next ? next.index! : body.length;
    result[current[1].trim()] = body.slice(start, end).trim();
  }

  return result;
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}

function entryDir(collection: CollectionKey, slug: string, root: string): string {
  return path.join(collectionDir(collection, root), assertSlug(slug));
}

function writeEntryFile(
  collection: CollectionKey,
  slug: string,
  frontmatter: EntryFrontmatter,
  sections: SectionMap,
  root: string
): void {
  const config = assertCollection(collection);
  const body = buildBody(sections, config.sections);
  const file = path.join(entryDir(collection, slug, root), 'index.mdx');
  fs.writeFileSync(file, matter.stringify(body, stripUndefined(frontmatter)), 'utf-8');
}

export function createEntry(
  collection: CollectionKey,
  title: string,
  root: string = CONTENT_ROOT
): string {
  const config = assertCollection(collection);
  const slug = assertSlug(slugify(title));
  const dir = entryDir(collection, slug, root);
  if (fs.existsSync(dir)) throw new Error(`Entry "${slug}" already exists in ${collection}`);

  fs.mkdirSync(dir, { recursive: true });

  try {
    const sections: SectionMap = {};
    for (const name of config.sections) {
      sections[name] = `_Placeholder: fill in ${name.toLowerCase()}._`;
    }

    writeEntryFile(
      collection,
      slug,
      {
        title,
        tags: [],
        startDate: new Date().toISOString().slice(0, 10),
        status: 'in-progress',
        hook: '',
      },
      sections,
      root
    );
  } catch (error) {
    // Don't leave a directory behind with no index.mdx -- that would make every future
    // createEntry for this slug fail with a misleading "already exists" forever.
    fs.rmSync(dir, { recursive: true, force: true });
    throw error;
  }

  return slug;
}

export function updateEntry(
  collection: CollectionKey,
  slug: string,
  input: EntryInput,
  root: string = CONTENT_ROOT
): void {
  const dir = entryDir(collection, slug, root);
  if (!fs.existsSync(dir)) throw new Error(`Entry "${slug}" not found in ${collection}`);

  const { sections, ...frontmatter } = input;
  writeEntryFile(collection, slug, frontmatter, sections, root);
}

export function deleteEntry(
  collection: CollectionKey,
  slug: string,
  root: string = CONTENT_ROOT
): void {
  const dir = entryDir(collection, slug, root);
  if (!fs.existsSync(dir)) throw new Error(`Entry "${slug}" not found in ${collection}`);

  fs.rmSync(dir, { recursive: true, force: true });
}
