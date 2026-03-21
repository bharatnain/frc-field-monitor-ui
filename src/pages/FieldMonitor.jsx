import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSearchParams } from 'react-router-dom';
import {
  faTriangleExclamation,
  faGamepad,
  faTowerBroadcast,
  faMicrochip,
  faBatteryHalf,
  faRightLeft,
  faRoute,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useFieldMonitorLiveData } from '../lib/fieldMonitorLive';

const panelTheme = (alliance) =>
  alliance === 'red'
    ? {
        backplate: 'bg-white',
        gutter:
          'bg-gradient-to-b from-red-800 via-red-600 to-red-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4),0_0_30px_rgba(239,68,68,0.28)]',
        panelGlow: '',
        stationBadge: 'bg-white text-zinc-700 ring-zinc-300',
        stateDanger: 'bg-rose-600 text-white ring-rose-800 shadow-sm',
        stateWarn: 'bg-amber-100 text-amber-950 ring-amber-300',
        stateAuto: 'bg-violet-50 text-violet-800 ring-violet-200',
        stateTele: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
      }
    : {
        backplate: 'bg-white',
        gutter:
          'bg-gradient-to-b from-blue-800 via-blue-600 to-blue-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4),0_0_30px_rgba(59,130,246,0.28)]',
        panelGlow: '',
        stationBadge: 'bg-white text-zinc-700 ring-zinc-300',
        stateDanger: 'bg-rose-600 text-white ring-rose-800 shadow-sm',
        stateWarn: 'bg-amber-100 text-amber-950 ring-amber-300',
        stateAuto: 'bg-violet-50 text-violet-800 ring-violet-200',
        stateTele: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
      };

const issueLabel = (mode) => {
  if (mode === 'estopped') return 'E-STOP';
  if (mode === 'bypassed') return 'BYPASS';
  if (mode === 'astopped') return 'A-STOP';
  if (mode === 'critical') return 'CRITICAL';
  if (mode === 'degraded') return 'WARN';
  return '';
};

const isEmergencyStopMode = (mode) => mode === 'estopped' || mode === 'bypassed';
const isAStopMode = (mode) => mode === 'astopped';

const stateTone = (status, theme) => {
  if (status?.tone === 'danger') return theme.stateDanger;
  if (status?.tone === 'warn') return theme.stateWarn;
  if (status?.tone === 'auto') return theme.stateAuto;
  return theme.stateTele;
};

const batteryToneClass = (battery, isAStop) => {
  if (battery?.tone === 'critical') {
    return 'bg-amber-50 ring-2 ring-amber-400';
  }

  if (battery?.tone === 'warn' || isAStop) {
    return 'bg-amber-50 ring-2 ring-amber-300';
  }

  return 'bg-white/80';
};

const batteryActionClass = (battery) => {
  if (battery?.tone === 'critical') {
    return 'bg-amber-600 text-white ring-1 ring-amber-700';
  }

  if (battery?.tone === 'warn') {
    return 'bg-amber-100 text-amber-950 ring-1 ring-amber-400';
  }

  return 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-300';
};

const stateLabel = (status) => status?.shortLabel || status?.label || '';

const barCountFromDetail = (detail) => {
  if (detail.includes('4')) return 4;
  if (detail.includes('3')) return 3;
  if (detail.includes('2')) return 2;
  if (detail.includes('1')) return 1;
  return 0;
};

const connectionTheme = (state) => {
  if (state === 'bad') {
    return {
      tile: 'bg-zinc-900 text-white ring-[4px] ring-amber-700',
      label: 'text-white/70',
      accent: 'text-white',
      iconShell: 'border-white/40 bg-white/10',
      boardShell: 'border-white/30 bg-white/10',
      caption: 'text-white/75',
      chevron: 'text-amber-300',
      emptyBar: 'bg-white/20',
      filledBar: 'bg-white',
    };
  }

  if (state === 'warn') {
    return {
      tile: 'bg-amber-200 text-zinc-950 ring-[3px] ring-amber-600',
      label: 'text-amber-950/80',
      accent: 'text-zinc-950',
      iconShell: 'border-amber-700 bg-amber-50',
      boardShell: 'border-amber-700 bg-amber-50',
      caption: 'text-amber-900',
      chevron: 'text-amber-700',
      emptyBar: 'bg-amber-300',
      filledBar: 'bg-zinc-900',
    };
  }

  return {
    tile: 'bg-white text-zinc-900 ring-2 ring-zinc-300',
    label: 'text-zinc-500',
    accent: 'text-zinc-900',
    iconShell: 'border-zinc-300 bg-zinc-50',
    boardShell: 'border-zinc-300 bg-zinc-50',
    caption: 'text-zinc-500',
    chevron: 'text-zinc-300',
    emptyBar: 'bg-zinc-200',
    filledBar: 'bg-zinc-900',
  };
};

