# Golf-Themed Personal Portfolio Implementation Plan

> **For agentic workers:** Execute task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Run the stated verification command after each step and do not advance past a failing one.

**Goal:** Build a Next.js portfolio where a golf scorecard is the structural index of two content collections — projects and work experience — each entry a deep-dive MDX write-up, authored through a dev-only local admin UI.

**Architecture:** Content lives as MDX under `content/<collection>/<slug>/index.mdx`. A collection registry (`lib/collections.ts`) defines each collection's key and section list; the loader, entry CRUD, detail template, index template, and admin UI are all collection-agnostic and driven by that registry. No database. A dev-only admin UI writes MDX files through local API routes that whitelist their path parameters.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind, `next-mdx-remote/rsc`, `gray-matter`, `@tailwindcss/typography`, `next/font/google`, Vitest + Testing Library.

**Design constraints (from the spec — do not drift):** No all-caps eyebrow labels outside the scorecard header row. No `A · B · C` middot strings. No single-word color accents in headlines. Numbered markers only on holes. No entrance animations.

**Testing scope:** Tests cover `lib/*` logic, path-parameter validation, `Scorecard`, and the two interactive admin components. Presentational server components and page shells are covered by `npm run build` and the Task 18 manual walkthrough — App Router async server components don't render meaningfully under jsdom.

---

## File structure

```
package.json tsconfig.json next.config.mjs postcss.config.js tailwind.config.ts .eslintrc.json
vitest.config.ts vitest.setup.ts
lib/
  collections.ts     # registry + path-param validation
  content.ts         # getEntries, getEntry
  entries.ts         # slugify, buildBody, parseSections, create/update/deleteEntry
  format.ts          # formatPlayed
  devGuard.ts        # isAdminEnabled
components/
  Nav.tsx Footer.tsx Scorecard.tsx DemoEmbed.tsx
  CollectionIndex.tsx EntryDetail.tsx
  admin/EntryForm.tsx admin/AdminDashboard.tsx
app/
  layout.tsx globals.css page.tsx not-found.tsx icon.svg opengraph-image.tsx sitemap.ts
  projects/page.tsx projects/[slug]/page.tsx
  experience/page.tsx experience/[slug]/page.tsx
  about/page.tsx
  admin/page.tsx admin/[collection]/[slug]/edit/page.tsx
  api/admin/[collection]/route.ts api/admin/[collection]/[slug]/route.ts
content/projects/… content/experience/…
public/TimothyPanResume.pdf
```

---

### Task 1: Scaffold

**Files:** `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.js`, `.eslintrc.json`, `tailwind.config.ts`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "personal-portfolio",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "gray-matter": "^4.0.3",
    "next-mdx-remote": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^20.14.15",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.7",
    "@tailwindcss/typography": "^0.5.13",
    "postcss": "^8.4.40",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5",
    "vitest": "^2.0.5",
    "@vitejs/plugin-react": "^4.3.1",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.8",
    "jsdom": "^24.1.1"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write config files**

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

`postcss.config.js`:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`.eslintrc.json`:
```json
{ "extends": "next/core-web-vitals" }
```

- [ ] **Step 4: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        card: '#EFE9D8',
        cardRaised: '#F3EEDF',
        rule: '#C3BA9C',
        ruleSoft: '#E2DAC2',
        ink: '#14301E',
        inkSoft: '#55604F',
        flag: '#B8973F',
        mark: '#A8443A',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
```

- [ ] **Step 5: Install**

Run: `npm install`
Expected: completes without peer-dependency errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs postcss.config.js .eslintrc.json tailwind.config.ts
git commit -m "Scaffold Next.js project with scorecard palette tokens"
```

---

### Task 2: Vitest setup and dev guard

**Files:** Create `vitest.config.ts`, `vitest.setup.ts`, `lib/devGuard.ts`; Test `lib/devGuard.test.ts`

- [ ] **Step 1: Write `vitest.config.ts` and `vitest.setup.ts`**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 2: Write the failing test**

```ts
// lib/devGuard.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { isAdminEnabled } from './devGuard';

describe('isAdminEnabled', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns true in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isAdminEnabled()).toBe(true);
  });

  it('returns false in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(isAdminEnabled()).toBe(false);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run lib/devGuard.test.ts`
Expected: FAIL — `Cannot find module './devGuard'`

- [ ] **Step 4: Implement**

```ts
// lib/devGuard.ts
export function isAdminEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run lib/devGuard.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts lib/devGuard.ts lib/devGuard.test.ts
git commit -m "Add Vitest setup and dev-only admin guard"
```

---

### Task 3: Collection registry and path-parameter validation

**Files:** Create `lib/collections.ts`; Test `lib/collections.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/collections.test.ts
import { describe, it, expect } from 'vitest';
import { COLLECTIONS, assertCollection, assertSlug, isCollectionKey } from './collections';

describe('COLLECTIONS', () => {
  it('defines distinct section lists per collection', () => {
    expect(COLLECTIONS.projects.sections).toContain('Troubles / Debugging');
    expect(COLLECTIONS.experience.sections).toContain('What I Built');
    expect(COLLECTIONS.experience.sections).not.toContain('Troubles / Debugging');
  });

  it('assigns projects to the OUT nine and experience to IN', () => {
    expect(COLLECTIONS.projects.nine).toBe('OUT');
    expect(COLLECTIONS.experience.nine).toBe('IN');
  });
});

describe('isCollectionKey', () => {
  it('accepts known collections', () => {
    expect(isCollectionKey('projects')).toBe(true);
    expect(isCollectionKey('experience')).toBe(true);
  });

  it('rejects unknown keys and inherited Object properties', () => {
    expect(isCollectionKey('posts')).toBe(false);
    expect(isCollectionKey('constructor')).toBe(false);
    expect(isCollectionKey('__proto__')).toBe(false);
  });
});

describe('assertCollection', () => {
  it('returns the config for a known collection', () => {
    expect(assertCollection('projects').label).toBe('Projects');
  });

  it('throws for an unknown collection', () => {
    expect(() => assertCollection('../secrets')).toThrow('Unknown collection');
  });
});

describe('assertSlug', () => {
  it('accepts kebab-case slugs', () => {
    expect(assertSlug('asic-math-accelerator')).toBe('asic-math-accelerator');
  });

  it('rejects traversal and unsafe characters', () => {
    expect(() => assertSlug('../../etc/passwd')).toThrow('Invalid slug');
    expect(() => assertSlug('a/b')).toThrow('Invalid slug');
    expect(() => assertSlug('Has Spaces')).toThrow('Invalid slug');
    expect(() => assertSlug('')).toThrow('Invalid slug');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/collections.test.ts`
Expected: FAIL — `Cannot find module './collections'`

- [ ] **Step 3: Implement**

```ts
// lib/collections.ts
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
```

`isCollectionKey` uses `hasOwnProperty` rather than `value in COLLECTIONS` so inherited names like `constructor` are rejected.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/collections.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/collections.ts lib/collections.test.ts
git commit -m "Add collection registry with path-parameter validation"
```

---

### Task 4: Date formatting

**Files:** Create `lib/format.ts`; Test `lib/format.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatPlayed } from './format';

describe('formatPlayed', () => {
  it('shows a single year when start and end share one', () => {
    expect(formatPlayed('2025-01-01', '2025-08-01', 'complete')).toBe('2025');
  });

  it('shows an abbreviated span across years', () => {
    expect(formatPlayed('2024-09-01', '2025-04-01', 'complete')).toBe('2024–25');
  });

  it('shows the start year alone when complete with no end date', () => {
    expect(formatPlayed('2024-05-01', undefined, 'complete')).toBe('2024');
  });

  it('shows an open span when in progress', () => {
    expect(formatPlayed('2025-06-01', undefined, 'in-progress')).toBe('2025–');
  });

  it('shows an open span when in progress even if a stale end date is set', () => {
    expect(formatPlayed('2025-06-01', '2025-12-01', 'in-progress')).toBe('2025–');
  });
});
```

`status` is checked before `endDate` is even looked at, so a stale or accidentally-set end date on an in-progress entry can never override the open-span display. The admin form (Task 16) always renders an editable end-date field regardless of status, so this state is reachable, not hypothetical.

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/format.test.ts`
Expected: FAIL — `Cannot find module './format'`

