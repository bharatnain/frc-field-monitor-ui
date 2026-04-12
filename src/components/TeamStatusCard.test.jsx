import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TeamStatusCard from './TeamStatusCard';

function createRow(overrides = {}) {
  return {
    team: '254',
    station: 'Stn 1',
    mode: 'normal',
    status: { label: 'Teleop Enabled', shortLabel: 'TELEOP', tone: 'tele' },
    isPostMatchMuted: false,
    ds: { label: 'DS', state: 'good', detail: 'Connected' },
    radio: { label: 'Radio', state: 'good', detail: '4 bars', bars: 4, connectedToAp: true, linkActive: true },
    rio: { label: 'RIO', state: 'good', detail: 'Connected' },
    battery: { value: '12.4V', min: '12.1', tone: 'normal', action: '', detail: 'Stable' },
    bwu: { value: '4.8 Mbps', tx: '1.9', rx: '2.9' },
    trip: '7 ms',
    pkts: '1',
    blockingText: '',
    history: { battery: [], bandwidth: [], trip: [] },
    ...overrides,
  };
}

describe('TeamStatusCard', () => {
  it('renders radio bars from explicit row data instead of parsing the detail string', () => {
    render(
      <TeamStatusCard
        alliance="red"
        row={createRow({
          radio: {
            label: 'Radio',
            state: 'good',
            detail: '0 bars',
            bars: 4,
            connectedToAp: true,
            linkActive: true,
          },
        })}
      />
    );

    expect(screen.queryByText('OUT')).not.toBeInTheDocument();
  });

  it('shows OUT when the explicit radio bar count is zero even if the detail string is stale', () => {
    render(
      <TeamStatusCard
        alliance="blue"
        row={createRow({
          radio: {
            label: 'Radio',
            state: 'bad',
            detail: '4 bars',
            bars: 0,
            connectedToAp: false,
            linkActive: false,
          },
        })}
      />
    );

    expect(screen.getAllByText('OUT')).toHaveLength(2);
  });

  it('keeps bypass affordances emphasized while muting the connection and footer sections', () => {
    render(
      <TeamStatusCard
        alliance="red"
        row={createRow({
          mode: 'bypassed',
          status: { label: 'BYPASSED', shortLabel: 'BYPASS', tone: 'danger' },
        })}
      />
    );

    expect(screen.queryByTestId('issue-band')).not.toBeInTheDocument();
    expect(screen.getAllByText('BYPASS')).toHaveLength(1);
    expect(screen.queryByText('BYPASSED')).not.toBeInTheDocument();
    expect(screen.getByTestId('row-header-primary')).not.toHaveClass('opacity-60');

    const contentSection = screen.getByTestId('mobile-connection-layout').parentElement;
    const footerSection = screen.getByTestId('mobile-footer-summary').parentElement;

    expect(contentSection).toHaveClass('opacity-60');
    expect(footerSection).toHaveClass('opacity-70');
  });

  it('keeps e-stop affordances visible while muting the connection and footer sections', () => {
    render(
      <TeamStatusCard
        alliance="red"
        row={createRow({
          mode: 'estopped',
          status: { label: 'E-STOPPED', shortLabel: 'E-STOP', tone: 'danger' },
        })}
      />
    );

    expect(screen.queryByTestId('issue-band')).not.toBeInTheDocument();
    expect(screen.getAllByText('E-STOP')).toHaveLength(2);
    expect(screen.getByTestId('row-header-primary')).not.toHaveClass('opacity-60');

    const contentSection = screen.getByTestId('mobile-connection-layout').parentElement;
    const footerSection = screen.getByTestId('mobile-footer-summary').parentElement;

    expect(contentSection).toHaveClass('opacity-60');
    expect(footerSection).toHaveClass('opacity-70');
  });
});
