# Golf-Themed Personal Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js portfolio site with a cream/ink-green/gold Augusta-style golf theme, MDX-based project deep-dives (Overview/Design/Plan/What I Learned/Troubles), and a dev-only local admin UI for adding and editing projects without hand-editing files.

**Architecture:** Next.js 14 App Router + TypeScript + Tailwind. Content lives as MDX files under `content/projects/<slug>/index.mdx`, read via filesystem at request/build time (no database). A dev-only admin UI (`/admin`, guarded by `NODE_ENV`) reads/writes those files through local API routes wrapping a small file-ops library.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, `next-mdx-remote` (RSC), `gray-matter`, Vitest + Testing Library for tests.

**Testing scope (read before starting):** Automated tests target logic-bearing code: the content loader (`lib/content.ts`), the project file-ops library (`lib/projectTemplate.ts`), the dev guard (`lib/devGuard.ts`), and the two interactive client components (`ProjectForm`, `AdminDashboard`). Presentational server components (`Nav`, `Footer`, `ProjectCard`, `DemoEmbed`, page components) are not unit-tested — App Router async server components don't render meaningfully under jsdom/RTL. They're verified by `npm run build` succeeding and a manual browser walkthrough in the final task. This is a deliberate scope decision, not a gap.

---

## File Structure

```
package.json, tsconfig.json, next.config.mjs, postcss.config.js, tailwind.config.ts, .eslintrc.json
vitest.config.ts, vitest.setup.ts
app/
  layout.tsx, globals.css
  page.tsx                          # home
  projects/page.tsx                 # grid
  projects/[slug]/page.tsx          # deep-dive
  about/page.tsx
  admin/page.tsx                    # dashboard (dev-only)
  admin/[slug]/edit/page.tsx        # edit form (dev-only)
  api/admin/projects/route.ts       # GET list, POST create
  api/admin/projects/[slug]/route.ts # PUT update, DELETE
components/
  Nav.tsx, Footer.tsx, ProjectCard.tsx, DemoEmbed.tsx
  admin/ProjectForm.tsx, admin/AdminDashboard.tsx
lib/
  content.ts          # getAllProjects, getProjectBySlug
  projectTemplate.ts  # slugify, buildBody/parseSections, createProject/updateProject/deleteProject
  devGuard.ts          # isAdminEnabled
content/projects/
  product-defect-classifier/index.mdx
  asic-math-accelerator/index.mdx
  lol-win-rate-predictor/index.mdx
public/TimothyPanResume.pdf
```

---

### Task 1: Manual project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.js`, `tailwind.config.ts`, `.eslintrc.json`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`

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
    "test": "vitest run",
    "test:watch": "vitest"
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

- [ ] **Step 3: Write `next.config.mjs`, `postcss.config.js`, `.eslintrc.json`**

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
{
  "extends": "next/core-web-vitals"
}
```

- [ ] **Step 4: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4efe1',
        paperBorder: '#c9bd97',
        ink: {
          DEFAULT: '#16311f',
          light: '#0f4d2e',
          muted: '#5a5344',
        },
        gold: '#b8973f',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
```

- [ ] **Step 5: Write `app/globals.css`, `app/layout.tsx`, minimal `app/page.tsx`**

`app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: theme('colors.paper');
  color: theme('colors.ink.DEFAULT');
}
```

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Timothy Pan',
  description: 'Computer Engineering @ Waterloo. Ex-Apple. Engineer, builder, golfer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-serif">
        <main className="max-w-4xl mx-auto px-6">{children}</main>
      </body>
    </html>
  );
}
```

`app/page.tsx` (placeholder, replaced in Task 6):
```tsx
export default function HomePage() {
  return <h1>Coming soon</h1>;
}
```

- [ ] **Step 6: Install dependencies and verify the build**

Run: `npm install`
Run: `npm run build`
Expected: build completes with `✓ Compiled successfully` and no type errors.

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.json next.config.mjs postcss.config.js tailwind.config.ts .eslintrc.json app package-lock.json
git commit -m "Scaffold Next.js app with Tailwind theme tokens"
```

---

### Task 2: Testing setup + dev guard

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Create: `lib/devGuard.ts`
- Test: `lib/devGuard.test.ts`

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
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 2: Write the failing test for `isAdminEnabled`**

```ts
// lib/devGuard.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { isAdminEnabled } from './devGuard';

describe('isAdminEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run lib/devGuard.test.ts`
Expected: FAIL — `Cannot find module './devGuard'`

- [ ] **Step 4: Write the implementation**

```ts
// lib/devGuard.ts
export function isAdminEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/devGuard.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts lib/devGuard.ts lib/devGuard.test.ts package.json
git commit -m "Add Vitest setup and dev-only admin guard"
```

---

### Task 3: Content loader library