const deviceStatusText = (kind, state) => {
  if (state === 'bad') return 'OUT';
  if (state === 'warn') return kind === 'radio' ? 'LOW' : 'WARN';
  if (kind === 'ds') return 'LINK';
  if (kind === 'rio') return 'ONLINE';
  return 'GOOD';
};

const deviceStatusIcon = (state) => {
  if (state === 'bad') return faXmark;
  if (state === 'warn') return faTriangleExclamation;
  return null;
};

function SignalBars({ detail, state = 'good', hero = false }) {
  const count = barCountFromDetail(detail);
  const theme = connectionTheme(state);
  if (count === 0) {
    return (
      <span className={`font-extrabold tracking-wide ${hero ? 'text-[32px]' : 'text-[28px]'}`}>
        OUT
      </span>
    );
  }
  const heights = hero ? ['32%', '54%', '76%', '100%'] : ['25%', '50%', '75%', '100%'];
  return (
    <span className={`inline-flex items-end justify-center ${hero ? 'h-11 gap-1.5' : 'h-10 gap-1.5'}`}>
      {heights.map((h, i) => (
        <span
          key={i}
          className={`rounded-sm ${hero ? 'w-4' : 'w-3'} ${
            i < count ? theme.filledBar : theme.emptyBar
          }`}
          style={{ height: h }}
        />
      ))}
    </span>
  );
}

function DeviceStatusBadge({ state, text }) {
  const icon = deviceStatusIcon(state);
  const badgeClass =
    state === 'bad'
      ? 'bg-amber-600 text-white ring-2 ring-amber-700'
      : state === 'warn'
        ? 'bg-amber-100 text-amber-950 ring-2 ring-amber-500'
        : 'bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200';

  return (
    <div
      className={`inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-black uppercase tracking-[0.14em] ${badgeClass}`}
    >
      {icon && <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />}
      <span>{text}</span>
    </div>
  );
}

function DsDeviceGlyph({ theme }) {
  return (
    <div className="relative flex h-[70px] w-[70px] items-center justify-center">
      <div className={`absolute inset-0 rounded-full border-[4px] shadow-sm ${theme.iconShell}`} />
      <div className={`absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full ${theme.accent === 'text-white' ? 'bg-white/10' : 'bg-zinc-900/5'}`} />
      <FontAwesomeIcon icon={faGamepad} className="relative h-9 w-9" />
    </div>
  );
}

function RioDeviceGlyph({ theme }) {
  const pinClass = theme.accent === 'text-white' ? 'bg-white/45' : 'bg-zinc-400';

  return (
    <div className="relative flex h-[70px] w-[70px] items-center justify-center">
      <span className={`absolute left-1 top-3.5 h-1.5 w-1 rounded-full ${pinClass}`} />
      <span className={`absolute left-1 top-7.5 h-1.5 w-1 rounded-full ${pinClass}`} />
      <span className={`absolute left-1 top-11.5 h-1.5 w-1 rounded-full ${pinClass}`} />
      <span className={`absolute right-1 top-3.5 h-1.5 w-1 rounded-full ${pinClass}`} />
      <span className={`absolute right-1 top-7.5 h-1.5 w-1 rounded-full ${pinClass}`} />
      <span className={`absolute right-1 top-11.5 h-1.5 w-1 rounded-full ${pinClass}`} />
      <span className={`absolute top-1 left-3.5 h-1 w-1.5 rounded-full ${pinClass}`} />
      <span className={`absolute top-1 left-7.5 h-1 w-1.5 rounded-full ${pinClass}`} />
      <span className={`absolute top-1 left-11.5 h-1 w-1.5 rounded-full ${pinClass}`} />
      <span className={`absolute bottom-1 left-3.5 h-1 w-1.5 rounded-full ${pinClass}`} />
      <span className={`absolute bottom-1 left-7.5 h-1 w-1.5 rounded-full ${pinClass}`} />
      <span className={`absolute bottom-1 left-11.5 h-1 w-1.5 rounded-full ${pinClass}`} />

      <div className={`absolute inset-[5px] rounded-xl border-[4px] shadow-sm ${theme.boardShell}`} />
      <div className={`absolute inset-[15px] rounded-md ${theme.accent === 'text-white' ? 'bg-white/10' : 'bg-zinc-900/5'}`} />
      <FontAwesomeIcon icon={faMicrochip} className="relative h-9 w-9" />
    </div>
  );
}

