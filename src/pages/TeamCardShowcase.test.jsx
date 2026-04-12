import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TeamCardShowcase from './TeamCardShowcase';

function renderShowcase() {
  return render(
    <MemoryRouter>
      <TeamCardShowcase />
    </MemoryRouter>
  );
}

describe('TeamCardShowcase', () => {
  it('sets the document title for the showcase page', () => {
    renderShowcase();

    expect(document.title).toBe('Team Card Showcase - FIRST Field Monitor');
  });

  it('renders the static showcase title and navigation links', () => {
    renderShowcase();

    expect(screen.getByText('Team Card Showcase')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open live monitor' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Open config' })).toHaveAttribute('href', '/config');
  });

  it('renders the curated section headings and representative card titles', () => {
    renderShowcase();

    expect(screen.getByText('Healthy States')).toBeInTheDocument();
    expect(screen.getByText('Connection Warnings')).toBeInTheDocument();
    expect(screen.getByText('Critical Conditions')).toBeInTheDocument();
    expect(screen.getByText('Stops And Overrides')).toBeInTheDocument();
    expect(screen.getByText('Special Cases')).toBeInTheDocument();

    expect(screen.getByText('Autonomous Enabled')).toBeInTheDocument();
    expect(screen.getByText('Emergency Stop')).toBeInTheDocument();
    expect(screen.getByText('Bypassed Station')).toBeInTheDocument();
    expect(screen.getByText('Blocking Assignment')).toBeInTheDocument();
    expect(screen.getByText('Post-Match Muted')).toBeInTheDocument();
  });
});
