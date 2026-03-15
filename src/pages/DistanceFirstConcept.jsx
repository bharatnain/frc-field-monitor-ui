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
        bar: 'bg-red-600',
        accent: 'text-red-700',
        stateAuto: 'bg-violet-50 text-violet-800 ring-violet-200',
        stateTele: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
      }
    : {
        bar: 'bg-blue-600',
        accent: 'text-blue-700',
        stateAuto: 'bg-violet-50 text-violet-800 ring-violet-200',
        stateTele: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
      };

const issueLabel = (mode) => {
  if (mode === 'critical') return 'CRITICAL';
  if (mode === 'degraded') return 'WARN';
  return '';
};

const stateTone = (status, theme) =>
  status.includes('Auto') ? theme.stateAuto : theme.stateTele;

const shortState = (status) =>
  status === 'Teleop Enabled'
    ? 'TELEOP'
    : status === 'Teleop Disabled'
      ? 'TELEOP OFF'
      : status === 'Auto Enabled'
        ? 'AUTO'
        : 'AUTO DISABLED';

const barCountFromDetail = (detail) => {
  if (detail.includes('4')) return 4;
  if (detail.includes('3')) return 3;
  if (detail.includes('2')) return 2;
  if (detail.includes('1')) return 1;
  return 0;
};

function SignalBars({ detail }) {
  const count = barCountFromDetail(detail);
  if (count === 0) {
    return <span className="text-[28px] font-extrabold">OUT</span>;
  }
  const heights = ['25%', '50%', '75%', '100%'];
  return (
    <span className="inline-flex items-end justify-center gap-1.5 h-10">
      {heights.slice(0, count).map((h, i) => (
        <span
          key={i}
          className="w-3 rounded-sm bg-zinc-900"
          style={{ height: h }}
        />
      ))}
    </span>
  );
}

function IssueBadge({ mode }) {
  if (mode === 'normal') return null;
  const isCritical = mode === 'critical';
  return (
    <div
      className={`rounded-md px-3 py-1 text-[14px] font-extrabold uppercase tracking-wide ${
        isCritical
          ? 'bg-amber-600 text-white ring-1 ring-amber-700'
          : 'bg-amber-100 text-amber-950 ring-1 ring-amber-500'
      }`}
    >
      {issueLabel(mode)}
    </div>
  );
}

const issueBandClass = (mode) => {
  if (mode === 'blocking') return 'bg-amber-700';
  if (mode === 'critical') return 'bg-amber-600';
  if (mode === 'degraded') return 'bg-amber-400';
  return '';
};

const signalTileClass = (state) => {
  if (state === 'bad') return 'bg-zinc-900 text-white ring-[3px] ring-amber-700';
  if (state === 'warn') return 'bg-amber-50 text-zinc-900 ring-2 ring-amber-400';
  return 'bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200';
};

const signalLabelClass = (state) => (state === 'bad' ? 'text-white/80' : 'text-zinc-500');

