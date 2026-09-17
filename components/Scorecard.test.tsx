import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Scorecard } from './Scorecard';
import type { Entry } from '@/lib/content';

const projectEntries: Entry[] = [
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

const experienceEntries: Entry[] = [
  {
    collection: 'experience',
    slug: 'apple',
    title: 'Software Engineering Intern',
    org: 'Apple',
    tags: ['Python'],
    startDate: '2025-01-01',
    endDate: '2025-08-01',
    status: 'complete',
    hook: 'Rebuilt packaging test specifications.',
    content: '',
  },
];

describe('Scorecard', () => {
  it('numbers entries in order', () => {
    render(<Scorecard collection="projects" entries={projectEntries} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
  });

  it('links each row to the entry', () => {
    render(<Scorecard collection="projects" entries={projectEntries} />);
    expect(screen.getByRole('link', { name: /ASIC Math Accelerator Unit/ })).toHaveAttribute(
      'href',
      '/projects/asic-math-accelerator'
    );
  });

  it('does not show tools or project descriptions on the scorecard', () => {
    render(<Scorecard collection="projects" entries={projectEntries} />);
    expect(screen.queryByText('TOOLS')).not.toBeInTheDocument();
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
    expect(screen.queryByText('Machine Learning')).not.toBeInTheDocument();
    expect(screen.queryByText('A taped-out SIMD accelerator.')).not.toBeInTheDocument();
  });

  it('does not show dates or a status indicator for projects', () => {
    render(<Scorecard collection="projects" entries={projectEntries} />);
    expect(screen.queryByText('DATES')).not.toBeInTheDocument();
    expect(screen.queryByText('STATUS')).not.toBeInTheDocument();
    expect(screen.queryByText(/2024/)).not.toBeInTheDocument();
  });

  it('shows the company name and a month/year date range for experience', () => {
    render(<Scorecard collection="experience" entries={experienceEntries} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Jan 2025 – Aug 2025')).toBeInTheDocument();
  });

  it('does not render a selected-collection summary row', () => {
    render(<Scorecard collection="projects" entries={projectEntries} />);
    expect(screen.queryByText('Selected projects')).not.toBeInTheDocument();
    expect(screen.queryByText('2 entries')).not.toBeInTheDocument();
  });

  it('renders an invitation when the collection is empty', () => {
    render(<Scorecard collection="projects" entries={[]} />);
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });

  it('gives each project row link a concise accessible name instead of its full visible content', () => {
    render(<Scorecard collection="projects" entries={projectEntries} />);
    const link = screen.getByRole('link', { name: /ASIC Math Accelerator Unit/ });
    expect(link).toHaveAccessibleName('ASIC Math Accelerator Unit');
  });
});