**Files:**
- Create: `lib/content.ts`
- Test: `lib/content.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/content.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getAllProjects, getProjectBySlug } from './content';

let tempDir: string;

function writeProject(slug: string, frontmatter: string, body: string) {
  const dir = path.join(tempDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.mdx'), `---\n${frontmatter}\n---\n\n${body}\n`, 'utf-8');
}

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'projects-'));
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('getAllProjects', () => {
  it('returns an empty array when the directory does not exist', () => {
    expect(getAllProjects(path.join(tempDir, 'missing'))).toEqual([]);
  });

  it('reads and sorts projects by startDate descending', () => {
    writeProject(
      'project-a',
      'title: Project A\ntags:\n  - Python\nstartDate: "2025-01-01"\nstatus: complete\nhook: Hook A',
      '## Overview\n\nBody A'
    );
    writeProject(
      'project-b',
      'title: Project B\ntags:\n  - SystemVerilog\nstartDate: "2025-06-01"\nstatus: in-progress\nhook: Hook B',
      '## Overview\n\nBody B'
    );

    const projects = getAllProjects(tempDir);

    expect(projects.map((p) => p.slug)).toEqual(['project-b', 'project-a']);
    expect(projects[0].title).toBe('Project B');
    expect(projects[0].tags).toEqual(['SystemVerilog']);
    expect(projects[0].status).toBe('in-progress');
  });

  it('ignores directories starting with underscore', () => {
    writeProject(
      '_template',
      'title: Template\ntags: []\nstartDate: "2025-01-01"\nstatus: complete\nhook: n/a',
      '## Overview\n\nn/a'
    );
    expect(getAllProjects(tempDir)).toEqual([]);
  });
});

describe('getProjectBySlug', () => {
  it('returns the parsed project when it exists', () => {
    writeProject(
      'project-a',
      'title: Project A\ntags:\n  - Python\nstartDate: "2025-01-01"\nstatus: complete\nhook: Hook A',
      '## Overview\n\nBody A'
    );

    const project = getProjectBySlug('project-a', tempDir);

    expect(project?.title).toBe('Project A');
    expect(project?.content.trim()).toBe('## Overview\n\nBody A');
  });

  it('returns null when the project does not exist', () => {
    expect(getProjectBySlug('missing', tempDir)).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/content.test.ts`
Expected: FAIL — `Cannot find module './content'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/content.ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects');

export interface ProjectFrontmatter {
  title: string;
  tags: string[];
  startDate: string;
  endDate?: string;
  status: 'in-progress' | 'complete';
  hook: string;
}

export interface Project extends ProjectFrontmatter {
  slug: string;
  content: string;
}

function isProjectDir(dirent: fs.Dirent): boolean {
  return dirent.isDirectory() && !dirent.name.startsWith('_');
}

export function getAllProjects(baseDir: string = PROJECTS_DIR): Project[] {
  if (!fs.existsSync(baseDir)) return [];

  const entries = fs.readdirSync(baseDir, { withFileTypes: true }).filter(isProjectDir);
  const projects = entries
    .map((entry) => getProjectBySlug(entry.name, baseDir))
    .filter((p): p is Project => p !== null);

  return projects.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getProjectBySlug(slug: string, baseDir: string = PROJECTS_DIR): Project | null {
  const filePath = path.join(baseDir, slug, 'index.mdx');
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title,
    tags: data.tags ?? [],
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status,
    hook: data.hook,
    content,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/content.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/content.ts lib/content.test.ts
git commit -m "Add filesystem-based project content loader"
```

---

### Task 4: Project template + file-ops library

