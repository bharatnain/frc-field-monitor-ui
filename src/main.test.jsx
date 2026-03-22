import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./pages/FieldMonitor', () => ({
  default: () => <div>Mock Field Monitor Page</div>,
}));

vi.mock('./pages/config', () => ({
  default: () => <div>Mock Config Page</div>,
}));

vi.mock('./pages/LandingPage', () => ({
  default: () => <div>Mock Landing Page</div>,
}));

vi.mock('./pages/TeamCardShowcase', () => ({
  default: () => <div>Mock Team Card Showcase Page</div>,
}));

import { App } from './main';

describe('App routing', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders the field monitor at the default route', () => {
    window.history.pushState({}, '', '/');
    render(<App />);

    expect(screen.getByText('Mock Field Monitor Page')).toBeInTheDocument();
  });

  it('renders the field monitor at the distance-first route', () => {
    window.history.pushState({}, '', '/distance-first');
    render(<App />);

    expect(screen.getByText('Mock Field Monitor Page')).toBeInTheDocument();
  });

  it('renders the config page at the config route', () => {
    window.history.pushState({}, '', '/config');
    render(<App />);

    expect(screen.getByText('Mock Config Page')).toBeInTheDocument();
  });

  it('renders the landing page at the welcome route', () => {
    window.history.pushState({}, '', '/welcome');
    render(<App />);

    expect(screen.getByText('Mock Landing Page')).toBeInTheDocument();
  });

  it('renders the showcase page at the showcase route', () => {
    window.history.pushState({}, '', '/showcase');
    render(<App />);

    expect(screen.getByText('Mock Team Card Showcase Page')).toBeInTheDocument();
  });
});
