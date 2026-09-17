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

  it('uses an explicit order before start date', () => {
    writeEntry('experience', 'waterloo', 'title: Waterloo\ntags: []\nstartDate: "2026-05-01"\nstatus: complete\nhook: h\norder: 2', '## Overview\n\nA');
    writeEntry('experience', 'apple', 'title: Apple\ntags: []\nstartDate: "2025-01-01"\nstatus: complete\nhook: h\norder: 1', '## Overview\n\nB');

    expect(getEntries('experience', root).map((e) => e.slug)).toEqual(['apple', 'waterloo']);
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
