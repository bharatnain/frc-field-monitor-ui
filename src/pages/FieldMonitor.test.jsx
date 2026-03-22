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
    radio: { label: 'Radio', state: 'good', detail: '4 bars', bars: 4, connectedToAp: true, linkActive: true },
    rio: { label: 'RIO', state: 'good', detail: 'Connected' },
    battery: { value: '12.4V', min: '12.4', tone: 'normal', action: '', detail: 'Stable' },
    bwu: { value: '4.8 Mbps', tx: '1.9', rx: '2.9' },
    trip: '7 ms',
    pkts: '1',
    blockingText: '',
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
      { alliance: 'blue', title: 'Blue Alliance', rows: [createRow({ team: '1114' })] },
      { alliance: 'red', title: 'Red Alliance', rows: [createRow()] },
    ],
    matchStatus: {
      matchNumber: 42,
      matchStateMessage: 'Teleop',
    },
    scheduleStatus: 'On schedule',
    cycleCadence: {
      lastCycleMs: null,
      currentCycleMs: null,
      lastCycleLabel: '',
      currentCycleLabel: '',
      summary: 'Waiting for next start',
      isKnown: false,
      isCurrentCycleActive: false,
      currentAnchorMatch: '',
      currentAnchorMatchNumber: 0,
      currentAnchorPlayNumber: 0,
    },
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
  const originalVisualViewport = window.visualViewport;

  beforeEach(() => {
    mockUseFieldMonitorLiveData.mockReturnValue(createHookState());
  });

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      writable: true,
      value: originalVisualViewport,
    });
  });

  it('renders the main top bar and forwards mirrorLayout from the query string', () => {
    renderFieldMonitor('/?mirror=true');

    expect(screen.getByText('Match Number')).toBeInTheDocument();
    expect(screen.getByText('M42')).toBeInTheDocument();
    expect(screen.getAllByText('Schedule Status')).toHaveLength(2);
    expect(screen.getAllByText('Cycle')).toHaveLength(2);
    expect(screen.getAllByText('Waiting for next start')).toHaveLength(2);
    expect(screen.getByText('254')).toBeInTheDocument();
    expect(screen.getByText('1114')).toBeInTheDocument();
    expect(mockUseFieldMonitorLiveData).toHaveBeenCalledWith({ mirrorLayout: true });
  });

  it('sizes the shell to the visible viewport and updates when that viewport changes', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      writable: true,
      value: {
        height: 700,
        addEventListener,
        removeEventListener,
      },
    });

    const { container, unmount } = renderFieldMonitor('/');
    const shell = container.firstChild;

    expect(shell).toHaveStyle({ minHeight: '700px', height: '700px' });
    expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      writable: true,
      value: {
        height: 640,
        addEventListener,
        removeEventListener,
      },
    });

    fireEvent(window, new Event('resize'));

    expect(shell).toHaveStyle({ minHeight: '640px', height: '640px' });

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
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

    expect(screen.getByTestId('field-monitor-content')).toHaveClass(
      'pb-[calc(8rem+env(safe-area-inset-bottom))]',
      'sm:pb-32'
    );
    expect(screen.getByTestId('replay-overlay-panel')).toHaveClass(
      'max-h-[45vh]',
      'overflow-y-auto',
      'px-3',
      'py-2.5',
      'sm:px-4',
      'sm:py-3',
      'md:max-h-none',
      'md:overflow-visible'
    );
  });

  it('uses a compact mobile top bar and row layout before desktop breakpoints', () => {
    const { container } = renderFieldMonitor('/');

    const [connectionLayout] = screen.getAllByTestId('connection-layout');
    const [mobileConnectionLayout] = screen.getAllByTestId('mobile-connection-layout');
    const mobileConnectionChips = screen.getAllByTestId('mobile-connection-chip');
    const mobileSummaries = screen.getAllByTestId('mobile-row-summary');
    const [metricsGrid] = screen.getAllByTestId('row-metrics-grid');
    const topBar = screen.getByTestId('field-monitor-topbar');
    const [rowHeader] = screen.getAllByTestId('row-header');
    const [rowHeaderPrimary] = screen.getAllByTestId('row-header-primary');
    const [mobileFooterSummary] = screen.getAllByTestId('mobile-footer-summary');
    const firstRowCard = container.querySelector('[data-testid="connection-layout"]')?.closest('.relative');
    const footerGrid = metricsGrid.parentElement;

    expect(mobileConnectionLayout).toHaveClass(
      'grid-cols-[minmax(0,1fr)_10px_minmax(0,1fr)_10px_minmax(0,1fr)]',
      '[@media(max-width:380px)]:grid-cols-[minmax(0,1fr)_8px_minmax(0,1fr)_8px_minmax(0,1fr)]',
      'sm:hidden'
    );
    expect(mobileConnectionChips).toHaveLength(6);
    expect(connectionLayout).toHaveClass(
      'hidden',
      'sm:grid',
      'grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)_22px_minmax(0,1fr)]'
    );
    expect(topBar).toHaveClass('px-3', 'py-1.5', '[@media(max-width:380px)]:px-2', '[@media(max-width:380px)]:py-1.5');
    expect(topBar.lastElementChild).toHaveClass('mt-1', 'border-t', 'border-zinc-100', 'pt-1', 'sm:hidden');
    expect(rowHeader).toHaveClass('flex-nowrap', 'sm:flex-wrap');
    expect(rowHeaderPrimary).toHaveClass('flex-1', 'flex-nowrap', 'sm:flex-wrap');
    expect(firstRowCard).toHaveClass(
      'min-h-0',
      'content-start',
      'grid-rows-[auto_auto_auto]',
      'sm:grid-rows-[auto_minmax(0,1fr)_auto]',
      'sm:min-h-[220px]',
      'sm:content-stretch'
    );
    expect(rowHeader).toHaveClass('pt-1', 'min-[381px]:max-sm:pt-0.5', '[@media(max-width:380px)]:pt-0.5');
    expect(mobileConnectionLayout).toHaveClass('min-[381px]:max-sm:gap-0.5', '[@media(max-width:380px)]:pb-0');
    expect(mobileFooterSummary).toHaveClass(
      'grid-cols-[minmax(0,1fr)_10px_minmax(0,1fr)_10px_minmax(0,1fr)]',
      '[@media(max-width:380px)]:grid-cols-[minmax(0,1fr)_8px_minmax(0,1fr)_8px_minmax(0,1fr)]',
      'min-[381px]:max-sm:gap-px',
      'min-[381px]:max-sm:py-px'
    );
    expect(mobileSummaries).toHaveLength(2);
    expect(footerGrid).toHaveClass(
      'hidden',
      'sm:grid',
      'sm:grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)_22px_minmax(0,1fr)]'
    );
    expect(metricsGrid).toHaveClass(
      'grid-cols-2',
      'sm:col-[3/6]',
      '[@media(min-width:440px)]:grid-cols-3'
    );
  });

  it('stretches desktop alliance panels and row cards to fill the available column height', () => {
    const { container } = renderFieldMonitor('/');
    const [panelGrid] = screen.getAllByTestId('alliance-panel-grid');
    const firstRowCard = container.querySelector('[data-testid="connection-layout"]')?.closest('.relative');

    expect(panelGrid).toHaveClass('[@media(min-width:1200px)]:h-full', '[@media(min-width:1200px)]:grid-rows-3');
    expect(firstRowCard).toHaveClass('[@media(min-width:1200px)]:h-full');
  });

  it('keeps the whitespace-only compaction scoped to mobile framing and chrome', () => {
    const { container } = renderFieldMonitor('/');
    const [panelGrid] = screen.getAllByTestId('alliance-panel-grid');
    const firstPanel = panelGrid.parentElement;
    const firstRowCard = container.querySelector('[data-testid="connection-layout"]')?.closest('.relative');

    expect(firstPanel).toHaveClass('p-[3px]', '[@media(max-width:380px)]:p-[2px]');
    expect(panelGrid).toHaveClass('gap-1', 'p-1', '[@media(max-width:380px)]:gap-0.5', '[@media(max-width:380px)]:p-0.5');
    expect(firstRowCard).toHaveClass('rounded-[16px]', '[@media(max-width:380px)]:rounded-[16px]', 'sm:rounded-[18px]');
  });

  it('keeps desktop fill while making short-height guards compress inside the card', () => {
    renderFieldMonitor('/');

    const [connectionLayout] = screen.getAllByTestId('connection-layout');
    const [metricsGrid] = screen.getAllByTestId('row-metrics-grid');
    const connectionSection = connectionLayout.parentElement;
    const rowCard = connectionSection?.parentElement;
    const footerGrid = metricsGrid.parentElement;

    expect(connectionLayout).toHaveClass(
      '[@media(min-width:1200px)_and_(max-height:860px)]:gap-1.5',
      '[@media(min-width:1200px)_and_(max-height:720px)]:gap-1'
    );
    expect(connectionSection).not.toHaveClass(
      '[@media(min-width:1200px)_and_(max-height:860px)]:min-h-[94px]',
      '[@media(min-width:1200px)_and_(max-height:720px)]:min-h-[78px]'
    );
    expect(rowCard).toHaveClass(
      '[@media(min-width:1200px)_and_(max-height:860px)]:min-h-[172px]',
      '[@media(min-width:1200px)_and_(max-height:720px)]:min-h-[148px]',
      '[@media(min-width:1200px)]:grid-rows-[auto_minmax(0,1fr)_minmax(64px,auto)]',
      '[@media(min-width:1200px)_and_(max-height:860px)]:grid-rows-[auto_minmax(0,1fr)_minmax(52px,auto)]',
      '[@media(min-width:1200px)_and_(max-height:720px)]:grid-rows-[auto_minmax(0,1fr)_minmax(44px,auto)]'
    );
    expect(footerGrid).toHaveClass(
      'sm:min-h-[64px]',
      '[@media(min-width:1200px)_and_(max-height:860px)]:sm:min-h-[48px]',
      '[@media(min-width:1200px)_and_(max-height:720px)]:sm:min-h-[40px]'
    );
  });

  it('keeps the issue band flush with the top edge of non-normal rows', () => {
    mockUseFieldMonitorLiveData.mockReturnValue(
      createHookState({
        alliancePanels: [
          { alliance: 'red', title: 'Red Alliance', rows: [createRow({ mode: 'blocking' })] },
          { alliance: 'blue', title: 'Blue Alliance', rows: [createRow({ team: '1114' })] },
        ],
      })
    );

    renderFieldMonitor('/');

    const issueBand = screen.getByTestId('issue-band');
    expect(issueBand).toHaveClass(
      'inset-x-0',
      'top-0',
      'h-1',
      'rounded-t-[16px]',
      '[@media(max-width:380px)]:rounded-t-[16px]',
      'sm:h-1.5',
      'sm:rounded-t-[18px]'
    );
  });

  it('keeps issue rows from using the extra healthy-row mobile compaction classes', () => {
    mockUseFieldMonitorLiveData.mockReturnValue(
      createHookState({
        alliancePanels: [
          { alliance: 'red', title: 'Red Alliance', rows: [createRow({ mode: 'critical' })] },
          { alliance: 'blue', title: 'Blue Alliance', rows: [createRow({ team: '1114' })] },
        ],
      })
    );

    const { container } = renderFieldMonitor('/');
    const rowCard = container.querySelector('[data-testid="connection-layout"]')?.closest('.relative');
    const [rowHeader] = screen.getAllByTestId('row-header');
    const [mobileConnectionLayout] = screen.getAllByTestId('mobile-connection-layout');
    const [mobileFooterSummary] = screen.getAllByTestId('mobile-footer-summary');

    expect(rowCard).toHaveClass('min-h-0', 'content-start');
    expect(rowHeader).not.toHaveClass('min-[381px]:max-sm:pt-0.5');
    expect(rowHeader).toHaveClass('pt-1');
    expect(mobileConnectionLayout).not.toHaveClass('min-[381px]:max-sm:gap-0.5');
    expect(mobileConnectionLayout).toHaveClass('pb-0');
    expect(mobileFooterSummary).not.toHaveClass('min-[381px]:max-sm:py-0.5');
    expect(mobileFooterSummary).toHaveClass('py-px');
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