**Files:**
- Create: `lib/projectTemplate.ts`
- Test: `lib/projectTemplate.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/projectTemplate.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';
import {
  slugify,
  SECTIONS,
  buildBody,
  parseSections,
  createProject,
  updateProject,
  deleteProject,
} from './projectTemplate';

describe('slugify', () => {
  it('lowercases, trims, and hyphenates', () => {
    expect(slugify('  ASIC Math Accelerator Unit! ')).toBe('asic-math-accelerator-unit');
  });
});

describe('buildBody / parseSections round-trip', () => {
  it('reconstructs the same section map after building and parsing', () => {
    const sections = {
      Overview: 'Overview text',
      Design: 'Design text',
      Plan: 'Plan text',
      'What I Learned': 'Learned text',
      'Troubles / Debugging': 'Troubles text',
    };
    const body = buildBody(sections);
    expect(parseSections(body)).toEqual(sections);
  });

  it('includes every section heading in order', () => {
    const sections = Object.fromEntries(SECTIONS.map((s) => [s, `${s} body`])) as Record<
      (typeof SECTIONS)[number],
      string
    >;
    const body = buildBody(sections);
    const headingOrder = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    expect(headingOrder).toEqual(SECTIONS);
  });
});

describe('createProject / updateProject / deleteProject', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'projects-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates a project folder with placeholder sections', () => {
    const slug = createProject('My New Project', tempDir);

    expect(slug).toBe('my-new-project');
    const raw = fs.readFileSync(path.join(tempDir, slug, 'index.mdx'), 'utf-8');
    const { data, content } = matter(raw);
    expect(data.title).toBe('My New Project');
    expect(data.status).toBe('in-progress');
    expect(parseSections(content).Overview).toContain('Placeholder');
  });

  it('throws when creating a project that already exists', () => {
    createProject('Duplicate', tempDir);
    expect(() => createProject('Duplicate', tempDir)).toThrow('already exists');
  });

  it('updates an existing project', () => {
    const slug = createProject('Editable Project', tempDir);

    updateProject(
      slug,
      {
        title: 'Editable Project',
        tags: ['Python'],
        startDate: '2025-01-01',
        status: 'complete',
        hook: 'Updated hook',
        sections: {
          Overview: 'Updated overview',
          Design: 'Updated design',
          Plan: 'Updated plan',
          'What I Learned': 'Updated learned',
          'Troubles / Debugging': 'Updated troubles',
        },
      },
      tempDir
    );

    const raw = fs.readFileSync(path.join(tempDir, slug, 'index.mdx'), 'utf-8');
    const { data, content } = matter(raw);
    expect(data.hook).toBe('Updated hook');
    expect(data.status).toBe('complete');
    expect(parseSections(content).Overview).toBe('Updated overview');
  });

  it('throws when updating a project that does not exist', () => {
    expect(() =>
      updateProject(
        'missing',
        {
          title: 'x',
          tags: [],
          startDate: '2025-01-01',
          status: 'complete',
          hook: 'x',
          sections: {
            Overview: '',
            Design: '',
            Plan: '',
            'What I Learned': '',
            'Troubles / Debugging': '',
          },
        },
        tempDir
      )
    ).toThrow('not found');
  });

  it('deletes an existing project', () => {
    const slug = createProject('Deletable Project', tempDir);
    deleteProject(slug, tempDir);
    expect(fs.existsSync(path.join(tempDir, slug))).toBe(false);
  });

  it('throws when deleting a project that does not exist', () => {
    expect(() => deleteProject('missing', tempDir)).toThrow('not found');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/projectTemplate.test.ts`
Expected: FAIL — `Cannot find module './projectTemplate'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/projectTemplate.ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { PROJECTS_DIR, type ProjectFrontmatter } from './content';

export const SECTIONS = ['Overview', 'Design', 'Plan', 'What I Learned', 'Troubles / Debugging'] as const;
export type SectionName = (typeof SECTIONS)[number];
export type SectionMap = Record<SectionName, string>;

export interface ProjectInput extends ProjectFrontmatter {
  sections: SectionMap;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildBody(sections: SectionMap): string {
  return SECTIONS.map((name) => `## ${name}\n\n${sections[name].trim()}\n`).join('\n');
}

export function parseSections(body: string): SectionMap {
  const result = {} as SectionMap;
  for (const name of SECTIONS) result[name] = '';

  const headingPattern = /^##\s+(.+)$/gm;
  const matches = [...body.matchAll(headingPattern)];

  for (let i = 0; i < matches.length; i++) {
    const heading = matches[i][1].trim();
    if (!(SECTIONS as readonly string[]).includes(heading)) continue;

    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : body.length;
    result[heading as SectionName] = body.slice(start, end).trim();
  }

  return result;
}

function placeholderSections(): SectionMap {
  const sections = {} as SectionMap;
  for (const name of SECTIONS) {
    sections[name] = `_Placeholder: fill in ${name.toLowerCase()}._`;
  }
  return sections;
}

export function createProject(title: string, baseDir: string = PROJECTS_DIR): string {
  const slug = slugify(title);
  const dir = path.join(baseDir, slug);
  if (fs.existsSync(dir)) throw new Error(`Project "${slug}" already exists`);

  fs.mkdirSync(dir, { recursive: true });

  const frontmatter: ProjectFrontmatter = {
    title,
    tags: [],
    startDate: new Date().toISOString().slice(0, 10),
    status: 'in-progress',
    hook: '',
  };
  const body = buildBody(placeholderSections());
  fs.writeFileSync(path.join(dir, 'index.mdx'), matter.stringify(body, frontmatter), 'utf-8');

  return slug;
}

export function updateProject(slug: string, input: ProjectInput, baseDir: string = PROJECTS_DIR): void {
  const dir = path.join(baseDir, slug);
  if (!fs.existsSync(dir)) throw new Error(`Project "${slug}" not found`);

  const { sections, ...frontmatter } = input;
  const body = buildBody(sections);
  fs.writeFileSync(path.join(dir, 'index.mdx'), matter.stringify(body, frontmatter), 'utf-8');
}