function IssueBadge({ mode }) {
  if (mode === 'normal') return null;
  const isEmergencyStop = isEmergencyStopMode(mode);
  const isCritical = mode === 'critical';
  return (
    <div
      className={`rounded-md px-3 py-1 text-[14px] font-extrabold uppercase tracking-wide ${
        isEmergencyStop
          ? 'bg-rose-600 text-white ring-1 ring-rose-700'
          : isCritical
          ? 'bg-amber-600 text-white ring-1 ring-amber-700'
          : 'bg-amber-100 text-amber-950 ring-1 ring-amber-500'
      }`}
    >
      {issueLabel(mode)}
    </div>
  );
}

const issueBandClass = (mode) => {
  if (isEmergencyStopMode(mode)) return 'bg-rose-700';
  if (isAStopMode(mode)) return 'bg-amber-500';
  if (mode === 'blocking') return 'bg-amber-700';
  if (mode === 'critical') return 'bg-amber-600';
  if (mode === 'degraded') return 'bg-amber-400';
  return '';
};

const rowShellClass = (mode) => {
  if (mode === 'estopped' || mode === 'bypassed') {
    return 'bg-gradient-to-b from-white to-rose-50/45 ring-[4px] ring-rose-700 shadow-[0_10px_24px_rgba(190,24,93,0.18)]';
  }

  if (mode === 'astopped') {
    return 'bg-gradient-to-b from-white to-amber-50/55 ring-[3px] ring-amber-500 shadow-[0_8px_20px_rgba(217,119,6,0.14)]';
  }

  if (mode === 'blocking') {
    return 'bg-gradient-to-b from-white to-amber-50/50 ring-[4px] ring-amber-700 shadow-[0_10px_24px_rgba(180,83,9,0.16)]';
  }

  if (mode === 'critical') {
    return 'bg-gradient-to-b from-white to-amber-50/40 ring-[4px] ring-amber-600 shadow-[0_10px_24px_rgba(217,119,6,0.16)]';
  }

  if (mode === 'degraded') {
    return 'bg-gradient-to-b from-white to-amber-50/25 ring-[3px] ring-amber-400 shadow-[0_8px_20px_rgba(245,158,11,0.12)]';
  }

  return 'bg-gradient-to-b from-white to-zinc-50 ring-[2px] ring-zinc-300 shadow-[0_8px_18px_rgba(15,23,42,0.06)]';
};