- [ ] **Step 3: Implement**

```ts
// lib/format.ts
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/format.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/format.ts lib/format.test.ts
git commit -m "Add played-date formatting for scorecard rows"
```

---

### Task 5: Content loader

**Files:** Create `lib/content.ts`; Test `lib/content.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/content.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getEntries, getEntry } from './content';

let root: string;

function writeEntry(collection: string, slug: string, frontmatter: string, body: string) {
  const dir = path.join(root, collection, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.mdx'), `---\n${frontmatter}\n---\n\n${body}\n`, 'utf-8');
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-'));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('getEntries', () => {
  it('returns an empty array when the collection directory is absent', () => {
    expect(getEntries('projects', root)).toEqual([]);
  });

  it('sorts entries by startDate descending', () => {
    writeEntry('projects', 'older', 'title: Older\ntags: []\nstartDate: "2024-01-01"\nstatus: complete\nhook: h', '## Overview\n\nA');
    writeEntry('projects', 'newer', 'title: Newer\ntags: []\nstartDate: "2025-01-01"\nstatus: complete\nhook: h', '## Overview\n\nB');

    expect(getEntries('projects', root).map((e) => e.slug)).toEqual(['newer', 'older']);
  });

  it('keeps collections separate', () => {
    writeEntry('projects', 'a-project', 'title: A\ntags: []\nstartDate: "2025-01-01"\nstatus: complete\nhook: h', '## Overview\n\nA');
    writeEntry('experience', 'a-role', 'title: B\ntags: []\nstartDate: "2025-01-01"\nstatus: complete\nhook: h\norg: Apple', '## Overview\n\nB');

    expect(getEntries('projects', root).map((e) => e.slug)).toEqual(['a-project']);
    expect(getEntries('experience', root)[0].org).toBe('Apple');
  });

  it('ignores directories starting with an underscore', () => {
    writeEntry('projects', '_draft', 'title: D\ntags: []\nstartDate: "2025-01-01"\nstatus: complete\nhook: h', '## Overview\n\nD');
    expect(getEntries('projects', root)).toEqual([]);
  });
});

describe('getEntry', () => {
  it('returns a parsed entry', () => {
    writeEntry('projects', 'a-project', 'title: A\ntags:\n  - Python\nstartDate: "2025-01-01"\nstatus: complete\nhook: Hook', '## Overview\n\nBody');

    const entry = getEntry('projects', 'a-project', root);
    expect(entry?.title).toBe('A');
    expect(entry?.tags).toEqual(['Python']);
    expect(entry?.collection).toBe('projects');
    expect(entry?.content.trim()).toBe('## Overview\n\nBody');
  });

  it('returns null for a missing entry', () => {
    expect(getEntry('projects', 'missing', root)).toBeNull();
  });

  it('returns null rather than throwing for an invalid slug', () => {
    expect(getEntry('projects', '../escape', root)).toBeNull();
  });

  it('returns null rather than throwing on malformed YAML frontmatter', () => {
    const dir = path.join(root, 'projects', 'broken');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.mdx'), '---\ntitle: [unterminated\n---\n\nBody\n', 'utf-8');

    expect(getEntry('projects', 'broken', root)).toBeNull();
  });

  it('returns null rather than throwing when a required field is missing', () => {
    writeEntry('projects', 'incomplete', 'tags: []\nstartDate: "2025-01-01"\nstatus: complete\nhook: h', '## Overview\n\nNo title');
    expect(getEntry('projects', 'incomplete', root)).toBeNull();
  });
});

describe('getEntries with a broken entry present', () => {
  it('skips the broken entry and still returns the valid ones', () => {
    writeEntry('projects', 'good', 'title: Good\ntags: []\nstartDate: "2025-01-01"\nstatus: complete\nhook: h', '## Overview\n\nFine');
    writeEntry('projects', 'incomplete', 'tags: []\nstartDate: "2025-01-01"\nstatus: complete\nhook: h', '## Overview\n\nNo title');

    expect(getEntries('projects', root).map((e) => e.slug)).toEqual(['good']);
  });
});
```

A single hand-edited MDX file with broken YAML or a missing required field must not crash the whole collection listing — `getEntry` catches parse/validation errors, logs which slug was skipped, and returns `null`, which `getEntries` already filters out.

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/content.test.ts`
Expected: FAIL — `Cannot find module './content'`

- [ ] **Step 3: Implement**

```ts
// lib/content.ts
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
  status: EntryStatus;
  hook: string;
  org?: string;
  role?: string;
  location?: string;
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
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
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

    if (!data.title || !data.startDate || !data.status || !data.hook) {
      throw new Error('missing required frontmatter (title, startDate, status, or hook)');
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
      content,
    };
  } catch (error) {
    console.error(`Skipping ${collection}/${safeSlug}: ${(error as Error).message}`);
    return null;
  }
}
```

A malformed YAML block or a missing required field must degrade to skipping that one entry, not crashing `getEntries`'s `.sort()` on an undefined `startDate` for the whole collection.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/content.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/content.ts lib/content.test.ts
git commit -m "Add collection-aware MDX content loader"
```

---

### Task 6: Entry CRUD

**Files:** Create `lib/entries.ts`; Test `lib/entries.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/entries.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';
import { COLLECTIONS } from './collections';
import { slugify, buildBody, parseSections, createEntry, updateEntry, deleteEntry } from './entries';

const PROJECT_SECTIONS = COLLECTIONS.projects.sections;

describe('slugify', () => {
  it('lowercases, trims, and hyphenates', () => {
    expect(slugify('  ASIC Math Accelerator Unit! ')).toBe('asic-math-accelerator-unit');
  });

  it('collapses runs of punctuation', () => {
    expect(slugify('A // B -- C')).toBe('a-b-c');
  });
});

describe('buildBody / parseSections', () => {
  it('round-trips a section map', () => {
    const sections = {
      Overview: 'Overview text',
      Design: 'Design text',
      Plan: 'Plan text',
      'What I Learned': 'Learned text',
      'Troubles / Debugging': 'Troubles text',
    };
    expect(parseSections(buildBody(sections, PROJECT_SECTIONS), PROJECT_SECTIONS)).toEqual(sections);
  });

  it('emits headings in the collection order', () => {
    const sections = Object.fromEntries(PROJECT_SECTIONS.map((s) => [s, `${s} body`]));
    const headings = [...buildBody(sections, PROJECT_SECTIONS).matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    expect(headings).toEqual([...PROJECT_SECTIONS]);
  });

  it('returns empty strings for sections missing from the body', () => {
    expect(parseSections('## Overview\n\nOnly this one', PROJECT_SECTIONS).Design).toBe('');
  });

  it('ignores headings that are not collection sections', () => {
    const body = '## Overview\n\nReal\n\n## Not A Section\n\nIgnored';
    expect(parseSections(body, PROJECT_SECTIONS).Overview).toBe('Real\n\n## Not A Section\n\nIgnored');
  });
});

describe('createEntry / updateEntry / deleteEntry', () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'entries-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('creates an entry with placeholder sections for its collection', () => {
    const slug = createEntry('experience', 'Software Engineering Intern', root);

    expect(slug).toBe('software-engineering-intern');
    const { data, content } = matter(
      fs.readFileSync(path.join(root, 'experience', slug, 'index.mdx'), 'utf-8')
    );
    expect(data.title).toBe('Software Engineering Intern');
    expect(data.status).toBe('in-progress');
    const sections = parseSections(content, COLLECTIONS.experience.sections);
    expect(sections['What I Built']).toContain('Placeholder');
  });

  it('omits undefined frontmatter keys rather than emitting them', () => {
    const slug = createEntry('projects', 'No End Date', root);
    const raw = fs.readFileSync(path.join(root, 'projects', slug, 'index.mdx'), 'utf-8');
    expect(raw).not.toContain('endDate');
  });

  it('throws when the entry already exists', () => {
    createEntry('projects', 'Duplicate', root);
    expect(() => createEntry('projects', 'Duplicate', root)).toThrow('already exists');
  });

  it('rejects a title that produces an empty slug', () => {
    expect(() => createEntry('projects', '!!!', root)).toThrow('Invalid slug');
  });

  it('updates an existing entry', () => {
    const slug = createEntry('projects', 'Editable', root);

    updateEntry(
      'projects',
      slug,
      {
        title: 'Editable',
        tags: ['Python'],
        startDate: '2025-01-01',
        endDate: '2025-08-01',
        status: 'complete',
        hook: 'Updated hook',
        sections: {
          Overview: 'Updated overview',
          Design: 'd',
          Plan: 'p',
          'What I Learned': 'l',
          'Troubles / Debugging': 't',
        },
      },
      root
    );

    const { data, content } = matter(
      fs.readFileSync(path.join(root, 'projects', slug, 'index.mdx'), 'utf-8')
    );
    expect(data.hook).toBe('Updated hook');
    expect(data.endDate).toBe('2025-08-01');
    expect(parseSections(content, PROJECT_SECTIONS).Overview).toBe('Updated overview');
  });

  it('throws when updating a missing entry', () => {
    expect(() =>
      updateEntry(
        'projects',
        'missing',
        {
          title: 'x',
          tags: [],
          startDate: '2025-01-01',
          status: 'complete',
          hook: '',
          sections: {
            Overview: '',
            Design: '',
            Plan: '',
            'What I Learned': '',
            'Troubles / Debugging': '',
          },
        },
        root
      )
    ).toThrow('not found');
  });

  it('deletes an entry', () => {
    const slug = createEntry('projects', 'Deletable', root);
    deleteEntry('projects', slug, root);
    expect(fs.existsSync(path.join(root, 'projects', slug))).toBe(false);
  });

  it('refuses a traversal slug on delete', () => {
    expect(() => deleteEntry('projects', '../../etc', root)).toThrow('Invalid slug');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/entries.test.ts`
