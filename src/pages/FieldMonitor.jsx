import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TeamStatusCard from '../components/TeamStatusCard';
import { useFieldMonitorLiveData } from '../lib/fieldMonitorLive';

const panelTheme = (alliance) =>
  alliance === 'red'
    ? {
        backplate: 'bg-white',
        panelGlow: 'ring-[4px] ring-red-500 shadow-[0_0_0_1px_rgba(255,255,255,0.7),0_0_32px_rgba(239,68,68,0.18)]',
      }
    : {
        backplate: 'bg-white',
        panelGlow: 'ring-[4px] ring-blue-500 shadow-[0_0_0_1px_rgba(255,255,255,0.7),0_0_32px_rgba(59,130,246,0.18)]',
      };

const formatReplayClock = (ms = 0) => {
  const totalTenths = Math.max(0, Math.round(ms / 100));
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`;
};

const isEditableTarget = (target) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const editableRoot = target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]');
  return Boolean(editableRoot);
};

function TopBarStat({ label, value, align = 'left', className = '', valueClassName = '', wrapValue = false }) {
  const textAlignmentClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start';

  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${textAlignmentClass} ${className}`}>
      <div className="min-w-0 text-[8px] font-semibold uppercase leading-none tracking-[0.12em] text-zinc-500 [@media(max-width:380px)]:text-[7px] sm:text-[9px] [@media(min-width:1024px)_and_(max-height:860px)]:text-[8px] [@media(min-width:1024px)_and_(max-height:720px)]:text-[7px]">
        {label}
      </div>
      <div
        className={`min-w-0 ${wrapValue ? 'whitespace-normal leading-tight' : 'truncate'} text-[12px] font-bold tracking-[-0.02em] text-zinc-900 [@media(max-width:380px)]:text-[11px] sm:text-[15px] sm:leading-none [@media(min-width:1024px)_and_(max-height:860px)]:text-[13px] [@media(min-width:1024px)_and_(max-height:720px)]:text-[11px] ${valueClassName}`}
      >
        {value}
      </div>
    </div>
  );
}

