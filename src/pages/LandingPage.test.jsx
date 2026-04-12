import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LandingPage from './LandingPage';

function renderLandingPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
}

describe('LandingPage', () => {
  it('sets the document title for the welcome page', () => {
    renderLandingPage();

    expect(document.title).toBe('Welcome - FIRST Field Monitor');
  });

  it('renders the core marketing message and product-led proof', () => {
    renderLandingPage();

    expect(screen.getByText('FIRST Field Monitor')).toBeInTheDocument();
    expect(screen.getByText('See the whole field. Catch issues before they cost a match.')).toBeInTheDocument();
    expect(screen.getByText('Built for the tempo of real field operations')).toBeInTheDocument();
    expect(screen.getByText('Use real field behavior to train staff before the next event day.')).toBeInTheDocument();
  });

  it('links users into the product experience', () => {
    renderLandingPage();

    expect(screen.getAllByRole('link', { name: 'Open live monitor' })[0]).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: 'Explore config and replay' })[0]).toHaveAttribute('href', '/config');
    expect(screen.getByRole('link', { name: 'View product states' })).toHaveAttribute('href', '/showcase');
  });
});
