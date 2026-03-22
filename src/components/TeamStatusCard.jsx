import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

const panelTheme = (alliance) =>
  alliance === 'red'
    ? {
        defaultRowShell:
          'bg-gradient-to-b from-white to-zinc-50 ring-[2px] ring-zinc-300 shadow-[0_8px_18px_rgba(15,23,42,0.06)]',
        defaultRowInset: 'border-white/95',
        stationBadge: 'bg-red-50 text-red-800 ring-red-200',
        stateDanger: 'bg-rose-600 text-white ring-rose-800 shadow-sm',
        stateWarn: 'bg-amber-100 text-amber-950 ring-amber-300',
        stateAuto: 'bg-violet-50 text-violet-800 ring-violet-200',
        stateTele: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
      }
    : {
        defaultRowShell:
          'bg-gradient-to-b from-white to-zinc-50 ring-[2px] ring-zinc-300 shadow-[0_8px_18px_rgba(15,23,42,0.06)]',
        defaultRowInset: 'border-white/95',
        stationBadge: 'bg-blue-50 text-blue-800 ring-blue-200',
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

const barCountFromDetail = (detail = '') => {
  if (detail.includes('4')) return 4;
  if (detail.includes('3')) return 3;
  if (detail.includes('2')) return 2;
  if (detail.includes('1')) return 1;
  return 0;
};

const connectionTheme = (state) => {
  if (state === 'bad') {
    return {
      tile: 'border-2 border-amber-700 bg-zinc-900 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]',
      label: 'text-white/70',
      accent: 'text-white',
      iconShell: 'border-white/40 bg-white/10',
      boardShell: 'border-white/30 bg-white/10',
      chevron: 'text-amber-300',
      emptyBar: 'bg-white/20',
      filledBar: 'bg-white',
    };
  }

  if (state === 'warn') {
    return {
      tile: 'border-2 border-amber-500 bg-amber-200 text-zinc-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]',
      label: 'text-amber-950/80',
      accent: 'text-zinc-950',
      iconShell: 'border-amber-700 bg-amber-50',
      boardShell: 'border-amber-700 bg-amber-50',
      chevron: 'text-amber-700',
      emptyBar: 'bg-amber-300',
      filledBar: 'bg-zinc-900',
    };
  }

  return {
    tile: 'border-2 border-zinc-300 bg-white text-zinc-900',
    label: 'text-zinc-500',
    accent: 'text-zinc-900',
    iconShell: 'border-zinc-300 bg-zinc-50',
    boardShell: 'border-zinc-300 bg-zinc-50',
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
      <span
        className={`font-extrabold tracking-wide ${
          hero ? 'text-[28px] sm:text-[30px] [@media(min-width:1200px)]:text-[32px]' : 'text-[24px] sm:text-[26px] [@media(min-width:1200px)]:text-[28px]'
        }`}
      >
        OUT
      </span>
    );
  }
  const heights = hero ? ['32%', '54%', '76%', '100%'] : ['25%', '50%', '75%', '100%'];
  return (
    <span
      className={`inline-flex items-end justify-center ${
        hero
          ? 'h-9 gap-1 sm:h-10 sm:gap-1.5 [@media(min-width:1200px)]:h-11 [@media(min-width:1200px)_and_(max-height:860px)]:h-[34px] [@media(min-width:1200px)_and_(max-height:720px)]:h-[28px]'
          : 'h-8 gap-1 sm:h-9 sm:gap-1.5 [@media(min-width:1200px)]:h-10 [@media(min-width:1200px)_and_(max-height:860px)]:h-[30px] [@media(min-width:1200px)_and_(max-height:720px)]:h-[24px]'
      }`}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={`rounded-sm ${
            hero ? 'w-3 sm:w-3.5 [@media(min-width:1200px)]:w-4' : 'w-2.5 sm:w-3'
          } ${
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
      className={`inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] sm:px-2.5 sm:text-[11px] [@media(min-width:1200px)]:text-[12px] [@media(min-width:1200px)_and_(max-height:860px)]:px-1.5 [@media(min-width:1200px)_and_(max-height:860px)]:py-0.5 [@media(min-width:1200px)_and_(max-height:860px)]:text-[10px] [@media(min-width:1200px)_and_(max-height:720px)]:px-1 [@media(min-width:1200px)_and_(max-height:720px)]:text-[9px] ${badgeClass}`}
    >
      {icon && <FontAwesomeIcon icon={icon} className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
      <span>{text}</span>
    </div>
  );
}

function DsDeviceGlyph({ theme }) {
  return (
    <div className="relative flex h-[70px] w-[70px] origin-center items-center justify-center [@media(min-width:1200px)_and_(max-height:860px)]:scale-[0.76] [@media(min-width:1200px)_and_(max-height:720px)]:scale-[0.64]">
      <div className={`absolute inset-0 rounded-full border-[4px] shadow-sm ${theme.iconShell}`} />
      <div className={`absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full ${theme.accent === 'text-white' ? 'bg-white/10' : 'bg-zinc-900/5'}`} />
      <FontAwesomeIcon icon={faGamepad} className="relative h-9 w-9" />
    </div>
  );
}

function RioDeviceGlyph({ theme }) {
  const pinClass = theme.accent === 'text-white' ? 'bg-white/45' : 'bg-zinc-400';

  return (
    <div className="relative flex h-[70px] w-[70px] origin-center items-center justify-center [@media(min-width:1200px)_and_(max-height:860px)]:scale-[0.76] [@media(min-width:1200px)_and_(max-height:720px)]:scale-[0.64]">
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
      className={`rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide sm:px-3 sm:text-[12px] [@media(min-width:1200px)]:text-[14px] [@media(min-width:1200px)_and_(max-height:860px)]:px-2 [@media(min-width:1200px)_and_(max-height:860px)]:py-0.5 [@media(min-width:1200px)_and_(max-height:860px)]:text-[11px] [@media(min-width:1200px)_and_(max-height:720px)]:px-1.5 [@media(min-width:1200px)_and_(max-height:720px)]:text-[10px] ${
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

const rowShellClass = (mode, theme) => {
  if (mode === 'estopped' || mode === 'bypassed') {
    return 'bg-gradient-to-b from-white to-rose-50/45 ring-[3px] ring-rose-700 shadow-[0_10px_24px_rgba(190,24,93,0.14)]';
  }

  if (mode === 'astopped') {
    return 'bg-gradient-to-b from-white to-amber-50/55 ring-[2px] ring-amber-500 shadow-[0_8px_20px_rgba(217,119,6,0.1)]';
  }

  if (mode === 'blocking') {
    return 'bg-gradient-to-b from-white to-amber-50/50 ring-[3px] ring-amber-700 shadow-[0_10px_24px_rgba(180,83,9,0.12)]';
  }

  if (mode === 'critical') {
    return 'bg-gradient-to-b from-white to-amber-50/40 ring-[3px] ring-amber-600 shadow-[0_10px_24px_rgba(217,119,6,0.12)]';
  }

  if (mode === 'degraded') {
    return 'bg-gradient-to-b from-white to-amber-50/25 ring-[2px] ring-amber-400 shadow-[0_8px_20px_rgba(245,158,11,0.08)]';
  }

  return theme.defaultRowShell;
};

const rowInsetClass = (mode, theme) => {
  if (mode === 'estopped' || mode === 'bypassed') {
    return 'border-white/45 shadow-none';
  }

  if (mode === 'astopped') {
    return 'border-white/55 shadow-none';
  }

  if (mode === 'blocking' || mode === 'critical' || mode === 'degraded') {
    return 'border-white/50 shadow-none';
  }

  return `${theme.defaultRowInset} shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]`;
};

function ConnectionTile({ kind, state, detail, label }) {
  const theme = connectionTheme(state);
  const isRadio = kind === 'radio';
  const isDS = kind === 'ds';
  const status = deviceStatusText(kind, state);
  const footerClass =
    'mt-1 flex min-h-[20px] items-end justify-center [@media(min-width:1200px)_and_(max-height:860px)]:mt-0 [@media(min-width:1200px)_and_(max-height:860px)]:min-h-[16px] [@media(min-width:1200px)_and_(max-height:720px)]:min-h-[14px]';

  return (
    <div
      className={`grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] rounded-xl px-2.5 py-2 text-center [@media(min-width:1200px)_and_(max-height:860px)]:px-1.5 [@media(min-width:1200px)_and_(max-height:860px)]:py-1 [@media(min-width:1200px)_and_(max-height:720px)]:px-1 [@media(min-width:1200px)_and_(max-height:720px)]:py-0.5 ${theme.tile}`}
    >
      <div className={`text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.24em] ${theme.label}`}>
        {label}
      </div>

      {isRadio ? (
        <div className="mt-2 flex min-h-0 flex-col items-center justify-center sm:mt-1 [@media(min-width:1200px)_and_(max-height:860px)]:mt-0 [@media(min-width:1200px)_and_(max-height:720px)]:mt-0">
          <div
            className={`mb-0.5 origin-center ${theme.accent} [@media(min-width:1200px)_and_(max-height:860px)]:scale-[0.78] [@media(min-width:1200px)_and_(max-height:720px)]:scale-[0.64]`}
          >
            <FontAwesomeIcon icon={faTowerBroadcast} className="h-6 w-6" />
          </div>
          <div
            className={`flex min-h-0 items-center justify-center ${theme.accent} [@media(min-width:1200px)_and_(max-height:860px)]:scale-[0.78] [@media(min-width:1200px)_and_(max-height:720px)]:scale-[0.64]`}
          >
            <SignalBars detail={detail || ''} state={state} hero />
          </div>
        </div>
      ) : (
        <div className="mt-2 flex min-h-0 flex-col items-center justify-center sm:mt-1 [@media(min-width:1200px)_and_(max-height:860px)]:mt-0 [@media(min-width:1200px)_and_(max-height:720px)]:mt-0">
          <div className="flex h-[70px] items-center justify-center [@media(min-width:1200px)_and_(max-height:860px)]:h-[48px] [@media(min-width:1200px)_and_(max-height:720px)]:h-[38px]">
            {isDS ? <DsDeviceGlyph theme={theme} /> : <RioDeviceGlyph theme={theme} />}
          </div>
        </div>
      )}

      <div className={footerClass}>
        {isRadio ? <div aria-hidden="true" className="invisible h-0" /> : <DeviceStatusBadge state={state} text={status} />}
      </div>
    </div>
  );
}

function ConnectionChevron({ state = 'good' }) {
  const theme = connectionTheme(state);
  return (
    <div className="flex items-center justify-center py-1 sm:py-0 [@media(min-width:1200px)_and_(max-height:860px)]:py-0">
      <div className={`flex w-full rotate-90 items-center justify-center gap-1 sm:rotate-0 ${theme.chevron}`}>
        <span className={`h-1 w-3 rounded-full ${state === 'bad' ? 'bg-amber-300' : state === 'warn' ? 'bg-amber-700' : 'bg-zinc-300'}`} />
        <span className="text-[24px] font-black leading-none sm:text-[30px] [@media(min-width:1200px)_and_(max-height:860px)]:text-[20px] [@media(min-width:1200px)_and_(max-height:720px)]:text-[16px]">
          &gt;
        </span>
      </div>
    </div>
  );
}

const stationNumberText = (stationLabel) => stationLabel.match(/\d+/)?.[0] || '--';

function StationBadge({ station, theme }) {
  const stationNumber = stationNumberText(station);

  return (
    <div
      className={`inline-flex rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 sm:px-2.5 sm:text-[12px] [@media(min-width:1200px)_and_(max-height:860px)]:px-1.5 [@media(min-width:1200px)_and_(max-height:860px)]:py-0.5 [@media(min-width:1200px)_and_(max-height:860px)]:text-[10px] [@media(min-width:1200px)_and_(max-height:720px)]:px-1 [@media(min-width:1200px)_and_(max-height:720px)]:text-[9px] ${theme.stationBadge}`}
    >
      STN {stationNumber}
    </div>
  );
}

export default function TeamStatusCard({ alliance, row }) {
  const theme = panelTheme(alliance);
  const isBlocking = row.mode === 'blocking';
  const isAStop = isAStopMode(row.mode);
  const isBypassed = row.mode === 'bypassed';
  const isPostMatchMuted = Boolean(row.isPostMatchMuted);

  return (
    <div
      className={`relative grid min-h-[220px] overflow-hidden rounded-2xl bg-white [@media(min-width:1200px)]:min-h-0 [@media(min-width:1200px)_and_(max-height:860px)]:min-h-[188px] [@media(min-width:1200px)_and_(max-height:720px)]:min-h-[162px] ${
        isBlocking
          ? 'grid-rows-[auto_minmax(0,1fr)] [@media(min-width:1200px)_and_(max-height:860px)]:grid-rows-[auto_minmax(94px,auto)] [@media(min-width:1200px)_and_(max-height:720px)]:grid-rows-[auto_minmax(78px,auto)]'
          : 'grid-rows-[auto_minmax(0,1fr)_auto] [@media(min-width:1200px)]:grid-rows-[auto_minmax(0,1fr)_minmax(72px,auto)] [@media(min-width:1200px)_and_(max-height:860px)]:grid-rows-[auto_minmax(94px,auto)_auto] [@media(min-width:1200px)_and_(max-height:720px)]:grid-rows-[auto_minmax(78px,auto)_auto]'
      } ${rowShellClass(row.mode, theme)}`}
    >
      <div
        className={`pointer-events-none absolute inset-[3px] rounded-[13px] border ${rowInsetClass(row.mode, theme)}`}
      />
      {row.mode !== 'normal' && (
        <div
          data-testid="issue-band"
          className={`absolute inset-x-0 top-0 h-1.5 rounded-t-2xl ${issueBandClass(row.mode)}`}
        />
      )}
      <div className="flex min-h-0 flex-wrap items-start justify-between gap-x-3 gap-y-2 px-4 pb-1 pt-2 sm:px-5 [@media(min-width:1200px)_and_(max-height:860px)]:gap-x-2 [@media(min-width:1200px)_and_(max-height:860px)]:gap-y-1 [@media(min-width:1200px)_and_(max-height:860px)]:px-3 [@media(min-width:1200px)_and_(max-height:860px)]:pb-0 [@media(min-width:1200px)_and_(max-height:860px)]:pt-1 [@media(min-width:1200px)_and_(max-height:720px)]:gap-x-1.5 [@media(min-width:1200px)_and_(max-height:720px)]:gap-y-0.5 [@media(min-width:1200px)_and_(max-height:720px)]:px-2.5 [@media(min-width:1200px)_and_(max-height:720px)]:pt-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2 [@media(min-width:1200px)_and_(max-height:860px)]:gap-y-0.5 [@media(min-width:1200px)_and_(max-height:720px)]:gap-x-1.5 [@media(min-width:1200px)_and_(max-height:720px)]:gap-y-0.5">
          <div className="text-[30px] font-bold leading-none tracking-tight sm:text-[34px] [@media(min-width:1200px)]:text-[40px] [@media(min-width:1200px)_and_(max-height:860px)]:text-[28px] [@media(min-width:1200px)_and_(max-height:720px)]:text-[24px]">
            {row.team}
          </div>
          <StationBadge station={row.station} theme={theme} />
          {row.mode !== 'blocking' && <IssueBadge mode={row.mode} />}
        </div>

        {!isBlocking && !isBypassed && (
          <div
            className={`inline-flex self-center items-center justify-center rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 sm:px-3 sm:text-[13px] [@media(min-width:1200px)]:text-[14px] [@media(min-width:1200px)_and_(max-height:860px)]:px-1.5 [@media(min-width:1200px)_and_(max-height:860px)]:py-0.5 [@media(min-width:1200px)_and_(max-height:860px)]:text-[10px] [@media(min-width:1200px)_and_(max-height:720px)]:px-1 [@media(min-width:1200px)_and_(max-height:720px)]:text-[9px] ${
              isPostMatchMuted ? 'opacity-70' : ''
            } ${stateTone(row.status, theme)}`}
          >
            {stateLabel(row.status)}
          </div>
        )}
      </div>

      <div
        className={`min-h-0 px-4 sm:px-5 ${isBlocking ? 'pb-3' : 'pb-1'} ${
          isPostMatchMuted ? 'opacity-60' : ''
        } [@media(min-width:1200px)_and_(max-height:860px)]:min-h-[94px] [@media(min-width:1200px)_and_(max-height:860px)]:px-3 [@media(min-width:1200px)_and_(max-height:860px)]:pb-0 [@media(min-width:1200px)_and_(max-height:720px)]:min-h-[78px] [@media(min-width:1200px)_and_(max-height:720px)]:px-2.5`}
      >
        {isBlocking ? (
          <div className="flex h-full min-h-0 items-center justify-center">
            <div className="flex min-h-[92px] w-full items-center justify-center rounded-xl border-[3px] border-dashed border-amber-700 bg-amber-50 px-4 py-4 text-center text-[18px] font-bold tracking-wide text-amber-950 sm:px-6 sm:py-5 sm:text-[22px] [@media(min-width:1200px)]:text-[26px] [@media(min-width:1200px)_and_(max-height:860px)]:min-h-[72px] [@media(min-width:1200px)_and_(max-height:860px)]:px-3 [@media(min-width:1200px)_and_(max-height:860px)]:py-3 [@media(min-width:1200px)_and_(max-height:860px)]:text-[18px] [@media(min-width:1200px)_and_(max-height:720px)]:min-h-[60px] [@media(min-width:1200px)_and_(max-height:720px)]:px-2.5 [@media(min-width:1200px)_and_(max-height:720px)]:py-2 [@media(min-width:1200px)_and_(max-height:720px)]:text-[15px]">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mr-3 h-6 w-6 text-amber-700 sm:h-7 sm:w-7" />
              {row.blockingText}
            </div>
          </div>
        ) : (
          <div
            data-testid="connection-layout"
            className="grid h-full min-h-0 grid-cols-1 items-stretch gap-2 pb-px sm:grid-cols-[minmax(0,1fr)_22px_minmax(0,1fr)_22px_minmax(0,1fr)] [@media(min-width:1200px)_and_(max-height:860px)]:gap-1.5 [@media(min-width:1200px)_and_(max-height:860px)]:pb-0 [@media(min-width:1200px)_and_(max-height:720px)]:gap-1"
          >
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
        <div
          className={`px-4 pb-2.5 sm:px-5 ${isPostMatchMuted ? 'opacity-70' : ''} [@media(min-width:1200px)_and_(max-height:860px)]:px-3 [@media(min-width:1200px)_and_(max-height:860px)]:pb-1 [@media(min-width:1200px)_and_(max-height:720px)]:px-2.5 [@media(min-width:1200px)_and_(max-height:720px)]:pb-0.5`}
        >
          <div className="grid gap-2 rounded-xl bg-zinc-50/70 py-1.5 sm:min-h-[72px] sm:grid-cols-[1fr_1.35fr] [@media(min-width:1200px)_and_(max-height:860px)]:gap-1 [@media(min-width:1200px)_and_(max-height:860px)]:py-0.5 [@media(min-width:1200px)_and_(max-height:860px)]:sm:min-h-[54px] [@media(min-width:1200px)_and_(max-height:720px)]:gap-0.5 [@media(min-width:1200px)_and_(max-height:720px)]:sm:min-h-[44px]">
            <div
              className={`rounded-xl px-2.5 py-1.5 [@media(min-width:1200px)_and_(max-height:860px)]:px-2 [@media(min-width:1200px)_and_(max-height:860px)]:py-1 [@media(min-width:1200px)_and_(max-height:720px)]:px-1.5 [@media(min-width:1200px)_and_(max-height:720px)]:py-0.5 ${batteryToneClass(row.battery, isAStop)}`}
            >
              <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase text-zinc-500 [@media(min-width:1200px)_and_(max-height:860px)]:text-[9px] [@media(min-width:1200px)_and_(max-height:720px)]:text-[8px]">
                <div className="flex items-center gap-1 [@media(min-width:1200px)_and_(max-height:720px)]:gap-0.5">
                  <FontAwesomeIcon icon={faBatteryHalf} className="h-3 w-3" /> Battery
                </div>
                {row.battery?.action ? (
                  <div
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] [@media(min-width:1200px)_and_(max-height:860px)]:px-1.5 [@media(min-width:1200px)_and_(max-height:860px)]:text-[8px] [@media(min-width:1200px)_and_(max-height:720px)]:px-1 [@media(min-width:1200px)_and_(max-height:720px)]:text-[7px] ${batteryActionClass(row.battery)}`}
                  >
                    {row.battery.action}
                  </div>
                ) : null}
              </div>
              <div className="mt-1 flex items-end gap-1.5 [@media(min-width:1200px)_and_(max-height:860px)]:mt-0.5 [@media(min-width:1200px)_and_(max-height:860px)]:gap-1 [@media(min-width:1200px)_and_(max-height:720px)]:mt-0 [@media(min-width:1200px)_and_(max-height:720px)]:gap-0.5">
                <div className="text-[20px] font-bold leading-none text-zinc-900 [@media(min-width:1200px)_and_(max-height:860px)]:text-[17px] [@media(min-width:1200px)_and_(max-height:720px)]:text-[14px]">
                  {row.battery?.value}
                </div>
                <div className="text-[10px] font-semibold leading-none text-zinc-500 [@media(min-width:1200px)_and_(max-height:860px)]:text-[9px] [@media(min-width:1200px)_and_(max-height:720px)]:text-[8px]">
                  Min {row.battery?.min}
                </div>
              </div>
            </div>

            <div
              data-testid="row-metrics-grid"
              className="grid grid-cols-2 items-center gap-1 rounded-xl bg-white/65 px-2 py-1.5 [@media(min-width:440px)]:grid-cols-3 [@media(min-width:1200px)_and_(max-height:860px)]:px-1.5 [@media(min-width:1200px)_and_(max-height:860px)]:py-1 [@media(min-width:1200px)_and_(max-height:720px)]:px-1 [@media(min-width:1200px)_and_(max-height:720px)]:py-0.5"
            >
              <div className="min-w-0 col-span-2 [@media(min-width:440px)]:col-span-1">
                <div className="flex items-center gap-1 text-[9px] font-bold uppercase text-zinc-500 [@media(min-width:1200px)_and_(max-height:860px)]:text-[8px] [@media(min-width:1200px)_and_(max-height:720px)]:gap-0.5 [@media(min-width:1200px)_and_(max-height:720px)]:text-[7px]">
                  <FontAwesomeIcon icon={faRightLeft} className="h-3 w-3" /> BW
                </div>
                <div className="mt-0.5 text-[13px] font-bold leading-none text-zinc-900 [@media(min-width:1200px)_and_(max-height:860px)]:text-[11px] [@media(min-width:1200px)_and_(max-height:720px)]:text-[10px]">
                  {row.bwu?.value}
                </div>
                <div className="mt-0.5 truncate text-[8px] font-semibold leading-none text-zinc-500 [@media(min-width:1200px)_and_(max-height:860px)]:text-[7px] [@media(min-width:1200px)_and_(max-height:720px)]:text-[6px]">
                  Tx {row.bwu?.tx} / Rx {row.bwu?.rx}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase text-zinc-500 [@media(min-width:1200px)_and_(max-height:860px)]:text-[8px] [@media(min-width:1200px)_and_(max-height:720px)]:gap-0.5 [@media(min-width:1200px)_and_(max-height:720px)]:text-[7px]">
                  <FontAwesomeIcon icon={faRoute} className="h-3 w-3" /> Trip
                </div>
                <div className="mt-0.5 text-[13px] font-bold leading-none text-zinc-900 [@media(min-width:1200px)_and_(max-height:860px)]:text-[11px] [@media(min-width:1200px)_and_(max-height:720px)]:text-[10px]">
                  {row.trip}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase text-zinc-500 [@media(min-width:1200px)_and_(max-height:860px)]:text-[8px] [@media(min-width:1200px)_and_(max-height:720px)]:gap-0.5 [@media(min-width:1200px)_and_(max-height:720px)]:text-[7px]">
                  <FontAwesomeIcon icon={faXmark} className="h-3 w-3" /> Loss
                </div>
                <div className="mt-0.5 text-[13px] font-bold leading-none text-zinc-900 [@media(min-width:1200px)_and_(max-height:860px)]:text-[11px] [@media(min-width:1200px)_and_(max-height:720px)]:text-[10px]">
                  {row.pkts}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