export function deleteProject(slug: string, baseDir: string = PROJECTS_DIR): void {
  const dir = path.join(baseDir, slug);
  if (!fs.existsSync(dir)) throw new Error(`Project "${slug}" not found`);

  fs.rmSync(dir, { recursive: true, force: true });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/projectTemplate.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/projectTemplate.ts lib/projectTemplate.test.ts
git commit -m "Add project scaffolding and CRUD file-ops library"
```

---

### Task 5: Nav and Footer components

**Files:**
- Create: `components/Nav.tsx`, `components/Footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write `components/Nav.tsx`**

```tsx
// components/Nav.tsx
import Link from 'next/link';

export function Nav() {
  return (
    <header className="border-b border-paperBorder">
      <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-xs tracking-[4px] uppercase text-ink-light">
          Timothy Pan
        </Link>
        <nav className="flex items-center gap-6 text-xs tracking-[2px] uppercase text-ink-light">
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
          <a href="/TimothyPanResume.pdf" download>
            Resume
          </a>
        </nav>
      </div>
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px w-32 bg-gold" />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Write `components/Footer.tsx`**

```tsx
// components/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-paperBorder mt-16">
      <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-ink-muted">
        <span>© {new Date().getFullYear()} Timothy Pan</span>
        <div className="flex gap-4">
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

- [ ] **Step 3: Wire them into the root layout**

Modify `app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Timothy Pan',
  description: 'Computer Engineering @ Waterloo. Ex-Apple. Engineer, builder, golfer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-serif">
        <Nav />
        <main className="max-w-4xl mx-auto px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify the build still passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/Nav.tsx components/Footer.tsx app/layout.tsx
git commit -m "Add Nav and Footer components"
```

---

### Task 6: Home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace the placeholder home page**

```tsx
// app/page.tsx
import Link from 'next/link';
import { getAllProjects } from '@/lib/content';
import { ProjectCard } from '@/components/ProjectCard';

export default function HomePage() {
  const featured = getAllProjects().slice(0, 3);

  return (
    <div>
      <section className="py-20 border border-paperBorder rounded-sm px-10 my-10">
        <h1 className="text-4xl leading-snug text-ink">
          Engineer.
          <br />
          Builder.
          <br />
          <span className="text-gold">Golfer.</span>
        </h1>
        <p className="mt-6 max-w-md text-ink-muted text-sm">
          Computer Engineering @ Waterloo. Ex-Apple. I build things — in software, silicon, and
          on the back nine.
        </p>
        <Link
          href="/projects"
          className="mt-8 inline-block border border-ink text-ink text-xs tracking-[2px] uppercase px-6 py-3"
        >
          View Projects
        </Link>
      </section>

      {featured.length > 0 && (
        <section className="mb-20">
          <h2 className="text-xs tracking-[3px] uppercase text-ink-muted mb-6">Featured Work</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

Note: `ProjectCard` is created in Task 7. This task depends on that component existing before `npm run build` will succeed — implement Task 7's `components/ProjectCard.tsx` first if working through tasks out of order, or treat Tasks 6 and 7 as one commit boundary.

- [ ] **Step 2: Commit** (after Task 7's `ProjectCard` exists)

```bash
git add app/page.tsx
git commit -m "Build home page hero and featured projects"
```

---

### Task 7: ProjectCard component + projects grid page

**Files:**
- Create: `components/ProjectCard.tsx`
- Create: `app/projects/page.tsx`

- [ ] **Step 1: Write `components/ProjectCard.tsx`**

```tsx
// components/ProjectCard.tsx
import Link from 'next/link';
import type { Project } from '@/lib/content';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block border border-paperBorder p-6 hover:border-gold transition-colors"
    >
      <div className="text-xs tracking-[2px] uppercase text-ink-muted mb-2">
        {project.tags.join(' · ')}
      </div>
      <h3 className="text-xl text-ink mb-2">{project.title}</h3>
      <p className="text-sm text-ink-muted">{project.hook}</p>
    </Link>
  );
}
```

- [ ] **Step 2: Write `app/projects/page.tsx`**

```tsx
// app/projects/page.tsx
import { getAllProjects } from '@/lib/content';
import { ProjectCard } from '@/components/ProjectCard';

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="py-16">
      <h1 className="text-3xl text-ink mb-2">Projects</h1>
      <p className="text-ink-muted text-sm mb-10">Selected work, in progress and complete.</p>
      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify the build passes**

Run: `npm run build`
Expected: build succeeds (home page from Task 6 and projects grid both compile).

- [ ] **Step 4: Commit**

```bash
git add components/ProjectCard.tsx app/projects/page.tsx app/page.tsx
git commit -m "Add ProjectCard component and projects grid page"
```