Expected: FAIL — `Cannot find module './entries'`

- [ ] **Step 3: Implement**

```ts
// lib/entries.ts
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/entries.test.ts`
Expected: PASS (14 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/entries.ts lib/entries.test.ts
git commit -m "Add entry CRUD with slug validation and undefined-key stripping"
```

---

### Task 7: Fonts, layout, Nav, Footer

**Files:** Create `app/globals.css`, `app/layout.tsx`, `components/Nav.tsx`, `components/Footer.tsx`

- [ ] **Step 1: Write `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-card text-ink antialiased;
  }

  :focus-visible {
    outline: 2px solid theme('colors.flag');
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Write `components/Nav.tsx`**

Sentence case, no tracked-out caps. The gold rule under the nameplate is the only accent.

```tsx
// components/Nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/experience', label: 'Experience' },
  { href: '/about', label: 'About' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header>
      <div className="mx-auto max-w-4xl px-6 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-y-2">
          <Link href="/" className="text-base">
            Timothy Pan
          </Link>
          <nav className="flex gap-5 text-sm text-inkSoft">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'text-ink underline underline-offset-4' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            <a href="/TimothyPanResume.pdf" download>
              Resume
            </a>
          </nav>
        </div>
        <div className="mt-3 h-0.5 w-16 bg-flag" />
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Write `components/Footer.tsx`**

```tsx
// components/Footer.tsx
export function Footer() {
  return (
    <footer className="mt-20 border-t border-rule">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-y-2 px-6 py-8 text-sm text-inkSoft">
        <span>© {new Date().getFullYear()} Timothy Pan</span>
        <div className="flex gap-5">
          <a href="https://github.com/timothyyppan" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://linkedin.com/in/timothyyppan" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="mailto:tjmpan@uwaterloo.ca">Email</a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Write `app/layout.tsx`**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Fraunces, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://timothypan.dev'),
  title: {
    default: 'Timothy Pan',
    template: '%s — Timothy Pan',
  },
  description:
    'Computer engineering at Waterloo. Previously Apple. Projects in silicon, machine learning, and robotics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col font-serif">
        <Nav />
        <main className="mx-auto w-full max-w-4xl flex-1 px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

Replace `metadataBase` with the real domain once known; it only affects absolute URLs in OG tags.

- [ ] **Step 5: Add a temporary home page so the build can run**

```tsx
// app/page.tsx
export default function HomePage() {
  return <div className="py-16">Placeholder — replaced in Task 10.</div>;
}
```

- [ ] **Step 6: Verify**

Run: `npm run build`
Expected: succeeds. If the environment has no network access, `next/font/google` cannot fetch the fonts and the build fails with a font-fetch error — in that case run the build once on a connected machine, or temporarily swap the two font imports for `localFont`. Do not proceed past a different error.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/layout.tsx app/page.tsx components/Nav.tsx components/Footer.tsx
git commit -m "Add root layout, fonts, nav, and footer"
```

---

### Task 8: Scorecard component

**Files:** Create `components/Scorecard.tsx`; Test `components/Scorecard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/Scorecard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { Scorecard } from './Scorecard';
import type { Entry } from '@/lib/content';

const entries: Entry[] = [
  {
    collection: 'projects',
    slug: 'asic-math-accelerator',
    title: 'ASIC Math Accelerator Unit',
    tags: ['SystemVerilog'],
    startDate: '2024-09-01',
    endDate: '2024-12-01',
    status: 'complete',
    hook: 'A taped-out SIMD accelerator.',
    content: '',
  },
  {
    collection: 'projects',
    slug: 'lol-win-rate-predictor',
    title: 'League of Legends Win Rate Predictor',
    tags: ['Python', 'Machine Learning'],
    startDate: '2024-05-01',
    status: 'in-progress',
    hook: 'Predicts match outcomes from live game data.',
    content: '',
  },
];

describe('Scorecard', () => {
  it('numbers rows as holes in order', () => {
    render(<Scorecard collection="projects" entries={entries} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
  });

  it('links each row to the entry', () => {
    render(<Scorecard collection="projects" entries={entries} />);
    expect(screen.getByRole('link', { name: /ASIC Math Accelerator Unit/ })).toHaveAttribute(
      'href',
      '/projects/asic-math-accelerator'
    );
  });

  it('renders tags as discrete items, not a joined string', () => {
    render(<Scorecard collection="projects" entries={entries} />);
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning')).toBeInTheDocument();
    expect(screen.queryByText(/Python · Machine Learning/)).not.toBeInTheDocument();
  });

  it('shows the played span and status in accessible text', () => {
    render(<Scorecard collection="projects" entries={entries} />);
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2024–')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Complete')).toHaveLength(1);
    expect(screen.getAllByLabelText('In progress')).toHaveLength(1);
  });

  it('labels the nine for the collection', () => {
    render(<Scorecard collection="projects" entries={entries} />);
    const header = screen.getByTestId('scorecard-header');
    expect(within(header).getByText(/OUT/)).toBeInTheDocument();
  });

  it('renders an invitation when the collection is empty', () => {
    render(<Scorecard collection="projects" entries={[]} />);
    expect(screen.getByText(/No projects on the card yet/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run components/Scorecard.test.tsx`
Expected: FAIL — `Cannot find module './Scorecard'`

- [ ] **Step 3: Implement**

All-caps appears only in the column header row, where it is authentic to a printed card. The table collapses to stacked rows under `sm`.

```tsx
// components/Scorecard.tsx
import Link from 'next/link';
import { COLLECTIONS, type CollectionKey } from '@/lib/collections';
import { formatPlayed } from '@/lib/format';
import type { Entry } from '@/lib/content';

function ScoreMark({ status }: { status: Entry['status'] }) {
  const complete = status === 'complete';
  return (
    <span
      role="img"
      aria-label={complete ? 'Complete' : 'In progress'}
      className={
        complete
          ? 'inline-block h-4 w-4 rounded-full border-[1.5px] border-mark'
          : 'inline-block h-4 w-4 border-[1.5px] border-inkSoft'
      }
    />
  );
}

export function Scorecard({
  collection,
  entries,
}: {
  collection: CollectionKey;
  entries: Entry[];
}) {
  const config = COLLECTIONS[collection];

  return (
    <section className="border border-rule bg-cardRaised">
      <div
        data-testid="scorecard-header"
        className="flex items-baseline justify-between border-b border-rule px-4 py-3"
      >
        <h2 className="text-base">The card</h2>
        <span className="font-mono text-xs text-inkSoft">
          {config.nine} · {entries.length} {entries.length === 1 ? 'hole' : 'holes'}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="px-4 py-8 text-sm text-inkSoft">
          No {config.label.toLowerCase()} on the card yet. Add one from the admin page.
        </p>
      ) : (
        <>
          <div className="hidden grid-cols-[3rem_1fr_11rem_5rem_3rem] gap-2 border-b border-rule px-4 py-2 font-mono text-[0.7rem] text-inkSoft sm:grid">
            <span>HOLE</span>
            <span>{config.itemHeader}</span>
            <span>CLUBS</span>
            <span>PLAYED</span>
            <span className="text-center">CARD</span>
          </div>

          <ul>
            {entries.map((entry, index) => (
              <li key={entry.slug} className="border-b border-ruleSoft last:border-b-0">
                <Link
                  href={`/${collection}/${entry.slug}`}
                  className="grid grid-cols-1 gap-1 px-4 py-4 hover:bg-card sm:grid-cols-[3rem_1fr_11rem_5rem_3rem] sm:items-baseline sm:gap-2"
                >
                  <span className="font-mono text-xs text-inkSoft">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span>
                    <span className="block">{entry.title}</span>
                    <span className="mt-1 block text-sm text-inkSoft sm:hidden">{entry.hook}</span>
                  </span>

                  <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-inkSoft">
                    {entry.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>

                  <span className="font-mono text-xs text-inkSoft">
                    {formatPlayed(entry.startDate, entry.endDate, entry.status)}
                  </span>

                  <span className="sm:text-center">
                    <ScoreMark status={entry.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-rule px-4 py-2 font-mono text-[0.7rem] text-inkSoft">
            <span className="mr-4">○ complete</span>
            <span>□ in progress</span>
          </div>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run components/Scorecard.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add components/Scorecard.tsx components/Scorecard.test.tsx
git commit -m "Add scorecard component rendering entries as holes"
```

---

### Task 9: DemoEmbed, EntryDetail, CollectionIndex

**Files:** Create `components/DemoEmbed.tsx`, `components/EntryDetail.tsx`, `components/CollectionIndex.tsx`

- [ ] **Step 1: Write `components/DemoEmbed.tsx`**

```tsx
// components/DemoEmbed.tsx
export function DemoEmbed({ slug }: { slug: string }) {
  return (
    <aside
      data-entry-slug={slug}
      className="mt-12 border border-dashed border-rule px-6 py-10 text-center text-sm text-inkSoft"
    >
      An interactive demo will live here.
    </aside>
  );
}
```

- [ ] **Step 2: Write `components/EntryDetail.tsx`**

```tsx
// components/EntryDetail.tsx
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { COLLECTIONS, type CollectionKey } from '@/lib/collections';
import { formatPlayed } from '@/lib/format';
import { getEntries, type Entry } from '@/lib/content';
import { DemoEmbed } from './DemoEmbed';

function holeNumber(collection: CollectionKey, slug: string): number {
  return getEntries(collection).findIndex((e) => e.slug === slug) + 1;
}

export function EntryDetail({ entry }: { entry: Entry }) {
  const config = COLLECTIONS[entry.collection];
  const hole = holeNumber(entry.collection, entry.slug);

  return (
    <article className="py-12">
      <Link href={`/${entry.collection}`} className="font-mono text-xs text-inkSoft">
        Back to the card
      </Link>

      <div className="mt-6 flex items-baseline gap-3 font-mono text-xs text-inkSoft">
        {hole > 0 && <span>Hole {String(hole).padStart(2, '0')}</span>}
        <span>{formatPlayed(entry.startDate, entry.endDate, entry.status)}</span>
        <span>{entry.status === 'complete' ? 'Complete' : 'In progress'}</span>
      </div>

      <h1 className="mt-2 text-3xl leading-tight">{entry.title}</h1>

      {entry.org && (
        <p className="mt-2 text-inkSoft">
          {entry.role ? `${entry.role}, ` : ''}
          {entry.org}
          {entry.location ? ` — ${entry.location}` : ''}
        </p>
      )}

      <p className="mt-4 max-w-prose text-inkSoft">{entry.hook}</p>

      {entry.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <li key={tag} className="border border-rule px-2 py-0.5 font-mono text-xs text-inkSoft">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="prose prose-sm mt-10 max-w-prose prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink prose-p:text-ink prose-a:text-ink prose-strong:text-ink prose-li:text-ink">
        <MDXRemote source={entry.content} />
      </div>

      <DemoEmbed slug={entry.slug} />

      <p className="mt-10 font-mono text-xs text-inkSoft">
        {config.label} · {config.nine}
      </p>
    </article>
  );
}
```

- [ ] **Step 3: Write `components/CollectionIndex.tsx`**

```tsx
// components/CollectionIndex.tsx
import { COLLECTIONS, type CollectionKey } from '@/lib/collections';
import { getEntries } from '@/lib/content';
import { Scorecard } from './Scorecard';

const INTRO: Record<CollectionKey, string> = {
  projects:
    'Things I built because I wanted them to exist. Each one has a full write-up: what I designed, what I planned, what broke.',
  experience: 'Where I have worked, and what I actually built while I was there.',
};

export function CollectionIndex({ collection }: { collection: CollectionKey }) {
  const config = COLLECTIONS[collection];
  const entries = getEntries(collection);

  return (
    <div className="py-12">
      <h1 className="text-3xl">{config.label}</h1>
      <p className="mt-3 max-w-prose text-inkSoft">{INTRO[collection]}</p>
      <div className="mt-8">
        <Scorecard collection={collection} entries={entries} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/DemoEmbed.tsx components/EntryDetail.tsx components/CollectionIndex.tsx
git commit -m "Add entry detail and collection index templates"
```

---

### Task 10: Home page

**Files:** Modify `app/page.tsx`

- [ ] **Step 1: Replace the placeholder**

The hero opens with the most characteristic thing in the subject's world — the card itself, carrying real work. No single-word color accent in the headline.

```tsx
// app/page.tsx
import Link from 'next/link';
import { getEntries } from '@/lib/content';
import { Scorecard } from '@/components/Scorecard';

export default function HomePage() {
  const projects = getEntries('projects');

  return (
    <div className="py-12">
      <section>
        <h1 className="max-w-prose text-4xl leading-[1.15] tracking-tight sm:text-5xl">
          Engineer. Builder. Golfer.
        </h1>
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-inkSoft">
          Computer engineering at Waterloo. Previously at Apple, where I rebuilt packaging test
          specifications on a terabyte of real shipment telemetry. I work across machine learning,
          silicon, and robotics.
        </p>
        <p className="mt-4 max-w-prose leading-relaxed text-inkSoft">
          _Placeholder: one or two sentences in your own voice — what you care about building, and
          what golf has to do with any of it._
        </p>
      </section>

      <div className="mt-12">
        <Scorecard collection="projects" entries={projects} />
      </div>

      <div className="mt-6 flex flex-wrap gap-5 text-sm">
        <Link href="/projects" className="underline underline-offset-4">
          Every project
        </Link>
        <Link href="/experience" className="underline underline-offset-4">
          Where I have worked
        </Link>
        <a href="/TimothyPanResume.pdf" download className="underline underline-offset-4">
          Download my resume
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "Build home page with the scorecard as its index"
```

---

### Task 11: Collection and detail routes

**Files:** Create `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/experience/page.tsx`, `app/experience/[slug]/page.tsx`

- [ ] **Step 1: Write the two index routes**

```tsx
// app/projects/page.tsx
import type { Metadata } from 'next';
import { CollectionIndex } from '@/components/CollectionIndex';

export const metadata: Metadata = { title: 'Projects' };

export default function ProjectsPage() {
  return <CollectionIndex collection="projects" />;
}
```

```tsx
// app/experience/page.tsx
import type { Metadata } from 'next';
import { CollectionIndex } from '@/components/CollectionIndex';

export const metadata: Metadata = { title: 'Experience' };

export default function ExperiencePage() {
  return <CollectionIndex collection="experience" />;
}
```

- [ ] **Step 2: Write `app/projects/[slug]/page.tsx`**

```tsx
// app/projects/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEntries, getEntry } from '@/lib/content';
import { EntryDetail } from '@/components/EntryDetail';

export function generateStaticParams() {
  return getEntries('projects').map((entry) => ({ slug: entry.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = getEntry('projects', params.slug);
  if (!entry) return {};
  return { title: entry.title, description: entry.hook };
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const entry = getEntry('projects', params.slug);
  if (!entry) notFound();

  return <EntryDetail entry={entry} />;
}
```

- [ ] **Step 3: Write `app/experience/[slug]/page.tsx`**

```tsx
// app/experience/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEntries, getEntry } from '@/lib/content';
import { EntryDetail } from '@/components/EntryDetail';

export function generateStaticParams() {
  return getEntries('experience').map((entry) => ({ slug: entry.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = getEntry('experience', params.slug);
  if (!entry) return {};
  return { title: entry.title, description: entry.hook };
}

export default function ExperienceDetailPage({ params }: { params: { slug: string } }) {
  const entry = getEntry('experience', params.slug);
  if (!entry) notFound();

  return <EntryDetail entry={entry} />;
}
```

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: succeeds. `generateStaticParams` returns empty arrays until Task 13 adds content — expected.

- [ ] **Step 5: Commit**

```bash
git add app/projects app/experience
git commit -m "Add project and experience routes with per-entry metadata"
```

---

### Task 12: About, 404, icon, OG image, sitemap

**Files:** Create `app/about/page.tsx`, `app/not-found.tsx`, `app/icon.svg`, `app/opengraph-image.tsx`, `app/sitemap.ts`

- [ ] **Step 1: Write `app/about/page.tsx`**

```tsx
// app/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Who Timothy Pan is, and what he is building.',
};

export default function AboutPage() {
  return (
    <div className="py-12">
      <h1 className="text-3xl">About</h1>

      <div className="mt-8 max-w-prose space-y-5 leading-relaxed text-inkSoft">
        <p>
          _Placeholder: how you got into engineering, what you are studying, and what you are most
          drawn to building._
        </p>
        <p>
          _Placeholder: the thread connecting your work — silicon, machine learning, robotics. What
          makes a problem interesting enough for you to take it on._
        </p>
        <p>
          _Placeholder: golf. How long you have played, what keeps you coming back, and whether it
          has anything to do with how you think about engineering._
        </p>
      </div>

      <a
        href="/TimothyPanResume.pdf"
        download
        className="mt-10 inline-block border border-ink px-5 py-2.5 text-sm"
      >
        Download my resume
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/not-found.tsx`**

An empty screen is an invitation to act, not a joke that blocks the exit.

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-24">
      <p className="font-mono text-xs text-inkSoft">Out of bounds</p>
      <h1 className="mt-2 text-3xl">This page is not on the card.</h1>
      <p className="mt-4 max-w-prose text-inkSoft">
        The link may be old, or the page may have moved.
      </p>
      <div className="mt-8 flex flex-wrap gap-5 text-sm">
        <Link href="/" className="underline underline-offset-4">
          Back to the start
        </Link>
        <Link href="/projects" className="underline underline-offset-4">
          See every project
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `app/icon.svg`**

A flag on a green, in the site's own ink and gold.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#EFE9D8"/>
  <path d="M11 25V6" stroke="#14301E" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M12 7l11 4-11 4z" fill="#B8973F"/>
  <ellipse cx="16" cy="26" rx="9" ry="2.5" fill="#14301E" opacity="0.18"/>
</svg>
```

- [ ] **Step 4: Write `app/opengraph-image.tsx`**

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Timothy Pan — engineer, builder, golfer';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#EFE9D8',
          color: '#14301E',
          padding: '80px',
        }}
      >
        <div style={{ fontSize: 72, letterSpacing: -2 }}>Engineer. Builder. Golfer.</div>
        <div style={{ marginTop: 28, fontSize: 32, color: '#55604F' }}>
          Timothy Pan — computer engineering at Waterloo
        </div>
        <div style={{ marginTop: 40, width: 120, height: 8, backgroundColor: '#B8973F' }} />
      </div>
    ),
    size
  );
}
```

- [ ] **Step 5: Write `app/sitemap.ts`**

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { COLLECTION_KEYS } from '@/lib/collections';
import { getEntries } from '@/lib/content';

const BASE_URL = 'https://timothypan.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/projects', '/experience', '/about'].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  const entryRoutes = COLLECTION_KEYS.flatMap((collection) =>
    getEntries(collection).map((entry) => ({
      url: `${BASE_URL}/${collection}/${entry.slug}`,
      lastModified: new Date(),
    }))
  );

  return [...staticRoutes, ...entryRoutes];
}
```

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: succeeds, and the output lists `/sitemap.xml` and `/opengraph-image` as generated routes.

- [ ] **Step 7: Commit**

```bash
git add app/about app/not-found.tsx app/icon.svg app/opengraph-image.tsx app/sitemap.ts
git commit -m "Add about page, 404, favicon, OG image, and sitemap"
```

---

### Task 13: Launch content

**Files:** Create five `index.mdx` files under `content/`

Each file's sections are placeholders for Timothy to fill. Frontmatter carries real data from his resume.

- [ ] **Step 1: Write `content/projects/asic-math-accelerator/index.mdx`**

```mdx
---
title: ASIC Math Accelerator Unit
tags:
  - SystemVerilog
  - ASIC
  - TinyTapeout
startDate: "2024-09-01"
endDate: "2024-12-01"
status: complete
hook: A taped-out SIMD math accelerator supporting scalar, vector, matrix, and polynomial arithmetic.
---

## Overview

_Placeholder: what this is and why you built it._

## Design

_Placeholder: the SIMD datapath, how the four 8-bit operands share hardware multipliers, and the clock-synced wave I/O protocol you built to move data under TinyTapeout's pin constraints._

## Plan

_Placeholder: how you sequenced datapath design, verification, and submission against the tape-out deadline._

## What I Learned

_Placeholder: what ASIC work taught you that FPGA and software work did not._

## Troubles / Debugging

_Placeholder: a specific bug and how you found it._
```

- [ ] **Step 2: Write `content/projects/product-defect-classifier/index.mdx`**

```mdx
---
title: Product Defect Classifier
tags:
  - Python
  - FastAPI
  - spaCy
startDate: "2025-01-01"
endDate: "2025-05-01"
status: complete
hook: An NLP pipeline that triages manufacturing defect reports and learns from engineer corrections.
---

## Overview

_Placeholder: what this is and why you built it._

## Design

_Placeholder: sentence-transformer embeddings, cosine-similarity classification, the confidence threshold for human review, and the HDBSCAN clustering that surfaces new taxonomy candidates._

## Plan

_Placeholder: classification core first, then the FastAPI and CLI interfaces, then the active learning loop._

## What I Learned

_Placeholder: what surprised you about active learning in practice._

## Troubles / Debugging

_Placeholder: a specific bug and how you found it._
```

- [ ] **Step 3: Write `content/projects/lol-win-rate-predictor/index.mdx`**

```mdx
---
title: League of Legends Win Rate Predictor
tags:
  - Python
  - Machine Learning
startDate: "2024-05-01"
endDate: "2024-08-01"
status: complete
hook: A personalized model that predicts match outcomes from my own game history.
---

## Overview

_Placeholder: what this is and why you built it._

## Design

_Placeholder: pulling game data from the Riot Games API, the ten-plus features you engineered, and why logistic regression was the right call._

## Plan

_Placeholder: data collection, feature engineering, then training and evaluation._

## What I Learned

_Placeholder: which features actually carried the model, and which ones you expected to matter but did not._

## Troubles / Debugging

_Placeholder: a specific bug and how you found it — rate limits, data quality, or leakage._
```

- [ ] **Step 4: Write `content/experience/apple/index.mdx`**

```mdx
---
title: Software Engineering Intern
org: Apple
role: Packaging Team
location: Shanghai, China
tags:
  - Python
  - PyTorch
  - Data Pipelines
startDate: "2025-01-01"
endDate: "2025-08-01"
status: complete
hook: Rebuilt packaging test specifications on a terabyte of real shipment telemetry.
---

## Overview

_Placeholder: what the packaging team does and what problem you were brought in to solve._

## What I Built

_Placeholder: the telemetry pipeline across 1TB+ of shipment data, the LSTM that classified 30M+ events by acceleration pattern at 97% accuracy, the 30+ K-Means vibration profiles, and the metadata and timeline alignment system spanning three couriers._

## What I Learned

_Placeholder: what working at that data scale taught you, and what you learned about turning analysis into decisions engineers actually act on._

## Highlights

_Placeholder: the result you are proudest of._
```

- [ ] **Step 5: Write `content/experience/waterloo-ideas-clinic/index.mdx`**

```mdx
---
title: Research Assistant Intern
org: University of Waterloo
role: Pearl Sullivan Engineering IDEAs Clinic
location: Waterloo, Canada
tags:
  - Robotics
  - SystemVerilog
  - Linux
startDate: "2026-05-01"
endDate: "2026-08-01"
status: complete
hook: Built a walking bipedal robot, a real-time FPGA audio processor, and a remote compile server used by several cohorts.
---

## Overview

_Placeholder: what the IDEAs Clinic is and what you were working toward._

## What I Built

_Placeholder: the bipedal robot on a Raspberry Pi 5 with a reinforcement learning policy trained in MuJoCo that transferred to hardware across three gaits; the DE10-Lite audio effects processor running five DSP effects under 5ms latency; and the Linux remote-compile server that removed a 30GB local Quartus install for 50+ concurrent users._

## What I Learned

_Placeholder: what sim-to-real transfer actually cost you, and what you learned building tools other people depend on._

## Highlights

_Placeholder: the result you are proudest of._
```

- [ ] **Step 6: Verify**

Run: `npm run build`
Expected: succeeds and reports five statically generated detail pages — three under `/projects/`, two under `/experience/`.

- [ ] **Step 7: Commit**

```bash
git add content
git commit -m "Add launch content for projects and experience"
```

---

### Task 14: Resume in public

**Files:** Move `TimothyPanResume.pdf` → `public/TimothyPanResume.pdf`

- [ ] **Step 1: Move the file**

The resume is currently untracked at the repo root. Move it into `public/` so `/TimothyPanResume.pdf` resolves — `Nav` and both the home and about pages already link there.

Run: `mkdir -p public && mv TimothyPanResume.pdf public/TimothyPanResume.pdf`

- [ ] **Step 2: Verify it serves**

Run: `npm run build && (npm run start &) && sleep 4 && curl -sI http://localhost:3000/TimothyPanResume.pdf | head -1`
Expected: `HTTP/1.1 200 OK`

Then stop the server: `pkill -f "next start"`

- [ ] **Step 3: Commit**

```bash
git add public/TimothyPanResume.pdf
git commit -m "Serve resume from public directory"
```

---

### Task 15: Admin API routes

**Files:** Create `app/api/admin/[collection]/route.ts`, `app/api/admin/[collection]/[slug]/route.ts`

- [ ] **Step 1: Write `app/api/admin/[collection]/route.ts`**

Every handler guards on `isAdminEnabled()` first and validates the `collection` parameter before touching the filesystem.

```ts
// app/api/admin/[collection]/route.ts
import { NextResponse } from 'next/server';
import { isAdminEnabled } from '@/lib/devGuard';
import { assertCollection } from '@/lib/collections';
import { getEntries } from '@/lib/content';
import { createEntry } from '@/lib/entries';

export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 });

export async function GET(_request: Request, { params }: { params: { collection: string } }) {
  if (!isAdminEnabled()) return notFound();

  try {
    const config = assertCollection(params.collection);
    return NextResponse.json(getEntries(config.key));
  } catch {
    return notFound();
  }
}

export async function POST(request: Request, { params }: { params: { collection: string } }) {
  if (!isAdminEnabled()) return notFound();

  let collection;
  try {
    collection = assertCollection(params.collection).key;
  } catch {
    return notFound();
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== 'string' || body.title.trim() === '') {
    return NextResponse.json({ error: 'A title is required.' }, { status: 400 });
  }

  try {
    return NextResponse.json({ slug: createEntry(collection, body.title.trim()) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}
```

- [ ] **Step 2: Write `app/api/admin/[collection]/[slug]/route.ts`**

```ts
// app/api/admin/[collection]/[slug]/route.ts
import { NextResponse } from 'next/server';
import { isAdminEnabled } from '@/lib/devGuard';
import { assertCollection, assertSlug } from '@/lib/collections';
import { updateEntry, deleteEntry, type EntryInput } from '@/lib/entries';

export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 });

type Params = { params: { collection: string; slug: string } };

function resolve(params: Params['params']) {
  return { collection: assertCollection(params.collection).key, slug: assertSlug(params.slug) };
}

function isValidInput(body: unknown): body is EntryInput {
  if (typeof body !== 'object' || body === null) return false;
  const input = body as Record<string, unknown>;
  return (
    typeof input.title === 'string' &&
    Array.isArray(input.tags) &&
    typeof input.startDate === 'string' &&
    (input.status === 'complete' || input.status === 'in-progress') &&
    typeof input.hook === 'string' &&
    typeof input.sections === 'object' &&
    input.sections !== null
  );
}

export async function PUT(request: Request, { params }: Params) {
  if (!isAdminEnabled()) return notFound();

  let target;
  try {
    target = resolve(params);
  } catch {
    return notFound();
  }

  const body = await request.json().catch(() => null);
  if (!isValidInput(body)) {
    return NextResponse.json({ error: 'The submitted entry is incomplete.' }, { status: 400 });
  }

  try {
    updateEntry(target.collection, target.slug, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!isAdminEnabled()) return notFound();

  let target;
  try {
    target = resolve(params);
  } catch {
    return notFound();
  }

  try {
    deleteEntry(target.collection, target.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/api
git commit -m "Add dev-only admin API routes with validated path parameters"
```

---

### Task 16: EntryForm

**Files:** Create `components/admin/EntryForm.tsx`; Test `components/admin/EntryForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/admin/EntryForm.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EntryForm } from './EntryForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const initial = {
  title: 'Original Title',
  tags: ['Python'],
  startDate: '2025-01-01',
  endDate: '',
  status: 'in-progress' as const,
  hook: 'Original hook',
  sections: {
    Overview: 'Overview text',
    Design: 'Design text',
    Plan: 'Plan text',
    'What I Learned': 'Learned text',
    'Troubles / Debugging': 'Troubles text',
  },
};

function setup() {
  return render(<EntryForm collection="projects" slug="original-title" initial={initial} />);
}

describe('EntryForm', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  });

  afterEach(() => vi.restoreAllMocks());

  it('prefills frontmatter and every section', () => {
    setup();
    expect(screen.getByLabelText('Title')).toHaveValue('Original Title');
    expect(screen.getByLabelText('Hook')).toHaveValue('Original hook');
    expect(screen.getByLabelText('Overview')).toHaveValue('Overview text');
    expect(screen.getByLabelText('Troubles / Debugging')).toHaveValue('Troubles text');
  });

  it('renders an end date field', () => {
    setup();
    expect(screen.getByLabelText('End date')).toBeInTheDocument();
  });

  it('renders only the sections belonging to the collection', () => {
    setup();
    expect(screen.queryByLabelText('What I Built')).not.toBeInTheDocument();
  });

  it('submits the edited entry to the collection-scoped route', async () => {
    setup();

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Title' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/admin/projects/original-title');
    expect(options.method).toBe('PUT');

    const payload = JSON.parse(options.body);
    expect(payload.title).toBe('Updated Title');
    expect(payload.sections.Overview).toBe('Overview text');
  });

  it('omits an empty end date from the payload', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const payload = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(payload.endDate).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run components/admin/EntryForm.test.tsx`
Expected: FAIL — `Cannot find module './EntryForm'`

- [ ] **Step 3: Implement**

```tsx
// components/admin/EntryForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { COLLECTIONS, type CollectionKey } from '@/lib/collections';

export interface EntryFormValues {
  title: string;
  tags: string[];
  startDate: string;
  endDate?: string;
  status: 'in-progress' | 'complete';
  hook: string;
  org?: string;
  role?: string;
  location?: string;
  sections: Record<string, string>;
}

const fieldClass = 'w-full border border-rule bg-cardRaised px-3 py-2 text-ink';
const labelClass = 'mb-1 block text-sm text-inkSoft';

export function EntryForm({
  collection,
  slug,
  initial,
}: {
  collection: CollectionKey;
  slug: string;
  initial: EntryFormValues;
}) {
  const router = useRouter();
  const config = COLLECTIONS[collection];
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/admin/${collection}/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, endDate: values.endDate || undefined }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'The entry could not be saved.');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className={labelClass} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className={fieldClass}
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
        <p className="mt-1 text-xs text-inkSoft">
          The web address stays <code>/{collection}/{slug}</code> when you rename this, so existing
          links keep working.
        </p>
      </div>

      {collection === 'experience' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="org">
              Organization
            </label>
            <input
              id="org"
              className={fieldClass}
              value={values.org ?? ''}
              onChange={(e) => setValues({ ...values, org: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="role">
              Team or role
            </label>
            <input
              id="role"
              className={fieldClass}
              value={values.role ?? ''}
              onChange={(e) => setValues({ ...values, role: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="location">
              Location
            </label>
            <input
              id="location"
              className={fieldClass}
              value={values.location ?? ''}
              onChange={(e) => setValues({ ...values, location: e.target.value })}
            />
          </div>
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="tags">
          Tags, separated by commas
        </label>
        <input
          id="tags"
          className={fieldClass}
          value={values.tags.join(', ')}
          onChange={(e) =>
            setValues({
              ...values,
              tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
            })
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="startDate">
            Start date
          </label>
          <input
            id="startDate"
            type="date"
            className={fieldClass}
            value={values.startDate}
            onChange={(e) => setValues({ ...values, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="endDate">
            End date
          </label>
          <input
            id="endDate"
            type="date"
            className={fieldClass}
            value={values.endDate ?? ''}
            onChange={(e) => setValues({ ...values, endDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className={fieldClass}
            value={values.status}
            onChange={(e) =>
              setValues({ ...values, status: e.target.value as EntryFormValues['status'] })
            }
          >
            <option value="in-progress">In progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="hook">
          Hook
        </label>
        <input
          id="hook"
          className={fieldClass}
          value={values.hook}
          onChange={(e) => setValues({ ...values, hook: e.target.value })}
        />
      </div>

      {config.sections.map((section) => (
        <div key={section}>
          <label className={labelClass} htmlFor={section}>
            {section}
          </label>
          <textarea
            id={section}
            rows={8}
            className={`${fieldClass} font-mono text-sm`}
            value={values.sections[section] ?? ''}
            onChange={(e) =>
              setValues({
                ...values,
                sections: { ...values.sections, [section]: e.target.value },
              })
            }
          />
        </div>
      ))}

      {error && <p className="text-sm text-mark">{error}</p>}

      <button type="submit" disabled={saving} className="border border-ink px-5 py-2.5 text-sm">
        {saving ? 'Saving changes' : 'Save changes'}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run components/admin/EntryForm.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add components/admin/EntryForm.tsx components/admin/EntryForm.test.tsx
git commit -m "Add collection-aware admin entry form"
```

---

### Task 17: Admin dashboard and pages

**Files:** Create `components/admin/AdminDashboard.tsx`, `app/admin/page.tsx`, `app/admin/[collection]/[slug]/edit/page.tsx`; Test `components/admin/AdminDashboard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/admin/AdminDashboard.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AdminDashboard } from './AdminDashboard';
import type { Entry } from '@/lib/content';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const projects: Entry[] = [
  {
    collection: 'projects',
    slug: 'a-project',
    title: 'A Project',
    tags: [],
    startDate: '2025-01-01',
    status: 'complete',
    hook: '',
    content: '',
  },
];

const experience: Entry[] = [
  {
    collection: 'experience',
    slug: 'apple',
    title: 'Software Engineering Intern',
    tags: [],
    startDate: '2025-01-01',
    status: 'complete',
    hook: '',
    content: '',
  },
];

function setup() {
  return render(<AdminDashboard entries={{ projects, experience }} />);
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ slug: 'new-entry' }),
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('lists both collections', () => {
    setup();
    expect(screen.getByText('A Project')).toBeInTheDocument();
    expect(screen.getByText('Software Engineering Intern')).toBeInTheDocument();
  });

  it('creates into the correct collection', async () => {
    setup();

    const section = screen.getByTestId('admin-experience');
    fireEvent.change(within(section).getByLabelText('New role title'), {
      target: { value: 'New Role' },
    });
    fireEvent.click(within(section).getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/admin/experience');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ title: 'New Role' });
  });

  it('deletes through the collection-scoped route after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    setup();

    const section = screen.getByTestId('admin-projects');
    fireEvent.click(within(section).getByRole('button', { name: /Delete A Project/ }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/admin/projects/a-project');
    expect(options.method).toBe('DELETE');
  });

  it('does not delete when the confirmation is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    setup();

    const section = screen.getByTestId('admin-projects');
    fireEvent.click(within(section).getByRole('button', { name: /Delete A Project/ }));

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run components/admin/AdminDashboard.test.tsx`
Expected: FAIL — `Cannot find module './AdminDashboard'`

- [ ] **Step 3: Implement**

```tsx
// components/admin/AdminDashboard.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { COLLECTION_KEYS, COLLECTIONS, type CollectionKey } from '@/lib/collections';
import type { Entry } from '@/lib/content';

export function AdminDashboard({ entries }: { entries: Record<CollectionKey, Entry[]> }) {
  const router = useRouter();
  const [lists, setLists] = useState(entries);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(collection: CollectionKey, event: React.FormEvent) {
    event.preventDefault();
    const title = (titles[collection] ?? '').trim();
    if (!title) return;

    setError(null);
    const response = await fetch(`/api/admin/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? 'The entry could not be created.');
      return;
    }

    setTitles({ ...titles, [collection]: '' });
    router.push(`/admin/${collection}/${data.slug}/edit`);
    router.refresh();
  }

  async function handleDelete(collection: CollectionKey, entry: Entry) {
    if (!window.confirm(`Delete "${entry.title}"? This removes the file from disk.`)) return;

    setError(null);
    const response = await fetch(`/api/admin/${collection}/${entry.slug}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('The entry could not be deleted.');
      return;
    }

    setLists((current) => ({
      ...current,
      [collection]: current[collection].filter((e) => e.slug !== entry.slug),
    }));
    router.refresh();
  }

  return (
    <div className="space-y-12">
      {error && <p className="text-sm text-mark">{error}</p>}

      {COLLECTION_KEYS.map((collection) => {
        const config = COLLECTIONS[collection];
        const list = lists[collection] ?? [];

        return (
          <section key={collection} data-testid={`admin-${collection}`}>
            <h2 className="text-xl">{config.label}</h2>

            <form
              onSubmit={(event) => handleCreate(collection, event)}
              className="mt-4 flex flex-wrap items-end gap-3"
            >
              <div className="min-w-[16rem] flex-1">
                <label
                  className="mb-1 block text-sm text-inkSoft"
                  htmlFor={`new-${collection}`}
                >
                  New {config.singular.toLowerCase()} title
                </label>
                <input
                  id={`new-${collection}`}
                  className="w-full border border-rule bg-cardRaised px-3 py-2"
                  value={titles[collection] ?? ''}
                  onChange={(e) => setTitles({ ...titles, [collection]: e.target.value })}
                />
              </div>
              <button type="submit" className="border border-ink px-5 py-2.5 text-sm">
                Create
              </button>
            </form>

            <ul className="mt-6 divide-y divide-ruleSoft border-t border-rule">
              {list.map((entry) => (
                <li key={entry.slug} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <div>{entry.title}</div>
                    <div className="font-mono text-xs text-inkSoft">
                      {entry.slug} · {entry.status === 'complete' ? 'Complete' : 'In progress'}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-4 text-sm">
                    <Link
                      href={`/admin/${collection}/${entry.slug}/edit`}
                      className="underline underline-offset-4"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      aria-label={`Delete ${entry.title}`}
                      onClick={() => handleDelete(collection, entry)}
                      className="text-inkSoft underline underline-offset-4"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {list.length === 0 && (
                <li className="py-3 text-sm text-inkSoft">
                  Nothing here yet. Add the first one above.
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run components/admin/AdminDashboard.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Write `app/admin/page.tsx`**

```tsx
// app/admin/page.tsx
import { notFound } from 'next/navigation';
import { isAdminEnabled } from '@/lib/devGuard';
import { COLLECTION_KEYS, type CollectionKey } from '@/lib/collections';
import { getEntries, type Entry } from '@/lib/content';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  if (!isAdminEnabled()) notFound();

  const entries = Object.fromEntries(
    COLLECTION_KEYS.map((collection) => [collection, getEntries(collection)])
  ) as Record<CollectionKey, Entry[]>;

  return (
    <div className="py-12">
      <h1 className="text-3xl">Admin</h1>
      <p className="mt-3 max-w-prose text-inkSoft">
        Changes here write straight to the MDX files in <code>content/</code>. Commit them to
        publish.
      </p>
      <div className="mt-10">
        <AdminDashboard entries={entries} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Write `app/admin/[collection]/[slug]/edit/page.tsx`**

```tsx
// app/admin/[collection]/[slug]/edit/page.tsx
import { notFound } from 'next/navigation';
import { isAdminEnabled } from '@/lib/devGuard';
import { assertCollection, type CollectionConfig } from '@/lib/collections';
import { getEntry } from '@/lib/content';
import { parseSections } from '@/lib/entries';
import { EntryForm } from '@/components/admin/EntryForm';

export default function EditEntryPage({
  params,
}: {
  params: { collection: string; slug: string };
}) {
  if (!isAdminEnabled()) notFound();

  let config: CollectionConfig;
  try {
    config = assertCollection(params.collection);
  } catch {
    notFound();
  }

  const entry = getEntry(config.key, params.slug);
  if (!entry) notFound();

  return (
    <div className="py-12">
      <h1 className="text-3xl">{entry.title}</h1>
      <p className="mt-2 font-mono text-xs text-inkSoft">
        {config.label} · {entry.slug}
      </p>
      <div className="mt-10">
        <EntryForm
          collection={config.key}
          slug={entry.slug}
          initial={{
            title: entry.title,
            tags: entry.tags,
            startDate: entry.startDate,
            endDate: entry.endDate ?? '',
            status: entry.status,
            hook: entry.hook,
            org: entry.org,
            role: entry.role,
            location: entry.location,
            sections: parseSections(entry.content, config.sections),
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add components/admin/AdminDashboard.tsx components/admin/AdminDashboard.test.tsx app/admin
git commit -m "Add admin dashboard and edit pages for both collections"
```

---

### Task 18: Verification and README

**Files:** Create `README.md`

- [ ] **Step 1: Run the full suite**

Run: `npm run test`
Expected: all pass — `devGuard` (2), `collections` (8), `format` (5), `content` (10), `entries` (14), `Scorecard` (6), `EntryForm` (5), `AdminDashboard` (5). 55 tests.

- [ ] **Step 2: Lint and typecheck**

Run: `npm run lint`
Expected: no errors.

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: succeeds; output lists five statically generated detail pages plus `/sitemap.xml`.

- [ ] **Step 4: Manual walkthrough in development**

Run `npm run dev`, then confirm each:

1. `/` — headline, intro, and the scorecard with three project rows. Hole numbers run 01–03. Status marks render.
2. `/projects` and `/experience` — both cards render; experience shows two rows.
3. `/projects/asic-math-accelerator` — hole number, played span, tags, all five MDX sections, demo placeholder, back link.
4. `/experience/apple` — shows organization, team, and location; sections are the experience set, not the project set.
5. `/about` — renders; resume downloads.
6. `/nonsense-url` — the out-of-bounds page renders with working links.
7. Resize to a narrow viewport — the scorecard stacks, and the page never scrolls sideways.
8. Tab through the home page — focus rings are visible on every link.
9. `/admin` — both collections listed. Create a test project, confirm the redirect to its edit form, save a change, confirm it persists after reload and appears on `/projects`. Delete it, confirm the confirmation prompt and that it disappears.

- [ ] **Step 5: Confirm the admin surface is closed in production**

Run: `npm run build && NODE_ENV=production npm run start`

Then:
```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/admin
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/api/admin/projects \
  -H 'Content-Type: application/json' -d '{"title":"Should Not Exist"}'
```
Expected: `404` for both. Then confirm no file was written: `ls content/projects` shows only the three original entries.

Stop the server: `pkill -f "next start"`

- [ ] **Step 6: Write `README.md`**

````md
# Timothy Pan — Portfolio

A golf-themed portfolio built on Next.js. The scorecard is the site's index: each project and role
is a hole, and every column on the card renders real data from the content files.

## Running it

```bash
npm install
npm run dev
```

## Adding or editing work

Start the dev server and open `/admin`. Enter a title under Projects or Experience and choose
Create — you land on a form with one field per write-up section. Saving writes directly to
`content/<collection>/<slug>/index.mdx`.

Commit that file to publish it. The admin UI is a local authoring tool, not a live CMS: it only
renders when `NODE_ENV === 'development'`, and its API routes return 404 in production.

Renaming an entry does not change its web address. Slugs are fixed at creation so published links
keep working.

## Content shape

| Collection | Sections |
|---|---|
| `projects` | Overview, Design, Plan, What I Learned, Troubles / Debugging |
| `experience` | Overview, What I Built, What I Learned, Highlights |

To add a collection or change its sections, edit `lib/collections.ts` — the loader, admin UI, and
page templates all read from it.

## Testing

```bash
npm run test
npm run lint
npm run typecheck
```

## Deploying

Push to the connected Vercel project. Set the real domain in `app/layout.tsx` (`metadataBase`) and
`app/sitemap.ts` (`BASE_URL`) so shared links and the sitemap use absolute URLs.
````

- [ ] **Step 7: Commit**

```bash
git add README.md
git commit -m "Add README covering authoring, testing, and deployment"
```

---

## Notes

- **Two placeholders are intentional and belong to Timothy, not the implementer:** the `_Placeholder:_` prose inside `content/**/*.mdx`, the home page intro, and the About page. Every one marks copy only he can write. Leave them exactly as written.
- **The real domain is unset.** `metadataBase` in `app/layout.tsx` and `BASE_URL` in `app/sitemap.ts` both use `https://timothypan.dev` as a stand-in. They affect only absolute URLs in OG tags and the sitemap.
- **`next/font/google` needs network access at build time.** A sandboxed CI environment without it will fail at Task 7.
- **There is no `_template.mdx`.** The template lives in `lib/collections.ts` as each collection's `sections` list, read by both `createEntry` and `parseSections`, so there is one source of truth.
