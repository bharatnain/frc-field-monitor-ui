import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FieldMonitor from './FieldMonitor';
import { useFieldMonitorLiveData } from '../lib/fieldMonitorLive';

vi.mock('../lib/fieldMonitorLive', () => ({
  useFieldMonitorLiveData: vi.fn(),
}));

const mockUseFieldMonitorLiveData = vi.mocked(useFieldMonitorLiveData);

function createRow(overrides = {}) {
  return {
    team: '254',
    station: 'Stn 1',
    mode: 'normal',
    status: { label: 'Teleop Enabled', shortLabel: 'TELEOP', tone: 'tele' },
    isPostMatchMuted: false,
    ds: { label: 'DS', state: 'good', detail: 'Connected' },
    radio: { label: 'Radio', state: 'good', detail: '4 bars' },
    rio: { label: 'RIO', state: 'good', detail: 'Connected' },
    battery: { value: '12.4V', min: '12.4', tone: 'normal', action: '', detail: 'Stable' },
    bwu: { value: '4.8 Mbps', tx: '1.9', rx: '2.9' },
    trip: '7 ms',
    pkts: '1',
    blockingText: '',
    secondaryText: '',
    ...overrides,
  };
}

function createHookState(overrides = {}) {
  const replay = {
    isReplayMode: false,
    isPlaying: false,
    currentTimeMs: 0,
    durationMs: 0,
    eventCount: 0,
    speed: 1,
    speedOptions: [0.5, 1, 2, 4],
    fileName: '',
    error: '',
    loadReplayFile: vi.fn().mockResolvedValue(true),
    pauseReplay: vi.fn(),
    resumeReplay: vi.fn(),
    restartReplay: vi.fn(),
    clearReplay: vi.fn(),
    setReplaySpeed: vi.fn(),
  };

  const nextReplay = {
    ...replay,
    ...(overrides.replay || {}),
  };

  return {
    alliancePanels: [
      { alliance: 'red', title: 'Red Alliance', rows: [createRow()] },
      { alliance: 'blue', title: 'Blue Alliance', rows: [createRow({ team: '1114' })] },
    ],
    matchStatus: {
      matchNumber: 42,
      matchStateMessage: 'Teleop',
    },
    scheduleStatus: 'On schedule',
    sourceMode: 'live',
    error: '',
    ...overrides,
    replay: nextReplay,
  };
}

function renderFieldMonitor(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <FieldMonitor />
    </MemoryRouter>
  );
}