export default function FieldMonitor() {
  const [searchParams] = useSearchParams();
  const mirrorLayout = searchParams.get('mirror') === 'true';
  const replayFileInputRef = useRef(null);
  const [isReplayErrorDismissed, setIsReplayErrorDismissed] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === 'undefined' ? null : window.visualViewport?.height ?? window.innerHeight
  );
  const { alliancePanels: distancePanels, matchStatus, scheduleStatus, cycleCadence, sourceMode, replay, error } =
    useFieldMonitorLiveData({
      mirrorLayout,
    });
  const replayError = replay.error || (sourceMode === 'replay' ? error : '');
  const showReplayError = Boolean(replayError) && !isReplayErrorDismissed;
  const showReplayOverlay = sourceMode === 'replay' || showReplayError;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!event.altKey || event.code !== 'KeyL' || event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();
      setIsReplayErrorDismissed(false);
      replayFileInputRef.current?.click();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const updateViewportHeight = () => {
      setViewportHeight(window.visualViewport?.height ?? window.innerHeight);
    };

    updateViewportHeight();

    window.addEventListener('resize', updateViewportHeight);
    window.visualViewport?.addEventListener('resize', updateViewportHeight);

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.visualViewport?.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  return (
    <div
      className="relative flex min-h-screen flex-col bg-zinc-100 text-zinc-900"
      style={
        viewportHeight === null
          ? undefined
          : {
              minHeight: `${viewportHeight}px`,
              height: `${viewportHeight}px`,
            }
      }
    >
      <input
        ref={replayFileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          setIsReplayErrorDismissed(false);
          if (file) {
            await replay.loadReplayFile(file);
          }
          event.target.value = '';
        }}
      />

      <div className="shrink-0 px-3 pb-1 pt-2 lg:px-4 lg:pb-1.5 lg:pt-2.5 [@media(min-width:1024px)_and_(max-height:860px)]:px-2.5 [@media(min-width:1024px)_and_(max-height:860px)]:pt-1.5 [@media(min-width:1024px)_and_(max-height:720px)]:px-2 [@media(min-width:1024px)_and_(max-height:720px)]:pt-1">
        <div
          data-testid="field-monitor-topbar"
          className="rounded-[22px] bg-white px-3 py-1.5 shadow-sm ring-1 ring-zinc-200 [@media(max-width:380px)]:px-2 [@media(max-width:380px)]:py-1.5 lg:px-4 lg:py-2 [@media(min-width:1024px)_and_(max-height:860px)]:px-2.5 [@media(min-width:1024px)_and_(max-height:860px)]:py-1 [@media(min-width:1024px)_and_(max-height:720px)]:px-2 [@media(min-width:1024px)_and_(max-height:720px)]:py-0.5"
        >
          <div className="flex items-start justify-between gap-2.5 [@media(max-width:380px)]:gap-2 sm:grid sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)_minmax(0,0.85fr)] sm:items-end sm:gap-3">
            <TopBarStat
              label="Match Number"
              value={matchStatus.matchNumber > 0 ? `M${matchStatus.matchNumber}` : 'No match yet'}
              className="flex-1 sm:flex-none"
            />
            <TopBarStat
              label="Match Status"
              value={matchStatus.matchStateMessage}
              align="right"
              className="max-w-[56%] flex-1 sm:max-w-none sm:flex-none sm:items-center sm:text-center"
              valueClassName="text-[11px] [@media(max-width:380px)]:text-[10px] sm:text-[14px] [@media(min-width:1024px)_and_(max-height:860px)]:text-[12px] [@media(min-width:1024px)_and_(max-height:720px)]:text-[10px]"
              wrapValue
            />
            <div className="hidden min-w-0 sm:flex sm:min-w-0 sm:items-start sm:justify-end sm:gap-3">
              <TopBarStat
                label="Schedule Status"
                value={scheduleStatus}
                align="right"
                className="min-w-0 flex-1"
                valueClassName="text-[10px] [@media(max-width:380px)]:text-[9px] sm:text-[13px] [@media(min-width:1024px)_and_(max-height:860px)]:text-[11px] [@media(min-width:1024px)_and_(max-height:720px)]:text-[10px]"
              />
              <TopBarStat
                label="Cycle"
                value={cycleCadence.summary}
                align="right"
                className="min-w-0 flex-1"
                valueClassName="text-[9px] [@media(max-width:380px)]:text-[8px] sm:text-[12px] [@media(min-width:1024px)_and_(max-height:860px)]:text-[11px] [@media(min-width:1024px)_and_(max-height:720px)]:text-[9px]"
              />
            </div>
          </div>
          <div className="mt-1.5 border-t border-zinc-100 pt-1.5 sm:hidden">
            <TopBarStat
              label="Schedule Status"
              value={scheduleStatus}
              className="min-w-0"
              valueClassName="text-[11px] [@media(max-width:380px)]:text-[10px] sm:text-[14px] [@media(min-width:1024px)_and_(max-height:860px)]:text-[12px] [@media(min-width:1024px)_and_(max-height:720px)]:text-[10px]"
              wrapValue
            />
          </div>
        </div>
      </div>

      <div
        data-testid="field-monitor-content"
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row ${
          showReplayOverlay ? 'pb-[calc(8rem+env(safe-area-inset-bottom))] sm:pb-32' : ''
        }`}
      >
        {distancePanels.map((panel) => {
          const theme = panelTheme(panel.alliance);
          return (
            <div
              key={`distance-${panel.alliance}`}
              className="relative flex w-full min-w-0 flex-none p-[3px] [@media(max-width:380px)]:p-[2px] lg:flex-1 [@media(min-width:1024px)_and_(max-height:860px)]:p-1 [@media(min-width:1024px)_and_(max-height:720px)]:p-0.5"
            >
              <div
                className={`pointer-events-none absolute inset-[3px] rounded-[20px] [@media(max-width:380px)]:inset-[2px] [@media(max-width:380px)]:rounded-[18px] sm:inset-1.5 sm:rounded-[28px] ${theme.backplate} ${theme.panelGlow}`}
              />
              <div
                data-testid="alliance-panel-grid"
                className="grid min-h-0 flex-1 auto-rows-max gap-1 p-1 [@media(max-width:380px)]:gap-0.5 [@media(max-width:380px)]:p-0.5 sm:gap-2 sm:p-2.5 lg:h-full lg:grid-rows-3 [@media(min-width:1024px)_and_(max-height:860px)]:gap-2 [@media(min-width:1024px)_and_(max-height:860px)]:p-2 [@media(min-width:1024px)_and_(max-height:720px)]:gap-1.5 [@media(min-width:1024px)_and_(max-height:720px)]:p-1.5"
              >
                {panel.rows.map((row) => (
                  <TeamStatusCard
                    key={`distance-${panel.alliance}-${row.team}-${row.station}`}
                    alliance={panel.alliance}
                    row={row}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showReplayOverlay ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div
            data-testid="replay-overlay-panel"
            className="pointer-events-auto max-h-[45vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/20 bg-zinc-950/72 px-3 py-2.5 text-white shadow-2xl backdrop-blur-md sm:px-4 sm:py-3 md:max-h-none md:overflow-visible"
            style={{ backgroundColor: 'rgba(24, 24, 27, 0.92)' }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${
                      sourceMode === 'replay'
                        ? 'bg-blue-500/20 text-blue-100 ring-1 ring-blue-300/30'
                        : 'bg-amber-500/20 text-amber-50 ring-1 ring-amber-300/30'
                    }`}
                  >
                    {sourceMode === 'replay' ? 'Replay active' : 'Replay load failed'}
                  </span>
                  {replay.fileName ? (
                    <span className="truncate text-sm font-semibold text-white/90">{replay.fileName}</span>
                  ) : (
                    <span className="text-sm text-white/70">Press Alt+L to load replay JSON</span>
                  )}
                </div>
                <div className="mt-1 text-sm text-white/75">
                  {showReplayError ? (
                    <span aria-live="polite">{replayError}</span>
                  ) : (
                    <>
                      Replay time {formatReplayClock(replay.currentTimeMs)} /{' '}
                      {formatReplayClock(replay.durationMs)} with {replay.eventCount} events
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {sourceMode === 'replay' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => (replay.isPlaying ? replay.pauseReplay() : replay.resumeReplay())}
                      className="rounded-xl bg-white/14 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/22"
                    >
                      {replay.isPlaying ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      type="button"
                      onClick={() => replay.restartReplay()}
                      className="rounded-xl bg-white/14 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/22"
                    >
                      Restart
                    </button>
                    <label className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white/85">
                      <span className="font-semibold">Speed</span>
                      <select
                        value={String(replay.speed)}
                        onChange={(event) => replay.setReplaySpeed(Number(event.target.value))}
                        className="rounded-lg border border-white/15 bg-zinc-900/70 px-2 py-1 text-sm text-white outline-none"
                      >
                        {replay.speedOptions.map((speed) => (
                          <option key={speed} value={speed}>
                            {speed}x
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => replay.clearReplay()}
                      className="rounded-xl bg-blue-500/85 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
                    >
                      Return to live
                    </button>
                  </>
                ) : null}

                {showReplayError ? (
                  <button
                    type="button"
                    onClick={() => setIsReplayErrorDismissed(true)}
                    className="rounded-xl bg-white/14 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/22"
                  >
                    Dismiss
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
