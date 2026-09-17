import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AdminDashboard } from './AdminDashboard';
import type { Entry } from '@/lib/content';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const projects: Entry[] = [{
  collection: 'projects', slug: 'a-project', title: 'A Project', tags: [],
  startDate: '2025-01-01', status: 'complete', hook: '', content: '',
}];
const experience: Entry[] = [{
  collection: 'experience', slug: 'apple', title: 'Software Engineering Intern', tags: [],
  startDate: '2025-01-01', status: 'complete', hook: '', content: '',
}];

function setup() {
  return render(<AdminDashboard entries={{ projects, experience }} />);
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 201, json: async () => ({ slug: 'new-entry' }),
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
    fireEvent.change(within(section).getByLabelText('New role title'), { target: { value: 'New Role' } });
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
    fireEvent.click(within(screen.getByTestId('admin-projects')).getByRole('button', { name: /Delete A Project/ }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/api/admin/projects/a-project');
    expect(options.method).toBe('DELETE');
  });

  it('does not delete when the confirmation is dismissed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    setup();
    fireEvent.click(within(screen.getByTestId('admin-projects')).getByRole('button', { name: /Delete A Project/ }));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