---

### Task 8: Project detail page + DemoEmbed + MDX rendering

**Files:**
- Create: `components/DemoEmbed.tsx`
- Create: `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Write `components/DemoEmbed.tsx`**

```tsx
// components/DemoEmbed.tsx
export function DemoEmbed({ slug }: { slug: string }) {
  return (
    <div
      data-project-slug={slug}
      className="border border-dashed border-paperBorder rounded-sm p-10 text-center text-ink-muted text-sm mt-10"
    >
      Demo coming soon.
    </div>
  );
}
```

- [ ] **Step 2: Write `app/projects/[slug]/page.tsx`**

```tsx
// app/projects/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllProjects, getProjectBySlug } from '@/lib/content';
import { DemoEmbed } from '@/components/DemoEmbed';

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  return (
    <article className="py-16">
      <div className="text-xs tracking-[2px] uppercase text-ink-muted mb-2">
        {project.tags.join(' · ')} · {project.status === 'complete' ? 'Complete' : 'In Progress'}
      </div>
      <h1 className="text-3xl text-ink mb-8">{project.title}</h1>
      <div className="prose prose-sm max-w-none text-ink prose-headings:font-serif prose-headings:text-ink prose-a:text-ink-light">
        <MDXRemote source={project.content} />
      </div>
      <DemoEmbed slug={project.slug} />
    </article>
  );
}
```

- [ ] **Step 3: Verify the build passes**

Run: `npm run build`
Expected: build succeeds. (No project content exists yet, so `generateStaticParams` returns an empty array — this is expected until Task 10.)

- [ ] **Step 4: Commit**

```bash
git add components/DemoEmbed.tsx app/projects/\[slug\]/page.tsx
git commit -m "Add project detail page with MDX rendering and demo slot"
```

---

### Task 9: About page

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Write `app/about/page.tsx`**

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="py-16 max-w-2xl">
      <h1 className="text-3xl text-ink mb-8">About</h1>
      <div className="text-sm text-ink-muted space-y-4">
        <p>
          _Placeholder: write your bio here — how you got into engineering, what you're
          studying, what you care about._
        </p>
        <p>
          _Placeholder: write about golf — how long you've played, what you like about it, how
          it connects to how you think about engineering (or doesn't, and that's fine too)._
        </p>
      </div>
      <a
        href="/TimothyPanResume.pdf"
        download
        className="mt-8 inline-block border border-ink text-ink text-xs tracking-[2px] uppercase px-6 py-3"
      >
        Download Resume
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add app/about/page.tsx
git commit -m "Add about page"
```

---

### Task 10: Launch project content

**Files:**
- Create: `content/projects/product-defect-classifier/index.mdx`
- Create: `content/projects/asic-math-accelerator/index.mdx`
- Create: `content/projects/lol-win-rate-predictor/index.mdx`

- [ ] **Step 1: Write `content/projects/product-defect-classifier/index.mdx`**

```mdx
---
title: Product Defect Classifier
tags:
  - Python
  - FastAPI
  - spaCy
  - NLP
startDate: "2025-01-01"
status: complete
hook: An NLP pipeline that auto-triages manufacturing defect reports and learns from engineer corrections.
---

## Overview

_Placeholder: 2-3 sentences on what this project is and why you built it._

## Design

_Placeholder: how the embedding + cosine similarity classification pipeline is structured, why
you chose sentence transformers over alternatives, how the active learning loop and HDBSCAN
clustering fit in._

## Plan

_Placeholder: how you sequenced the work — e.g. classification core first, then the FastAPI/CLI
interfaces, then the active learning loop._

## What I Learned

_Placeholder: what surprised you, what you'd do differently, what concepts clicked._

## Troubles / Debugging

_Placeholder: a specific bug or dead end and how you found/fixed it._
```

- [ ] **Step 2: Write `content/projects/asic-math-accelerator/index.mdx`**

```mdx
---
title: ASIC Math Accelerator Unit
tags:
  - SystemVerilog
  - ASIC
  - RTL
  - TinyTapeout
startDate: "2024-09-01"
status: complete
hook: A taped-out SIMD math accelerator ASIC, built solo in SystemVerilog via TinyTapeout.
---

## Overview

_Placeholder: 2-3 sentences on what this project is and why you built it._

## Design

_Placeholder: the SIMD datapath design, how scalar/vector/matrix/polynomial arithmetic share
hardware, the wave I/O protocol and why it was needed under TinyTapeout's pin constraints._

## Plan

_Placeholder: how you sequenced the tape-out — datapath design, verification, pin-constrained
I/O, submission._

## What I Learned

_Placeholder: what surprised you about ASIC design specifically vs. FPGA/software work._

## Troubles / Debugging

_Placeholder: a specific bug or dead end and how you found/fixed it._
```