const distancePanels = [
  {
    alliance: 'red',
    title: 'Red Alliance',
    rows: [
      {
        team: '2056',
        station: 'Stn 2',
        mode: 'normal',
        status: 'Teleop Enabled',
        ds: { label: 'DS', state: 'good', detail: 'Connected' },
        radio: { label: 'Radio', state: 'good', detail: '4 bars' },
        rio: { label: 'RIO', state: 'good', detail: 'Connected' },
        battery: { value: '11.9V', min: '7.8' },
        bwu: { value: '4.2 Mbps', tx: '2.1', rx: '2.1' },
        trip: '18 ms',
        pkts: '12',
      },
      {
        team: '118',
        station: 'Stn 3',
        mode: 'critical',
        status: 'Teleop Enabled',
        ds: { label: 'DS', state: 'good', detail: 'Connected' },
        radio: { label: 'Radio', state: 'good', detail: '4 bars' },
        rio: { label: 'RIO', state: 'good', detail: 'Connected' },
        battery: { value: '7.8V', min: '7.4' },
        bwu: { value: '5.0 Mbps', tx: '2.8', rx: '2.2' },
        trip: '18 ms',
        pkts: '11',
      },
      {
        team: '148',
        station: 'Stn 2',
        mode: 'blocking',
        blockingText: 'MOVE TO RED 2',
      },
    ],
  },
  {
    alliance: 'blue',
    title: 'Blue Alliance',
    rows: [
      {
        team: '1678',
        station: 'Stn 1',
        mode: 'degraded',
        status: 'Teleop Enabled',
        ds: { label: 'DS', state: 'warn', detail: 'Degraded' },
        radio: { label: 'Radio', state: 'warn', detail: '2 bars' },
        rio: { label: 'RIO', state: 'good', detail: 'Connected' },
        battery: { value: '11.3V', min: '8.9' },
        bwu: { value: '4.8 Mbps', tx: '2.6', rx: '2.2' },
        trip: '21 ms',
        pkts: '9',
      },
      {
        team: '6328',
        station: 'Stn 1',
        mode: 'blocking',
        blockingText: 'TEAM MISMATCH',
      },
      {
        team: '254',
        station: 'Stn 2',
        mode: 'normal',
        status: 'Auto Disabled',
        ds: { label: 'DS', state: 'good', detail: 'Connected' },
        radio: { label: 'Radio', state: 'good', detail: '4 bars' },
        rio: { label: 'RIO', state: 'good', detail: 'Connected' },
        battery: { value: '12.1V', min: '9.4' },
        bwu: { value: '3.2 Mbps', tx: '1.7', rx: '1.5' },
        trip: '14 ms',
        pkts: '3',
      },
    ],
  },
];