const rowInsetClass = (mode) => {
  if (mode === 'estopped' || mode === 'bypassed') {
    return 'border-rose-100/80';
  }

  if (mode === 'astopped') {
    return 'border-amber-100/90';
  }

  if (mode === 'blocking' || mode === 'critical' || mode === 'degraded') {
    return 'border-amber-100/80';
  }

  return 'border-white/95';
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

function ConnectionTile({ kind, state, detail, label }) {
  const theme = connectionTheme(state);
  const isRadio = kind === 'radio';
  const isDS = kind === 'ds';
  const status = deviceStatusText(kind, state);

  return (
    <div className={`flex h-full min-h-0 flex-col justify-between rounded-xl px-2.5 py-2 text-center ${theme.tile}`}>
      <div className={`text-[10px] font-black uppercase tracking-[0.24em] ${theme.label}`}>
        {label}
      </div>

      {isRadio ? (
        <div className="mt-1 flex min-h-0 flex-1 flex-col items-center justify-center">
          <div className={`mb-0.5 ${theme.accent}`}>
            <FontAwesomeIcon icon={faTowerBroadcast} className="h-6 w-6" />
          </div>
          <div className={`flex min-h-0 items-center justify-center ${theme.accent}`}>
            <SignalBars detail={detail || ''} state={state} hero />
          </div>
        </div>
      ) : (
        <div className="mt-1 flex min-h-0 flex-1 flex-col items-center justify-center">
          <div className="flex h-[70px] items-center justify-center">
            {isDS ? <DsDeviceGlyph theme={theme} /> : <RioDeviceGlyph theme={theme} />}
          </div>
          <div className="mt-1">
            <DeviceStatusBadge state={state} text={status} />
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionChevron({ state = 'good' }) {
  const theme = connectionTheme(state);
  return (
    <div className="flex items-center justify-center">
      <div className={`flex w-full items-center justify-center gap-1 ${theme.chevron}`}>
        <span className={`h-1 w-3 rounded-full ${state === 'bad' ? 'bg-amber-300' : state === 'warn' ? 'bg-amber-700' : 'bg-zinc-300'}`} />
        <span className="text-[30px] font-black leading-none">&gt;</span>
      </div>
    </div>
  );
}

function TopBarItem({ label, value, align = 'left' }) {
  const alignmentClass =
    align === 'center'
      ? 'justify-center text-center'
      : align === 'right'
        ? 'justify-end text-right'
        : 'justify-start text-left';

  return (
    <div className={`flex min-w-0 items-baseline gap-2 ${alignmentClass}`}>
      <div className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </div>
      <div className="min-w-0 truncate text-[16px] font-bold leading-none text-zinc-900">{value}</div>
    </div>
  );
}

const stationNumberText = (stationLabel) => stationLabel.match(/\d+/)?.[0] || '--';

function AllianceRail({ theme, className }) {
  return (
    <div className={`pointer-events-none absolute inset-y-2.5 w-6 rounded-full ${className} ${theme.gutter}`}>
      <div className="h-full rounded-full" />
    </div>
  );
}

function StationBadge({ station, theme }) {
  const stationNumber = stationNumberText(station);

  return (
    <div
      className={`inline-flex rounded-md px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide ring-1 ${theme.stationBadge}`}
    >
      STN {stationNumber}
    </div>
  );
}

export default function FieldMonitor() {
  const [searchParams] = useSearchParams();
  const mirrorLayout = searchParams.get('mirror') === 'true';
  const replayFileInputRef = useRef(null);
  const [isReplayErrorDismissed, setIsReplayErrorDismissed] = useState(false);
  const { alliancePanels: distancePanels, matchStatus, scheduleStatus, sourceMode, replay, error } =
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

  return (
    <div className="relative flex h-dvh flex-col bg-zinc-100 text-zinc-900">
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

      <div className="shrink-0 px-3 pb-1 pt-2">
        <div className="grid gap-1.5 rounded-2xl bg-white px-3 py-1.5 shadow-sm ring-1 ring-zinc-200 md:grid-cols-3">
          <TopBarItem
            label="Match Number"
            value={matchStatus.matchNumber > 0 ? `M${matchStatus.matchNumber}` : 'No match yet'}
          />
          <TopBarItem
            label="Match Status"
            value={matchStatus.matchStateMessage}
            align="center"
          />
          <TopBarItem
            label="Schedule Status"
            value={scheduleStatus}
            align="right"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {distancePanels.map((panel, index) => {
          const theme = panelTheme(panel.alliance);
          const panelSide = index === 0 ? 'left' : 'right';
          const gutterClass = panelSide === 'left' ? 'left-1.5' : 'right-1.5';
          const panelPadding = panelSide === 'left' ? 'pl-5 pr-3' : 'pl-3 pr-5';
          return (
            <div key={`distance-${panel.alliance}`} className="relative flex min-w-0 flex-1 px-1.5 pb-1">
              <div
                className={`pointer-events-none absolute inset-1.5 rounded-[28px] ${theme.backplate} ${theme.panelGlow}`}
              />
              <AllianceRail
                theme={theme}
                className={gutterClass}
              />
              <div className={`grid min-h-0 flex-1 grid-rows-3 gap-2 pb-2 pt-3 ${panelPadding}`}>
                {panel.rows.map((row) => {
                  const isBlocking = row.mode === 'blocking';
                  const isEmergencyStop = isEmergencyStopMode(row.mode);
                  const isAStop = isAStopMode(row.mode);
                  const isCritical = row.mode === 'critical';
                  const isDegraded = row.mode === 'degraded';
                  const isBypassed = row.mode === 'bypassed';
                  const isPostMatchMuted = Boolean(row.isPostMatchMuted);

                  return (
                    <div
                      key={`distance-${panel.alliance}-${row.team}-${row.station}`}
                      className={`relative grid min-h-0 overflow-hidden rounded-2xl bg-white ${
                        isBlocking ? 'grid-rows-[auto_minmax(0,1fr)]' : 'grid-rows-[auto_minmax(0,1fr)_72px]'
                      } ${rowShellClass(row.mode)}`}
                    >
                      <div
                        className={`pointer-events-none absolute inset-[2px] rounded-[14px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ${rowInsetClass(row.mode)}`}
                      />
                      {row.mode !== 'normal' && (
                        <div className={`absolute inset-x-0 top-0 h-2 rounded-t-2xl ${issueBandClass(row.mode)}`} />
                      )}
                      <div className="flex min-h-0 items-start justify-between gap-3 px-5 pb-1 pt-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="text-[40px] font-bold leading-none tracking-tight">
                            {row.team}
                          </div>
                          <StationBadge station={row.station} theme={theme} />
                          {row.mode !== 'blocking' && <IssueBadge mode={row.mode} />}
                        </div>

                        {!isBlocking && !isBypassed && (
                          <div
                            className={`inline-flex self-center items-center justify-center rounded-md px-3 py-1 text-[14px] font-extrabold uppercase tracking-wide ring-1 ${
                              isPostMatchMuted ? 'opacity-70' : ''
                            } ${stateTone(row.status, theme)}`}
                          >
                            {stateLabel(row.status)}
                          </div>
                        )}
                      </div>

                      <div className={`min-h-0 px-5 ${isBlocking ? 'pb-3' : 'pb-1'} ${isPostMatchMuted ? 'opacity-60' : ''}`}>
                        {isBlocking ? (
                          <div className="flex h-full min-h-0 items-center justify-center">
                            <div className="flex min-h-[92px] w-full items-center justify-center rounded-xl border-[3px] border-dashed border-amber-700 bg-amber-50 px-6 py-5 text-[26px] font-bold tracking-wide text-amber-950">
                              <FontAwesomeIcon icon={faTriangleExclamation} className="mr-3 h-7 w-7 text-amber-700" />
                              {row.blockingText}
                            </div>
                          </div>
                        ) : (
                          <div className="grid h-full min-h-0 grid-cols-[1fr_28px_1fr_28px_1fr] items-stretch gap-2 pb-px">
                            <ConnectionTile
                              kind="ds"
                              label={row.ds?.label || 'DS'}
                              state={row.ds?.state || 'good'}
                              detail={row.ds?.detail || ''}
                            />
                            <ConnectionChevron state={row.ds?.state || 'good'} />
                            <ConnectionTile
                              kind="radio"
                              label={row.radio?.label || 'RADIO'}
                              state={row.radio?.state || 'good'}
                              detail={row.radio?.detail || ''}
                            />
                            <ConnectionChevron state={row.radio?.state || 'good'} />
                            <ConnectionTile
                              kind="rio"
                              label={row.rio?.label || 'RIO'}
                              state={row.rio?.state || 'good'}
                              detail={row.rio?.detail || ''}
                            />
                          </div>
                        )}
                      </div>

                      {!isBlocking && (
                        <div className={`px-5 pb-2.5 ${isPostMatchMuted ? 'opacity-70' : ''}`}>
                          <div className="grid h-[72px] grid-cols-[1fr_1.35fr] gap-2 rounded-xl bg-zinc-50/70 py-1.5">
                            <div
                              className={`rounded-xl px-2.5 py-1.5 ${batteryToneClass(row.battery, isAStop)}`}
                            >
                              <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase text-zinc-500">
                                <div className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faBatteryHalf} className="h-3 w-3" /> Battery
                                </div>
                                {row.battery?.action ? (
                                  <div
                                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] ${batteryActionClass(row.battery)}`}
                                  >
                                    {row.battery.action}
                                  </div>
                                ) : null}
                              </div>
                              <div className="mt-1 flex items-end gap-1.5">
                                <div className="text-[20px] font-bold leading-none text-zinc-900">
                                  {row.battery?.value}
                                </div>
                                <div className="text-[10px] font-semibold leading-none text-zinc-500">
                                  Min {row.battery?.min}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-1 rounded-xl bg-white/65 px-2 py-1.5">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1 text-[9px] font-bold uppercase text-zinc-500">
                                  <FontAwesomeIcon icon={faRightLeft} className="h-3 w-3" /> BW
                                </div>
                                <div className="mt-0.5 text-[13px] font-bold leading-none text-zinc-900">
                                  {row.bwu?.value}
                                </div>
                                <div className="mt-0.5 truncate text-[8px] font-semibold leading-none text-zinc-500">
                                  Tx {row.bwu?.tx} / Rx {row.bwu?.rx}
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase text-zinc-500">
                                  <FontAwesomeIcon icon={faRoute} className="h-3 w-3" /> Trip
                                </div>
                                <div className="mt-0.5 text-[13px] font-bold leading-none text-zinc-900">
                                  {row.trip}
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase text-zinc-500">
                                  <FontAwesomeIcon icon={faXmark} className="h-3 w-3" /> Loss
                                </div>
                                <div className="mt-0.5 text-[13px] font-bold leading-none text-zinc-900">
                                  {row.pkts}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showReplayOverlay ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
          <div
            className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-white/20 bg-zinc-950/72 px-4 py-3 text-white shadow-2xl backdrop-blur-md"
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