- [ ] **Step 3: Write `content/projects/lol-win-rate-predictor/index.mdx`**

```mdx
---
title: League of Legends Win Rate Predictor
tags:
  - Python
  - Machine Learning
startDate: "2024-05-01"
status: complete
hook: A personalized ML model that predicts League of Legends match outcomes from live game data.
---

## Overview

_Placeholder: 2-3 sentences on what this project is and why you built it._

## Design

_Placeholder: how you pulled data via the Riot Games API, which 10+ features you engineered,
why logistic regression._

## Plan

_Placeholder: how you sequenced the work — data collection, feature engineering, model
training/evaluation._

## What I Learned

_Placeholder: what surprised you about the features that actually mattered._

## Troubles / Debugging

_Placeholder: a specific bug or dead end and how you found/fixed it (e.g. API rate limits, data
quality issues)._
```

- [ ] **Step 4: Verify the build passes and pages render**

Run: `npm run build`
Expected: build succeeds; `generateStaticParams` now returns 3 slugs and 3 static project pages are generated.

- [ ] **Step 5: Commit**

```bash
git add content/projects
git commit -m "Add launch project content with placeholder write-ups"
```

---

### Task 11: Resume PDF + download links

**Files:**
- Move: `TimothyPanResume.pdf` → `public/TimothyPanResume.pdf`

- [ ] **Step 1: Move the resume into `public/`**

Run: `mkdir -p public && git mv TimothyPanResume.pdf public/TimothyPanResume.pdf`

- [ ] **Step 2: Verify the link works**

Run: `npm run build && npm run start &`
Run: `curl -sI http://localhost:3000/TimothyPanResume.pdf | head -1`
Expected: `HTTP/1.1 200 OK`

Stop the server afterward: `kill %1`

Note: `components/Nav.tsx` (Task 5) and `app/about/page.tsx` (Task 9) already link to `/TimothyPanResume.pdf` — no changes needed there since the file now exists at that public path.

- [ ] **Step 3: Commit**

```bash
git add public/TimothyPanResume.pdf
git commit -m "Move resume into public/ for direct download"
```

---

### Task 12: Admin API routes

**Files:**
- Create: `app/api/admin/projects/route.ts`
- Create: `app/api/admin/projects/[slug]/route.ts`

- [ ] **Step 1: Write `app/api/admin/projects/route.ts`**

```ts
// app/api/admin/projects/route.ts
import { NextResponse } from 'next/server';
import { isAdminEnabled } from '@/lib/devGuard';
import { getAllProjects } from '@/lib/content';
import { createProject } from '@/lib/projectTemplate';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdminEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(getAllProjects());
}

export async function POST(request: Request) {
  if (!isAdminEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  if (typeof body.title !== 'string' || body.title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  try {
    const slug = createProject(body.title);
    return NextResponse.json({ slug }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 409 });
  }
}
```

- [ ] **Step 2: Write `app/api/admin/projects/[slug]/route.ts`**

```ts
// app/api/admin/projects/[slug]/route.ts
import { NextResponse } from 'next/server';
import { isAdminEnabled } from '@/lib/devGuard';
import { updateProject, deleteProject } from '@/lib/projectTemplate';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  if (!isAdminEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();

  try {
    updateProject(params.slug, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { slug: string } }) {
  if (!isAdminEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    deleteProject(params.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
```

These route handlers are thin wrappers around the already-tested `lib/projectTemplate.ts` and `lib/content.ts` functions — no additional unit tests here; they're exercised manually in Task 15.

- [ ] **Step 3: Verify the build passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/api
git commit -m "Add dev-only admin API routes for project CRUD"
```

---

### Task 13: ProjectForm component

**Files:**
- Create: `components/admin/ProjectForm.tsx`
- Test: `components/admin/ProjectForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// components/admin/ProjectForm.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectForm } from './ProjectForm';

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