export default function DistanceFirstConcept() {
  return (
    <div className="h-screen flex bg-zinc-100 text-zinc-900">
      {distancePanels.map((panel) => {
        const theme = panelTheme(panel.alliance);
        const isRed = panel.alliance === 'red';
        return (
          <div key={`distance-${panel.alliance}`} className="flex flex-1">
            {isRed && <div className={`w-5 shrink-0 ${theme.bar}`} />}
            <div className="flex flex-1 flex-col gap-3 p-3">
            {panel.rows.map((row) => {
              const isBlocking = row.mode === 'blocking';
              const isCritical = row.mode === 'critical';
              const isDegraded = row.mode === 'degraded';

              return (
                <div
                  key={`distance-${panel.alliance}-${row.team}-${row.station}`}
                  className={`relative flex flex-1 flex-col rounded-2xl bg-white ${
                    isBlocking
                      ? 'ring-[4px] ring-amber-700 shadow-sm'
                      : isCritical
                        ? 'ring-[4px] ring-amber-600 shadow-sm'
                        : isDegraded
                          ? 'ring-2 ring-amber-400'
                          : 'ring-1 ring-zinc-200'
                  }`}
                >
                  {row.mode !== 'normal' && (
                    <div className={`absolute inset-x-0 top-0 h-2 rounded-t-2xl ${issueBandClass(row.mode)}`} />
                  )}
                  <div className="flex flex-1 flex-col justify-center px-5 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-[42px] font-bold leading-none tracking-tight">
                              {row.team}
                            </div>
                            {row.mode !== 'blocking' && <IssueBadge mode={row.mode} />}
                          </div>
                          <div className={`mt-1 text-[18px] font-semibold ${theme.accent}`}>
                            {row.station}
                          </div>
                        </div>
                      </div>

                      {isBlocking ? (
                        <div className="flex flex-1 items-center justify-center rounded-xl border-[3px] border-dashed border-amber-700 bg-amber-50 px-6 py-4 text-[28px] font-bold tracking-wide text-amber-950">
                          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-3 h-7 w-7 text-amber-700" />
                          {row.blockingText}
                        </div>
                      ) : (
                        <div
                          className={`flex h-[60px] min-w-[170px] items-center justify-center rounded-xl px-5 text-[28px] font-bold uppercase tracking-wide ring-2 ${stateTone(row.status || '', theme)}`}
                        >
                          {shortState(row.status || '')}
                        </div>
                      )}
                    </div>

                    {!isBlocking && (
                      <div className="mt-2.5 grid grid-cols-3 gap-3">
                        <div
                          className={`rounded-xl px-3 py-3 text-center ${signalTileClass(row.ds?.state)}`}
                        >
                          <div className={`flex items-center justify-center gap-1.5 text-[15px] font-bold uppercase ${signalLabelClass(row.ds?.state)}`}>
                            <FontAwesomeIcon icon={faGamepad} className="h-4 w-4" /> DS
                          </div>
                          <div className="mt-1.5 flex items-center justify-center">
                            {row.ds?.state === 'good' ? (
                              <span className="text-[28px] font-extrabold text-zinc-900">OK</span>
                            ) : row.ds?.state === 'warn' ? (
                              <span className="text-[28px] font-extrabold text-amber-800">WARN</span>
                            ) : (
                              <span className="text-[28px] font-extrabold text-white">OUT</span>
                            )}
                          </div>
                        </div>

                        <div
                          className={`rounded-xl px-3 py-3 text-center ${signalTileClass(row.radio?.state)}`}
                        >
                          <div className={`flex items-center justify-center gap-1.5 text-[15px] font-bold uppercase ${signalLabelClass(row.radio?.state)}`}>
                            <FontAwesomeIcon icon={faTowerBroadcast} className="h-4 w-4" /> RADIO
                          </div>
                          <div className={`mt-1.5 flex min-h-[40px] items-center justify-center ${row.radio?.state === 'bad' ? 'text-white' : 'text-zinc-900'}`}>
                            <SignalBars detail={row.radio?.detail || ''} />
                          </div>
                        </div>

                        <div
                          className={`rounded-xl px-3 py-3 text-center ${signalTileClass(row.rio?.state)}`}
                        >
                          <div className={`flex items-center justify-center gap-1.5 text-[15px] font-bold uppercase ${signalLabelClass(row.rio?.state)}`}>
                            <FontAwesomeIcon icon={faMicrochip} className="h-4 w-4" /> RIO
                          </div>
                          <div className="mt-1.5 flex items-center justify-center">
                            {row.rio?.state === 'good' ? (
                              <span className="text-[28px] font-extrabold text-zinc-900">OK</span>
                            ) : row.rio?.state === 'warn' ? (
                              <span className="text-[28px] font-extrabold text-amber-800">WARN</span>
                            ) : (
                              <span className="text-[28px] font-extrabold text-white">OUT</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {!isBlocking && (
                      <div className="mt-2.5 grid grid-cols-[1.4fr_1.3fr_0.7fr_0.85fr] gap-2.5 rounded-xl bg-zinc-50/70 px-2.5 py-2">
                        <div
                          className={`rounded-xl px-3 py-2.5 ${isCritical ? 'bg-amber-50 ring-2 ring-amber-400' : 'bg-white/80'}`}
                        >
                          <div className="flex items-center gap-1.5 text-[13px] font-bold uppercase text-zinc-500">
                            <FontAwesomeIcon icon={faBatteryHalf} className="h-3.5 w-3.5" /> Battery
                          </div>
                          <div className="mt-1 flex items-end gap-3">
                            <div className="text-[26px] font-bold leading-none text-zinc-900">
                              {row.battery?.value}
                            </div>
                            <div className="text-[15px] font-semibold text-zinc-500">
                              Min {row.battery?.min}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl bg-white/80 px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-[13px] font-bold uppercase text-zinc-500">
                            <FontAwesomeIcon icon={faRightLeft} className="h-3.5 w-3.5" /> Bandwidth
                          </div>
                          <div className="mt-1 text-[17px] font-bold leading-none text-zinc-900">
                            {row.bwu?.value}
                          </div>
                          <div className="mt-1 text-[14px] font-semibold text-zinc-500">
                            Tx {row.bwu?.tx}  Rx {row.bwu?.rx}
                          </div>
                        </div>

                        <div className="rounded-xl bg-white/80 px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-[13px] font-bold uppercase text-zinc-500">
                            <FontAwesomeIcon icon={faRoute} className="h-3.5 w-3.5" /> Trip
                          </div>
                          <div className="mt-1 text-[17px] font-bold text-zinc-900">
                            {row.trip}
                          </div>
                        </div>

                        <div className="rounded-xl bg-white/80 px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-[13px] font-bold uppercase text-zinc-500">
                            <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" /> Lost Pkts
                          </div>
                          <div className="mt-1 text-[17px] font-bold text-zinc-900">
                            {row.pkts}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
            {!isRed && <div className={`w-5 shrink-0 ${theme.bar}`} />}
          </div>
        );
      })}
    </div>
  );
}
