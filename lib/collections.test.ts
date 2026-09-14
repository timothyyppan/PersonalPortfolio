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
