import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  it('numbers entries in order', () => {
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

  it('shows the date span and status in accessible text', () => {
    render(<Scorecard collection="projects" entries={entries} />);
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2024–')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Complete')).toHaveLength(1);
    expect(screen.getAllByLabelText('In progress')).toHaveLength(1);
  });

  it('labels the selected collection and entry count', () => {
    render(<Scorecard collection="projects" entries={entries} />);
    const header = screen.getByTestId('scorecard-header');
    expect(header).toHaveTextContent('Selected projects');
    expect(header).toHaveTextContent('2 entries');
  });

  it('renders an invitation when the collection is empty', () => {
    render(<Scorecard collection="projects" entries={[]} />);
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });

  it('gives each row link a concise accessible name instead of its full visible content', () => {
    render(<Scorecard collection="projects" entries={entries} />);
    const link = screen.getByRole('link', { name: /ASIC Math Accelerator Unit/ });
    expect(link).toHaveAccessibleName('ASIC Math Accelerator Unit, 2024, complete');
  });
});
