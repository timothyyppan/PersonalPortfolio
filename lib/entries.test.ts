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