describe('FieldMonitor', () => {
  beforeEach(() => {
    mockUseFieldMonitorLiveData.mockReturnValue(createHookState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main top bar and forwards mirrorLayout from the query string', () => {
    renderFieldMonitor('/?mirror=true');

    expect(screen.getByText('Match Number')).toBeInTheDocument();
    expect(screen.getByText('M42')).toBeInTheDocument();
    expect(screen.getByText('Schedule Status')).toBeInTheDocument();
    expect(screen.getByText('254')).toBeInTheDocument();
    expect(screen.getByText('1114')).toBeInTheDocument();
    expect(mockUseFieldMonitorLiveData).toHaveBeenCalledWith({ mirrorLayout: true });
  });

  it('opens the replay file picker with Alt+L unless the event originates from an editable element', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    renderFieldMonitor('/');

    fireEvent.keyDown(window, { altKey: true, code: 'KeyL' });
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const externalInput = document.createElement('input');
    document.body.appendChild(externalInput);

    fireEvent.keyDown(externalInput, { altKey: true, code: 'KeyL', bubbles: true });
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('passes loaded replay files through to the hook', async () => {
    const loadReplayFile = vi.fn().mockResolvedValue(true);
    mockUseFieldMonitorLiveData.mockReturnValue(
      createHookState({
        replay: {
          loadReplayFile,
        },
      })
    );

    const { container } = renderFieldMonitor('/');
    const fileInput = container.querySelector('input[type="file"]');
    const replayFile = new File(['{}'], 'replay.json', { type: 'application/json' });

    fireEvent.change(fileInput, {
      target: { files: [replayFile] },
    });

    await waitFor(() => {
      expect(loadReplayFile).toHaveBeenCalledWith(replayFile);
    });
  });

  it('shows replay controls and routes overlay actions through the hook', async () => {
    const user = userEvent.setup();
    const pauseReplay = vi.fn();
    const restartReplay = vi.fn();
    const clearReplay = vi.fn();
    const setReplaySpeed = vi.fn();

    mockUseFieldMonitorLiveData.mockReturnValue(
      createHookState({
        sourceMode: 'replay',
        replay: {
          isReplayMode: true,
          isPlaying: true,
          currentTimeMs: 2000,
          durationMs: 4000,
          eventCount: 3,
          fileName: 'qm42.json',
          pauseReplay,
          restartReplay,
          clearReplay,
          setReplaySpeed,
        },
      })
    );

    renderFieldMonitor('/');

    expect(screen.getByText('Replay active')).toBeInTheDocument();
    expect(screen.getByText('qm42.json')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('button', { name: 'Restart' }));
    await user.click(screen.getByRole('button', { name: 'Return to live' }));
    await user.selectOptions(screen.getByRole('combobox'), '2');

    expect(pauseReplay).toHaveBeenCalledTimes(1);
    expect(restartReplay).toHaveBeenCalledTimes(1);
    expect(clearReplay).toHaveBeenCalledTimes(1);
    expect(setReplaySpeed).toHaveBeenCalledWith(2);
  });

  it('adds bottom padding to the main content and constrains the replay overlay when replay is visible', () => {
    mockUseFieldMonitorLiveData.mockReturnValue(
      createHookState({
        sourceMode: 'replay',
        replay: {
          isReplayMode: true,
          fileName: 'qm42.json',
        },
      })
    );

    renderFieldMonitor('/');

    expect(screen.getByTestId('field-monitor-content')).toHaveClass('pb-40', 'sm:pb-32');
    expect(screen.getByTestId('replay-overlay-panel')).toHaveClass(
      'max-h-[45vh]',
      'overflow-y-auto',
      'md:max-h-none',
      'md:overflow-visible'
    );
  });

  it('keeps the row internals configured for stacked mobile layouts', () => {
    renderFieldMonitor('/');

    const [connectionLayout] = screen.getAllByTestId('connection-layout');
    const [metricsGrid] = screen.getAllByTestId('row-metrics-grid');

    expect(connectionLayout).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)]'
    );
    expect(metricsGrid).toHaveClass(
      'grid-cols-2',
      '[@media(min-width:440px)]:grid-cols-3'
    );
  });

  it('adds short-height desktop guards so connection tiles keep enough room for icons', () => {
    renderFieldMonitor('/');

    const [connectionLayout] = screen.getAllByTestId('connection-layout');
    const connectionSection = connectionLayout.parentElement;
    const rowCard = connectionSection?.parentElement;

    expect(connectionLayout).toHaveClass(
      '[@media(min-width:900px)_and_(max-height:860px)]:gap-1.5',
      '[@media(min-width:900px)_and_(max-height:720px)]:gap-1'
    );
    expect(connectionSection).toHaveClass(
      '[@media(min-width:900px)_and_(max-height:860px)]:min-h-[124px]',
      '[@media(min-width:900px)_and_(max-height:720px)]:min-h-[112px]'
    );
    expect(rowCard).toHaveClass(
      '[@media(min-width:900px)_and_(max-height:860px)]:min-h-[224px]',
      '[@media(min-width:900px)_and_(max-height:720px)]:min-h-[208px]'
    );
  });

  it('allows replay load errors to be dismissed locally', async () => {
    const user = userEvent.setup();

    mockUseFieldMonitorLiveData.mockReturnValue(
      createHookState({
        replay: {
          error: 'Replay file is invalid.',
        },
      })
    );

    renderFieldMonitor('/');

    expect(screen.getByText('Replay load failed')).toBeInTheDocument();
    expect(screen.getByText('Replay file is invalid.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByText('Replay load failed')).not.toBeInTheDocument();
    expect(screen.queryByText('Replay file is invalid.')).not.toBeInTheDocument();
  });
});
