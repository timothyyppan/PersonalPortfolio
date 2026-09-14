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
