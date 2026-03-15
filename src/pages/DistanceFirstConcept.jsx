import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTriangleExclamation,
  faGamepad,
  faTowerBroadcast,
  faMicrochip,
  faBatteryHalf,
  faRightLeft,
  faRoute,
  faCircleCheck,
  faXmark,
  faSignal,
} from '@fortawesome/free-solid-svg-icons';

const panelTheme = (alliance) =>
  alliance === 'red'
    ? {
        shell: 'bg-red-50/40 ring-red-200',
        header: 'bg-red-600 text-white',
        rail: 'bg-red-600',
        accent: 'text-red-700',
        stateAuto: 'bg-violet-50 text-violet-800 ring-violet-200',
        stateTele: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
      }
    : {
        shell: 'bg-blue-50/40 ring-blue-200',
        header: 'bg-blue-600 text-white',
        rail: 'bg-blue-600',
        accent: 'text-blue-700',
        stateAuto: 'bg-violet-50 text-violet-800 ring-violet-200',
        stateTele: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
      };

const issueBand = (mode) => {
  if (mode === 'critical') return 'bg-amber-500';
  if (mode === 'degraded') return 'bg-amber-300';
  if (mode === 'blocking') return 'bg-amber-500';
  return '';
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

const radioBars = (detail) => {
  if (detail.includes('4')) return '▂▄▆█';
  if (detail.includes('3')) return '▂▄▆';
  if (detail.includes('2')) return '▂▄';
  if (detail.includes('1')) return '▂';
  return '✕';
};

function IssueBadge({ mode }) {
  if (mode === 'normal') return null;
  return (
    <div className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-300">
      {issueLabel(mode)}
    </div>
  );
}

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
    <div className="min-h-screen bg-zinc-100 p-6 text-zinc-900">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-4 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200">
          <div className="text-sm font-semibold text-zinc-900">Distance first concept</div>
          <div className="mt-1 text-sm text-zinc-600">
            Refined for the real match case of 6 teams total, 3 per alliance, on a fullscreen 16 by 9 or 4 by 3 monitor
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {distancePanels.map((panel) => {
            const theme = panelTheme(panel.alliance);
            return (
              <section
                key={`distance-${panel.alliance}`}
                className={`rounded-3xl p-4 shadow-sm ring-1 ${theme.shell}`}
              >
                <div
                  className={`mb-4 rounded-2xl px-4 py-3 text-xl font-semibold shadow-sm ${theme.header}`}
                >
                  {panel.title}
                </div>

                <div className="space-y-3">
                  {panel.rows.map((row) => {
                    const isBlocking = row.mode === 'blocking';
                    const isCritical = row.mode === 'critical';
                    const isDegraded = row.mode === 'degraded';

                    return (
                      <div
                        key={`distance-${panel.alliance}-${row.team}-${row.station}`}
                        className={`relative overflow-hidden rounded-3xl bg-white ${isCritical ? 'ring-2 ring-amber-400 shadow-sm' : isDegraded ? 'ring-2 ring-amber-200' : isBlocking ? 'ring-2 ring-amber-400 shadow-sm' : 'ring-1 ring-zinc-200'}`}
                      >
                        {row.mode !== 'normal' && (
                          <div className={`absolute inset-x-0 top-0 h-2 ${issueBand(row.mode)}`} />
                        )}
                        <div className={`absolute inset-y-0 left-0 w-4 ${theme.rail}`} />

                        <div className="pl-8 pr-4 py-3">
                          <div className="grid grid-cols-[126px_1fr_150px] items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-[32px] font-bold leading-none tracking-tight">
                                  {row.team}
                                </div>
                                {row.mode !== 'blocking' && <IssueBadge mode={row.mode} />}
                              </div>
                              <div className={`mt-1 text-[15px] font-semibold ${theme.accent}`}>
                                {row.station}
                              </div>
                            </div>

                            {isBlocking ? (
                              <div className="flex h-[76px] items-center justify-center rounded-2xl bg-amber-50 text-center text-[22px] font-bold tracking-wide text-amber-900 ring-2 ring-amber-300">
                                {row.blockingText}
                              </div>
                            ) : (
                              <div className="grid grid-cols-4 gap-2.5">
                                <div
                                  className={`rounded-2xl px-3 py-3 text-center ${row.ds?.state === 'good' ? 'bg-zinc-50' : row.ds?.state === 'warn' ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-amber-100 ring-2 ring-amber-300'}`}
                                >
                                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                                    <FontAwesomeIcon icon={faGamepad} className="h-3 w-3" /> DS
                                  </div>
                                  <div className="mt-2 flex items-center justify-center text-[18px] font-bold text-zinc-900">
                                    {row.ds?.state === 'good' ? (
                                      <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5 text-emerald-600" />
                                    ) : row.ds?.state === 'warn' ? (
                                      <FontAwesomeIcon icon={faTriangleExclamation} className="h-5 w-5 text-amber-600" />
                                    ) : (
                                      <FontAwesomeIcon icon={faXmark} className="h-5 w-5 text-amber-600" />
                                    )}
                                  </div>
                                </div>

                                <div
                                  className={`rounded-2xl px-3 py-3 text-center ${row.radio?.state === 'good' ? 'bg-zinc-50' : row.radio?.state === 'warn' ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-amber-100 ring-2 ring-amber-300'}`}
                                >
                                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                                    <FontAwesomeIcon icon={faTowerBroadcast} className="h-3 w-3" /> RADIO
                                  </div>
                                  <div className="mt-1.5 flex min-h-[32px] items-center justify-center gap-1.5 text-[18px] font-bold leading-none tracking-tight text-zinc-900">
                                    <FontAwesomeIcon icon={faSignal} className="h-4 w-4 text-zinc-500" />
                                    {radioBars(row.radio?.detail || '')}
                                  </div>
                                </div>

                                <div
                                  className={`rounded-2xl px-3 py-3 text-center ${row.rio?.state === 'good' ? 'bg-zinc-50' : row.rio?.state === 'warn' ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-amber-100 ring-2 ring-amber-300'}`}
                                >
                                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                                    <FontAwesomeIcon icon={faMicrochip} className="h-3 w-3" /> RIO
                                  </div>
                                  <div className="mt-2 flex items-center justify-center text-[18px] font-bold text-zinc-900">
                                    {row.rio?.state === 'good' ? (
                                      <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5 text-emerald-600" />
                                    ) : row.rio?.state === 'warn' ? (
                                      <FontAwesomeIcon icon={faTriangleExclamation} className="h-5 w-5 text-amber-600" />
                                    ) : (
                                      <FontAwesomeIcon icon={faXmark} className="h-5 w-5 text-amber-600" />
                                    )}
                                  </div>
                                </div>

                                <div
                                  className={`rounded-2xl px-3 py-3 text-center ${isCritical ? 'bg-amber-50 ring-2 ring-amber-300' : 'bg-zinc-50'}`}
                                >
                                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                                    <FontAwesomeIcon icon={faBatteryHalf} className="h-3 w-3" /> BATT
                                  </div>
                                  <div className="mt-1.5 flex min-h-[32px] items-center justify-center gap-1.5 text-[22px] font-bold leading-none text-zinc-900">
                                    <FontAwesomeIcon icon={faBatteryHalf} className="h-5 w-5 text-zinc-500" />
                                    {row.battery?.value}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end">
                              {isBlocking ? (
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-[14px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-300">
                                  <FontAwesomeIcon icon={faTriangleExclamation} className="h-4 w-4" /> Hold
                                </div>
                              ) : (
                                <div
                                  className={`inline-flex min-w-[136px] items-center justify-center rounded-2xl px-4 py-3 text-[15px] font-bold uppercase tracking-wide ring-2 ${stateTone(row.status || '', theme)}`}
                                >
                                  {shortState(row.status || '')}
                                </div>
                              )}
                            </div>
                          </div>

                          {!isBlocking && (
                            <div className="mt-2.5 grid grid-cols-[1.25fr_1.35fr_0.8fr_0.95fr] gap-2.5 rounded-2xl bg-zinc-50/70 px-2.5 py-2">
                              <div
                                className={`rounded-2xl px-3 py-2.5 ${isCritical ? 'bg-amber-50/80' : 'bg-white/80'}`}
                              >
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                                  <FontAwesomeIcon icon={faBatteryHalf} className="h-3 w-3" /> Battery Detail
                                </div>
                                <div className="mt-1 flex items-end gap-3">
                                  <div className="text-[21px] font-bold leading-none text-zinc-900">
                                    {row.battery?.value}
                                  </div>
                                  <div className="text-[13px] font-semibold text-zinc-500">
                                    Min {row.battery?.min}
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-2xl bg-white/80 px-3 py-2.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                                  <FontAwesomeIcon icon={faRightLeft} className="h-3 w-3" /> Bandwidth
                                </div>
                                <div className="mt-1 text-[17px] font-bold leading-none text-zinc-900">
                                  {row.bwu?.value}
                                </div>
                                <div className="mt-1 text-[12px] font-semibold text-zinc-500">
                                  Tx {row.bwu?.tx}  Rx {row.bwu?.rx}
                                </div>
                              </div>

                              <div className="rounded-2xl bg-white/80 px-3 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                                  <FontAwesomeIcon icon={faRoute} className="h-3 w-3" /> Trip
                                </div>
                                <div className="mt-1 text-[17px] font-bold text-zinc-900">
                                  {row.trip}
                                </div>
                              </div>

                              <div className="rounded-2xl bg-white/80 px-3 py-2.5 text-center">
                                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                                  <FontAwesomeIcon icon={faXmark} className="h-3 w-3" /> Lost Pkts
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
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
