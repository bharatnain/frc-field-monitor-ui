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
    advisories: [],
    trip: '7 ms',
    pkts: '1',
    blockingText: '',
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

  it('renders accessible advisory badges with labels and icons in the header', () => {
    render(
      <TeamStatusCard
        alliance="red"
        row={createRow({
          advisories: [
            { key: 'newRadio', label: 'NEW RADIO', tone: 'warn', icon: 'radio' },
            { key: 'newWpa', label: 'NEW WPA', tone: 'info', icon: 'key' },
          ],
        })}
      />
    );

    expect(screen.getByText('NEW RADIO')).toBeInTheDocument();
    expect(screen.getByText('NEW WPA')).toBeInTheDocument();
    expect(screen.getAllByTestId('row-advisory-badge')).toHaveLength(2);
  });
});