describe('ProjectForm', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefills fields from initial values', () => {
    render(<ProjectForm slug="original-title" initial={initial} />);
    expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Original hook')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Overview text')).toBeInTheDocument();
  });

  it('PUTs the updated payload on submit', async () => {
    render(<ProjectForm slug="original-title" initial={initial} />);

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Title' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/admin/projects/original-title');
    expect(options.method).toBe('PUT');

    const payload = JSON.parse(options.body);
    expect(payload.title).toBe('Updated Title');
    expect(payload.sections.Overview).toBe('Overview text');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/ProjectForm.test.tsx`
Expected: FAIL — `Cannot find module './ProjectForm'`

- [ ] **Step 3: Write the implementation**

```tsx
// components/admin/ProjectForm.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SECTIONS, type SectionMap } from '@/lib/projectTemplate';

export interface ProjectFormValues {
  title: string;
  tags: string[];
  startDate: string;
  endDate?: string;
  status: 'in-progress' | 'complete';
  hook: string;
  sections: SectionMap;
}

export function ProjectForm({ slug, initial }: { slug: string; initial: ProjectFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await fetch(`/api/admin/projects/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setSaving(false);
    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="title" className="block text-xs uppercase tracking-[2px] text-ink-muted mb-1">
          Title
        </label>
        <input
          id="title"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          className="w-full border border-paperBorder px-3 py-2 bg-paper"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-xs uppercase tracking-[2px] text-ink-muted mb-1">
          Tags (comma separated)
        </label>
        <input
          id="tags"
          value={values.tags.join(', ')}
          onChange={(e) =>
            setValues({ ...values, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })
          }
          className="w-full border border-paperBorder px-3 py-2 bg-paper"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-xs uppercase tracking-[2px] text-ink-muted mb-1">
            Start Date
          </label>
          <input
            id="startDate"
            value={values.startDate}
            onChange={(e) => setValues({ ...values, startDate: e.target.value })}
            className="w-full border border-paperBorder px-3 py-2 bg-paper"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-xs uppercase tracking-[2px] text-ink-muted mb-1">
            Status
          </label>
          <select
            id="status"
            value={values.status}
            onChange={(e) => setValues({ ...values, status: e.target.value as 'in-progress' | 'complete' })}
            className="w-full border border-paperBorder px-3 py-2 bg-paper"
          >
            <option value="in-progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="hook" className="block text-xs uppercase tracking-[2px] text-ink-muted mb-1">
          Hook
        </label>
        <input
          id="hook"
          value={values.hook}
          onChange={(e) => setValues({ ...values, hook: e.target.value })}
          className="w-full border border-paperBorder px-3 py-2 bg-paper"
        />
      </div>

      {SECTIONS.map((section) => (
        <div key={section}>
          <label
            htmlFor={section}
            className="block text-xs uppercase tracking-[2px] text-ink-muted mb-1"
          >
            {section}
          </label>
          <textarea
            id={section}
            value={values.sections[section]}
            onChange={(e) =>
              setValues({ ...values, sections: { ...values.sections, [section]: e.target.value } })
            }
            rows={6}
            className="w-full border border-paperBorder px-3 py-2 bg-paper"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="border border-ink text-ink text-xs tracking-[2px] uppercase px-6 py-3"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/ProjectForm.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add components/admin/ProjectForm.tsx components/admin/ProjectForm.test.tsx
git commit -m "Add ProjectForm admin component"
```

---

### Task 14: Admin pages (dashboard + edit)

**Files:**
- Create: `components/admin/AdminDashboard.tsx`
- Test: `components/admin/AdminDashboard.test.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/[slug]/edit/page.tsx`

- [ ] **Step 1: Write the failing test for `AdminDashboard`**

```tsx
// components/admin/AdminDashboard.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboard } from './AdminDashboard';

const projects = [
  {
    slug: 'project-a',
    title: 'Project A',
    tags: ['Python'],
    startDate: '2025-01-01',
    status: 'complete' as const,
    hook: 'Hook A',
    content: '',
  },
];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ slug: 'new-project' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists existing projects', () => {
    render(<AdminDashboard initialProjects={projects} />);
    expect(screen.getByText('Project A')).toBeInTheDocument();
  });

  it('POSTs a new project title on create', async () => {
    render(<AdminDashboard initialProjects={projects} />);

    fireEvent.change(screen.getByLabelText('New project title'), {
      target: { value: 'New Project' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/admin/projects');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ title: 'New Project' });
  });

  it('DELETEs a project on delete click', async () => {
    render(<AdminDashboard initialProjects={projects} />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/admin/projects/project-a');
    expect(options.method).toBe('DELETE');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/AdminDashboard.test.tsx`
Expected: FAIL — `Cannot find module './AdminDashboard'`

- [ ] **Step 3: Write `components/admin/AdminDashboard.tsx`**

```tsx
// components/admin/AdminDashboard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/content';

export function AdminDashboard({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [newTitle, setNewTitle] = useState('');

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });
    const data = await response.json();
    setNewTitle('');
    router.push(`/admin/${data.slug}/edit`);
    router.refresh();
  }

  async function handleDelete(slug: string) {
    await fetch(`/api/admin/projects/${slug}`, { method: 'DELETE' });
    setProjects((current) => current.filter((p) => p.slug !== slug));
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleCreate} className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="new-title" className="block text-xs uppercase tracking-[2px] text-ink-muted mb-1">
            New project title
          </label>
          <input
            id="new-title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border border-paperBorder px-3 py-2 bg-paper"
          />
        </div>
        <button
          type="submit"
          className="border border-ink text-ink text-xs tracking-[2px] uppercase px-6 py-2"
        >
          Create
        </button>
      </form>

      <ul className="divide-y divide-paperBorder">
        {projects.map((project) => (
          <li key={project.slug} className="py-4 flex items-center justify-between">
            <div>
              <div className="text-ink">{project.title}</div>
              <div className="text-xs text-ink-muted">{project.status}</div>
            </div>
            <div className="flex gap-4 text-xs uppercase tracking-[2px]">
              <Link href={`/admin/${project.slug}/edit`} className="text-ink-light">
                Edit
              </Link>
              <button onClick={() => handleDelete(project.slug)} className="text-ink-muted">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/AdminDashboard.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Write `app/admin/page.tsx`**

```tsx
// app/admin/page.tsx
import { notFound } from 'next/navigation';
import { isAdminEnabled } from '@/lib/devGuard';
import { getAllProjects } from '@/lib/content';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  if (!isAdminEnabled()) notFound();

  return (
    <div className="py-16">
      <h1 className="text-3xl text-ink mb-8">Admin</h1>
      <AdminDashboard initialProjects={getAllProjects()} />
    </div>
  );
}
```

- [ ] **Step 6: Write `app/admin/[slug]/edit/page.tsx`**

```tsx
// app/admin/[slug]/edit/page.tsx
import { notFound } from 'next/navigation';
import { isAdminEnabled } from '@/lib/devGuard';
import { getProjectBySlug } from '@/lib/content';
import { parseSections } from '@/lib/projectTemplate';
import { ProjectForm } from '@/components/admin/ProjectForm';

export default function EditProjectPage({ params }: { params: { slug: string } }) {
  if (!isAdminEnabled()) notFound();

  const project = getProjectBySlug(params.slug);
  if (!project) notFound();

  return (
    <div className="py-16">
      <h1 className="text-3xl text-ink mb-8">Edit: {project.title}</h1>
      <ProjectForm
        slug={project.slug}
        initial={{
          title: project.title,
          tags: project.tags,
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status,
          hook: project.hook,
          sections: parseSections(project.content),
        }}
      />
    </div>
  );
}
```

- [ ] **Step 7: Verify the build passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add components/admin/AdminDashboard.tsx components/admin/AdminDashboard.test.tsx app/admin
git commit -m "Add admin dashboard and edit page"
```

---

### Task 15: Final verification and README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Run the full automated suite**

Run: `npm run test`
Expected: all test files pass (`devGuard`, `content`, `projectTemplate`, `ProjectForm`, `AdminDashboard`).

- [ ] **Step 2: Run lint and typecheck**

Run: `npm run lint`
Expected: no errors.

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run a full production build**

Run: `npm run build`
Expected: build succeeds, including 3 statically generated project pages.

- [ ] **Step 4: Manual walkthrough**

Run: `npm run dev`, then in a browser:
1. Visit `/` — hero renders, featured projects show, resume download link works.
2. Visit `/projects` — all 3 projects listed.
3. Visit `/projects/product-defect-classifier` — MDX sections render, demo placeholder shows.
4. Visit `/about` — page renders.
5. Visit `/admin` — dashboard lists 3 projects; create a test project, confirm redirect to its edit page; edit and save it, confirm changes persist on reload; delete it, confirm it disappears.
6. Run `npm run build` again (production mode) and confirm `/admin` returns a 404 when visiting the built output with `NODE_ENV=production npm run start`.

- [ ] **Step 5: Write `README.md`**

```md
# Timothy Pan — Personal Portfolio

Golf-themed personal portfolio built with Next.js, TypeScript, and Tailwind.

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The admin UI at `/admin` is only reachable in development
(`npm run dev`) — it's excluded from production builds.

## Adding a project

Run `npm run dev`, go to `/admin`, enter a title, and click Create. You'll be redirected to an
edit form for Overview / Design / Plan / What I Learned / Troubles sections. Content is saved
directly to `content/projects/<slug>/index.mdx` — commit that file to keep it.

## Testing

```bash
npm run test
```

## Deployment

Push to the connected Vercel project (or `vercel --prod`). The admin UI is inert in production
since it's gated on `NODE_ENV === 'development'`.
```

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "Add README with dev, content, and deploy instructions"
```

---

## Post-Plan Notes

- No `_template.mdx` file is created — the project template lives as code in `lib/projectTemplate.ts` (`SECTIONS` + `placeholderSections()`), which is the single source of truth used by both `createProject` and `parseSections`. This avoids duplicating the template in two places.
- There is no separate `/admin/new` page — creating a project is a single title field at the top of the `/admin` dashboard, which then redirects into the full edit form. This satisfies the spec's "New Project" and "Edit/Create form" bullets with one less page.
- Live interactive demos (e.g., a real LoL predictor demo) are out of scope per the spec; `DemoEmbed` is a placeholder slot ready to receive one later.
