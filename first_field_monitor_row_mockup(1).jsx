import {
  AlertTriangle,
  BatteryMedium,
  Activity,
  ArrowUpDown,
  Radio,
  Cpu,
  Gamepad2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGamepad,
  faTowerBroadcast,
  faMicrochip,
  faBatteryHalf,
  faRightLeft,
  faRoute,
  faTriangleExclamation,
  faBolt,
} from '@fortawesome/free-solid-svg-icons';

type RowMode = 'normal' | 'critical' | 'degraded' | 'blocking';
type SignalState = 'good' | 'warn' | 'bad';

type SystemSignal = {
  label: 'DS' | 'Radio' | 'RIO';
  state: SignalState;
  detail: string;
};

type DataRow = {
  team: string;
  station: string;
  mode: RowMode;
  status?: string;
  ds?: SystemSignal;
  radio?: SystemSignal;
  rio?: SystemSignal;
  battery?: { value: string; min: string };
  bwu?: { value: string; tx: string; rx: string };
  trip?: string;
  pkts?: string;
  blockingText?: string;
};

type AlliancePanel = {
  alliance: 'red' | 'blue';
  title: string;
  rows: DataRow[];
};

export default function FirstFieldMonitorRowMockup() {
  const alliancePanels: AlliancePanel[] = [
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
        {
          team: '3310',
          station: 'Stn 1',
          mode: 'degraded',
          status: 'Teleop Enabled',
          ds: { label: 'DS', state: 'warn', detail: 'Degraded' },
          radio: { label: 'Radio', state: 'good', detail: '4 bars' },
          rio: { label: 'RIO', state: 'good', detail: 'Connected' },
          battery: { value: '12.0V', min: '10.8' },
          bwu: { value: '3.8 Mbps', tx: '1.9', rx: '1.9' },
          trip: '19 ms',
          pkts: '4',
        },
        {
          team: '604',
          station: 'Stn 3',
          mode: 'critical',
          status: 'Teleop Disabled',
          ds: { label: 'DS', state: 'good', detail: 'Connected' },
          radio: { label: 'Radio', state: 'bad', detail: '0 bars' },
          rio: { label: 'RIO', state: 'bad', detail: 'Missing' },
          battery: { value: '12.5V', min: '12.2' },
          bwu: { value: '0.0 Mbps', tx: '0.0', rx: '0.0' },
          trip: '0 ms',
          pkts: '0',
        },
        {
          team: '987',
          station: 'Stn 1',
          mode: 'critical',
          status: 'Auto Disabled',
          ds: { label: 'DS', state: 'bad', detail: 'Missing' },
          radio: { label: 'Radio', state: 'good', detail: '4 bars' },
          rio: { label: 'RIO', state: 'good', detail: 'Connected' },
          battery: { value: '12.3V', min: '12.1' },
          bwu: { value: '0.5 Mbps', tx: '0.3', rx: '0.2' },
          trip: '9 ms',
          pkts: '1',
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
        {
          team: '4414',
          station: 'Stn 3',
          mode: 'degraded',
          status: 'Teleop Enabled',
          ds: { label: 'DS', state: 'good', detail: 'Connected' },
          radio: { label: 'Radio', state: 'warn', detail: '1 bar' },
          rio: { label: 'RIO', state: 'good', detail: 'Connected' },
          battery: { value: '10.9V', min: '9.7' },
          bwu: { value: '6.9 Mbps', tx: '4.0', rx: '2.9' },
          trip: '47 ms',
          pkts: '16',
        },
        {
          team: '900',
          station: 'Stn 2',
          mode: 'critical',
          status: 'Teleop Disabled',
          ds: { label: 'DS', state: 'good', detail: 'Connected' },
          radio: { label: 'Radio', state: 'good', detail: '4 bars' },
          rio: { label: 'RIO', state: 'bad', detail: 'Missing' },
          battery: { value: '12.0V', min: '11.8' },
          bwu: { value: '1.1 Mbps', tx: '0.6', rx: '0.5' },
          trip: '11 ms',
          pkts: '2',
        },
        {
          team: '2485',
          station: 'Stn 1',
          mode: 'degraded',
          status: 'Auto Enabled',
          ds: { label: 'DS', state: 'good', detail: 'Connected' },
          radio: { label: 'Radio', state: 'good', detail: '4 bars' },
          rio: { label: 'RIO', state: 'good', detail: 'Connected' },
          battery: { value: '9.2V', min: '8.6' },
          bwu: { value: '7.8 Mbps', tx: '4.7', rx: '3.1' },
          trip: '63 ms',
          pkts: '22',
        },
      ],
    },
  ];

  const distancePanels: AlliancePanel[] = [
    {
      alliance: 'red',
      title: 'Red Alliance',
      rows: [alliancePanels[0].rows[0], alliancePanels[0].rows[1], alliancePanels[0].rows[2]],
    },
    {
      alliance: 'blue',
      title: 'Blue Alliance',
      rows: [alliancePanels[1].rows[0], alliancePanels[1].rows[1], alliancePanels[1].rows[2]],
    },
  ];

  const panelTheme = (alliance: 'red' | 'blue') =>
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

  const rowClass = (mode: RowMode) => {
    if (mode === 'critical') return 'bg-white shadow-sm ring-1 ring-zinc-200';
    if (mode === 'degraded') return 'bg-zinc-50 ring-1 ring-zinc-200';
    if (mode === 'blocking') return 'bg-white shadow-sm ring-1 ring-zinc-200';
    return 'bg-white ring-1 ring-zinc-200';
  };

  const issueBand = (mode: RowMode) => {
    if (mode === 'critical') return 'bg-amber-500';
    if (mode === 'degraded') return 'bg-amber-300';
    if (mode === 'blocking') return 'bg-amber-500';
    return '';
  };

  const issueLabel = (mode: RowMode) => {
    if (mode === 'critical') return 'CRITICAL';
    if (mode === 'degraded') return 'WARN';
    return '';
  };

  const stateTone = (status: string, theme: ReturnType<typeof panelTheme>) =>
    status.includes('Auto') ? theme.stateAuto : theme.stateTele;

  const shortState = (status: string) =>
    status === 'Teleop Enabled'
      ? 'TELEOP'
      : status === 'Teleop Disabled'
        ? 'TELEOP OFF'
        : status === 'Auto Enabled'
          ? 'AUTO'
          : 'AUTO DISABLED';

  const radioBars = (detail: string) => {
    if (detail.includes('4')) return '▂▄▆█';
    if (detail.includes('3')) return '▂▄▆';
    if (detail.includes('2')) return '▂▄';
    if (detail.includes('1')) return '▂';
    return '✕';
  };

  const signalTone = (state: SignalState) => {
    if (state === 'good') return 'text-zinc-900 bg-transparent';
    if (state === 'warn') return 'text-amber-900 bg-amber-50 ring-1 ring-amber-200';
    return 'text-amber-950 bg-amber-100 ring-1 ring-amber-300';
  };

  function DsRioStateIcon({ state }: { state: SignalState }) {
    const iconClass = 'h-4 w-4 shrink-0';
    if (state === 'good') return <CheckCircle className={`${iconClass} text-emerald-600`} />;
    if (state === 'warn') return <AlertTriangle className={`${iconClass} text-amber-600`} />;
    return <XCircle className={`${iconClass} text-amber-600`} />;
  }

  function HealthyChainItem({ label, state, detail }: SystemSignal) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 ${signalTone(state)}`}>
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${state === 'good' ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {label}
        </span>
        {label === 'Radio' ? (
          <span className="text-[12px] font-semibold tracking-tight text-zinc-700">{radioBars(detail)}</span>
        ) : (
          <DsRioStateIcon state={state} />
        )}
      </div>
    );
  }

  function MetricPill({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
    return (
      <div className={`inline-flex items-baseline gap-1 rounded-full px-2 py-1 ${emphasized ? 'bg-zinc-100 ring-1 ring-zinc-300' : 'bg-transparent'}`}>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
        <span className={`${emphasized ? 'text-[15px]' : 'text-sm'} font-semibold text-zinc-900`}>{value}</span>
      </div>
    );
  }

  function CompactMetricGroup({ title, children, emphasized = false }: { title: string; children: React.ReactNode; emphasized?: boolean }) {
    return (
      <div className={`rounded-xl px-2 py-1 ${emphasized ? 'bg-zinc-100 ring-1 ring-zinc-300' : 'bg-zinc-50/70'}`}>
        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{title}</div>
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">{children}</div>
      </div>
    );
  }

  function IssueBadge({ mode }: { mode: RowMode }) {
    if (mode === 'normal') return null;
    return (
      <div className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-300">
        {issueLabel(mode)}
      </div>
    );
  }

  function VisualStatusPill({ status, theme }: { status: string; theme: ReturnType<typeof panelTheme> }) {
    const isAuto = status.includes('Auto');
    const isDisabled = !status.includes('Enabled');
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-center ring-1 ${stateTone(status, theme)}`}>
        <FontAwesomeIcon icon={faBolt} className="h-3.5 w-3.5" />
        {isAuto ? 'AUTO' : 'TELEOP'}
        {isDisabled && <span className="opacity-80">DISABLED</span>}
      </div>
    );
  }

  function OriginalConcept() {
    return (
      <div>
        <div className="mb-4 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200">
          <div className="text-sm font-semibold text-zinc-900">Frozen concept</div>
          <div className="mt-1 text-sm text-zinc-600">Compact grouped rows with minimal chrome</div>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {alliancePanels.map((panel) => {
            const theme = panelTheme(panel.alliance);
            return (
              <section key={panel.alliance} className={`rounded-3xl p-4 shadow-sm ring-1 ${theme.shell}`}>
                <div className={`mb-4 rounded-2xl px-4 py-3 text-lg font-semibold shadow-sm ${theme.header}`}>{panel.title}</div>
                <div className="space-y-2.5">
                  {panel.rows.map((row) => (
                    <div key={`${panel.alliance}-${row.team}-${row.station}`} className={`relative overflow-hidden rounded-2xl ${rowClass(row.mode)}`}>
                      {row.mode !== 'normal' && <div className={`absolute inset-x-0 top-0 h-1.5 ${issueBand(row.mode)}`} />}
                      <div className={`absolute inset-y-2 left-2 w-2 rounded-full ${theme.rail}`} />

                      <div className="pl-7 pr-3 py-2">
                        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="text-[23px] font-bold leading-none tracking-tight shrink-0">{row.team}</div>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`text-[12px] font-medium ${theme.accent}`}>{row.station}</div>
                              {row.mode !== 'blocking' && <IssueBadge mode={row.mode} />}
                            </div>
                          </div>

                          {row.mode === 'blocking' ? null : (
                            <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold text-center ring-1 ${stateTone(row.status || '', theme)}`}>
                              {shortState(row.status || '')}
                            </div>
                          )}
                        </div>

                        {row.mode === 'blocking' ? (
                          <div className="pt-2">
                            <div className="flex min-h-[48px] items-center justify-center rounded-2xl bg-amber-50 px-4 text-base font-bold tracking-wide text-amber-900 ring-2 ring-amber-300">
                              {row.blockingText}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="pt-2 flex items-center gap-2 border-t border-zinc-100">
                              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                                {row.ds && <HealthyChainItem {...row.ds} />}
                                {row.radio && <HealthyChainItem {...row.radio} />}
                                {row.rio && <HealthyChainItem {...row.rio} />}
                              </div>
                            </div>

                            <div className="pt-2 grid grid-cols-[auto_auto_1fr] gap-2 items-start border-t border-zinc-100 rounded-xl bg-zinc-50/50 px-2 pb-1">
                              <div className="pt-2">
                                <CompactMetricGroup title="Battery" emphasized={row.mode === 'critical'}>
                                  <div className="inline-flex items-baseline gap-1 px-1 py-0.5">
                                    <span className="text-[15px] font-semibold text-zinc-900">{row.battery?.value}</span>
                                  </div>
                                  <MetricPill label="Min" value={row.battery?.min || ''} />
                                </CompactMetricGroup>
                              </div>

                              <div className="pt-2">
                                <CompactMetricGroup title="BWU">
                                  <div className="inline-flex items-baseline gap-1 px-1 py-0.5">
                                    <span className="text-[15px] font-semibold text-zinc-900">{row.bwu?.value}</span>
                                  </div>
                                  <MetricPill label="Tx" value={row.bwu?.tx || ''} />
                                  <MetricPill label="Rx" value={row.bwu?.rx || ''} />
                                </CompactMetricGroup>
                              </div>

                              <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2">
                                <MetricPill label="Trip" value={row.trip || ''} />
                                <MetricPill label="Lost Pkts" value={row.pkts || ''} />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  function VisualConcept() {
    return (
      <div className="mt-12">
        <div className="mb-4 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200">
          <div className="text-sm font-semibold text-zinc-900">New visual language concept</div>
          <div className="mt-1 text-sm text-zinc-600">More icon led and distance readable for FTAs</div>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {alliancePanels.map((panel) => {
            const theme = panelTheme(panel.alliance);
            return (
              <section key={`visual-${panel.alliance}`} className={`rounded-3xl p-4 shadow-sm ring-1 ${theme.shell}`}>
                <div className={`mb-4 rounded-2xl px-4 py-3 text-lg font-semibold shadow-sm ${theme.header}`}>{panel.title}</div>
                <div className="space-y-3">
                  {panel.rows.map((row) => (
                    <div key={`visual-${panel.alliance}-${row.team}-${row.station}`} className={`relative overflow-hidden rounded-2xl ${rowClass(row.mode)}`}>
                      {row.mode !== 'normal' && <div className={`absolute inset-x-0 top-0 h-1.5 ${issueBand(row.mode)}`} />}
                      <div className={`absolute inset-y-2 left-2 w-2 rounded-full ${theme.rail}`} />

                      <div className="pl-7 pr-3 py-2.5">
                        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="text-[24px] font-bold leading-none tracking-tight shrink-0">{row.team}</div>
                            <div className={`text-[12px] font-medium ${theme.accent}`}>{row.station}</div>
                            {row.mode !== 'blocking' && <IssueBadge mode={row.mode} />}
                          </div>

                          {row.mode === 'blocking' ? null : (
                            <VisualStatusPill status={row.status || ''} theme={theme} />
                          )}
                        </div>

                        {row.mode === 'blocking' ? (
                          <div className="pt-2">
                            <div className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 text-base font-bold tracking-wide text-amber-900 ring-2 ring-amber-300">
                              <FontAwesomeIcon icon={faTriangleExclamation} className="h-5 w-5" />
                              {row.blockingText}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mt-2 grid grid-cols-3 gap-2.5 border-t border-zinc-100 pt-2.5">
                              <div className={`rounded-xl px-2.5 py-2 flex flex-col items-center justify-center ${row.ds?.state === 'good' ? 'bg-zinc-50/70' : 'bg-amber-50 ring-1 ring-amber-200'}`}>
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"><FontAwesomeIcon icon={faGamepad} className="h-3.5 w-3.5" /> DS</div>
                                {row.ds && <div className="mt-1 flex justify-center"><DsRioStateIcon state={row.ds.state} /></div>}
                              </div>

                              <div className={`rounded-xl px-2.5 py-2 ${row.radio?.state === 'good' ? 'bg-zinc-50/70' : 'bg-amber-50 ring-1 ring-amber-200'}`}>
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"><FontAwesomeIcon icon={faTowerBroadcast} className="h-3.5 w-3.5" /> Radio</div>
                                <div className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold text-zinc-900">
                                  <span>{row.radio?.state === 'good' ? 'Link' : row.radio?.state === 'warn' ? 'Low Signal' : 'Missing'}</span>
                                  <span className="text-[13px] tracking-tight">{radioBars(row.radio?.detail || '')}</span>
                                </div>
                              </div>

                              <div className={`rounded-xl px-2.5 py-2 flex flex-col items-center justify-center ${row.rio?.state === 'good' ? 'bg-zinc-50/70' : 'bg-amber-50 ring-1 ring-amber-200'}`}>
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"><FontAwesomeIcon icon={faMicrochip} className="h-3.5 w-3.5" /> RIO</div>
                                {row.rio && <div className="mt-1 flex justify-center"><DsRioStateIcon state={row.rio.state} /></div>}
                              </div>
                            </div>

                            <div className="mt-2 grid grid-cols-[1.2fr_1.15fr_0.9fr_1fr] gap-2.5 rounded-xl bg-zinc-50/60 px-2 py-2">
                              <div className={`rounded-xl px-2.5 py-2 ${row.mode === 'critical' ? 'bg-amber-50 ring-1 ring-amber-300' : 'bg-white/80'}`}>
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"><FontAwesomeIcon icon={faBatteryHalf} className="h-3.5 w-3.5" /> Battery</div>
                                <div className="mt-1 text-[18px] font-bold leading-none text-zinc-900">{row.battery?.value}</div>
                                <div className="mt-1 text-[11px] font-medium text-zinc-500">Min {row.battery?.min}</div>
                              </div>

                              <div className="rounded-xl bg-white/80 px-2.5 py-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"><FontAwesomeIcon icon={faRightLeft} className="h-3.5 w-3.5" /> BWU</div>
                                <div className="mt-1 text-[16px] font-semibold leading-none text-zinc-900">{row.bwu?.value}</div>
                                <div className="mt-1 flex gap-2 text-[11px] font-medium text-zinc-500"><span>Tx {row.bwu?.tx}</span><span>Rx {row.bwu?.rx}</span></div>
                              </div>

                              <div className="rounded-xl bg-white/80 px-2.5 py-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"><FontAwesomeIcon icon={faRoute} className="h-3.5 w-3.5" /> Trip</div>
                                <div className="mt-1 text-[15px] font-semibold text-zinc-900">{row.trip}</div>
                              </div>

                              <div className="rounded-xl bg-white/80 px-2.5 py-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500"><FontAwesomeIcon icon={faTriangleExclamation} className="h-3.5 w-3.5" /> Lost Pkts</div>
                                <div className="mt-1 text-[15px] font-semibold text-zinc-900">{row.pkts}</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  function DistanceConcept() {
    return (
      <div className="mt-12">
        <div className="mb-4 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200">
          <div className="text-sm font-semibold text-zinc-900">Distance first concept</div>
          <div className="mt-1 text-sm text-zinc-600">Refined for the real match case of 6 teams total, 3 per alliance, on a fullscreen 16 by 9 or 4 by 3 monitor</div>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {distancePanels.map((panel) => {
            const theme = panelTheme(panel.alliance);
            return (
              <section key={`distance-${panel.alliance}`} className={`rounded-3xl p-4 shadow-sm ring-1 ${theme.shell}`}>
                <div className={`mb-4 rounded-2xl px-4 py-3 text-xl font-semibold shadow-sm ${theme.header}`}>{panel.title}</div>

                <div className="space-y-3">
                  {panel.rows.map((row) => {
                    const isBlocking = row.mode === 'blocking';
                    const isCritical = row.mode === 'critical';
                    const isDegraded = row.mode === 'degraded';

                    return (
                      <div key={`distance-${panel.alliance}-${row.team}-${row.station}`} className={`relative overflow-hidden rounded-3xl bg-white ${isCritical ? 'ring-2 ring-amber-400 shadow-sm' : isDegraded ? 'ring-2 ring-amber-200' : isBlocking ? 'ring-2 ring-amber-400 shadow-sm' : 'ring-1 ring-zinc-200'}`}>
                        {row.mode !== 'normal' && <div className={`absolute inset-x-0 top-0 h-2 ${issueBand(row.mode)}`} />}
                        <div className={`absolute inset-y-0 left-0 w-4 ${theme.rail}`} />

                        <div className="pl-8 pr-4 py-3">
                          <div className="grid grid-cols-[126px_1fr_150px] items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-[32px] font-bold leading-none tracking-tight">{row.team}</div>
                                {row.mode !== 'blocking' && <IssueBadge mode={row.mode} />}
                              </div>
                              <div className={`mt-1 text-[15px] font-semibold ${theme.accent}`}>{row.station}</div>
                            </div>

                            {isBlocking ? (
                              <div className="flex h-[76px] items-center justify-center rounded-2xl bg-amber-50 text-center text-[22px] font-bold tracking-wide text-amber-900 ring-2 ring-amber-300">
                                {row.blockingText}
                              </div>
                            ) : (
                              <div className="grid grid-cols-4 gap-2.5">
                                <div className={`rounded-2xl px-3 py-3 flex flex-col items-center justify-center ${row.ds?.state === 'good' ? 'bg-zinc-50' : row.ds?.state === 'warn' ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-amber-100 ring-2 ring-amber-300'}`}>
                                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">DS</div>
                                  {row.ds && <div className="mt-2 flex justify-center"><DsRioStateIcon state={row.ds.state} /></div>}
                                </div>

                                <div className={`rounded-2xl px-3 py-3 text-center ${row.radio?.state === 'good' ? 'bg-zinc-50' : row.radio?.state === 'warn' ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-amber-100 ring-2 ring-amber-300'}`}>
                                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">RADIO</div>
                                  <div className="mt-1.5 flex min-h-[32px] items-center justify-center text-[18px] font-bold leading-none tracking-tight text-zinc-900">{radioBars(row.radio?.detail || '')}</div>
                                </div>

                                <div className={`rounded-2xl px-3 py-3 flex flex-col items-center justify-center ${row.rio?.state === 'good' ? 'bg-zinc-50' : row.rio?.state === 'warn' ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-amber-100 ring-2 ring-amber-300'}`}>
                                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">RIO</div>
                                  {row.rio && <div className="mt-2 flex justify-center"><DsRioStateIcon state={row.rio.state} /></div>}
                                </div>

                                <div className={`rounded-2xl px-3 py-3 text-center ${isCritical ? 'bg-amber-50 ring-2 ring-amber-300' : 'bg-zinc-50'}`}>
                                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">BATT</div>
                                  <div className="mt-1.5 flex min-h-[32px] items-center justify-center text-[22px] font-bold leading-none text-zinc-900">{row.battery?.value}</div>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end">
                              {isBlocking ? (
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-[14px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-300">
                                  <AlertTriangle className="h-4 w-4" /> Hold
                                </div>
                              ) : (
                                <div className={`inline-flex min-w-[136px] items-center justify-center rounded-2xl px-4 py-3 text-[15px] font-bold uppercase tracking-wide ring-2 ${stateTone(row.status || '', theme)}`}>
                                  {shortState(row.status || '')}
                                </div>
                              )}
                            </div>
                          </div>

                          {!isBlocking && (
                            <div className="mt-2.5 grid grid-cols-[1.25fr_1.35fr_0.8fr_0.95fr] gap-2.5 rounded-2xl bg-zinc-50/70 px-2.5 py-2">
                              <div className={`rounded-2xl px-3 py-2.5 ${isCritical ? 'bg-amber-50/80' : 'bg-white/80'}`}>
                                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Battery Detail</div>
                                <div className="mt-1 flex items-end gap-3">
                                  <div className="text-[21px] font-bold leading-none text-zinc-900">{row.battery?.value}</div>
                                  <div className="text-[13px] font-semibold text-zinc-500">Min {row.battery?.min}</div>
                                </div>
                              </div>

                              <div className="rounded-2xl bg-white/80 px-3 py-2.5">
                                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Bandwidth</div>
                                <div className="mt-1 text-[17px] font-bold leading-none text-zinc-900">{row.bwu?.value}</div>
                                <div className="mt-1 text-[12px] font-semibold text-zinc-500">Tx {row.bwu?.tx}  Rx {row.bwu?.rx}</div>
                              </div>

                              <div className="rounded-2xl bg-white/80 px-3 py-2.5 text-center">
                                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Trip</div>
                                <div className="mt-1 text-[17px] font-bold text-zinc-900">{row.trip}</div>
                              </div>

                              <div className="rounded-2xl bg-white/80 px-3 py-2.5 text-center">
                                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Lost Pkts</div>
                                <div className="mt-1 text-[17px] font-bold text-zinc-900">{row.pkts}</div>
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
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-6 text-zinc-900">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">FIRST Field Monitor Split View Mockups</h1>
          <p className="mt-1 text-sm text-zinc-600">Baseline concept is frozen. Below it are two additional directions with stronger visual language and distance readable cues for FTAs.</p>
        </div>

        <OriginalConcept />
        <VisualConcept />
        <DistanceConcept />

        <div className="mt-8 rounded-2xl bg-white p-5 text-sm text-zinc-700 shadow-sm ring-1 ring-zinc-200">
          <div className="font-semibold text-zinc-900">Issue treatment update</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The left issue indicator was removed from every concept.</li>
            <li>Issue rows now use a top issue band plus a compact severity badge near the team and station block.</li>
            <li>Blocking rows no longer show the extra Assignment label.</li>
            <li>Issue cells keep stronger borders while healthy cells stay flatter.</li>
            <li>Battery and Radio tiles in the distance concept were adjusted so the value sits cleanly inside the tile.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
