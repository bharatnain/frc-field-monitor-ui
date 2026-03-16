import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BatteryMedium,
  Activity,
  ArrowUpDown,
  Radio,
  Cpu,
  Gamepad2,
  AlertTriangle,
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
import { useFieldMonitorLiveData } from '../lib/fieldMonitorLive';

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

export default function FieldMonitorMockups() {
  const [searchParams] = useSearchParams();
  const [recordingLabel, setRecordingLabel] = React.useState('');
  const redOnRight = searchParams.get('redonright') !== 'false';
  const { sourceMode, alliancePanels, matchStatus, aheadBehind, error, isConnected, hasLiveData, recorder, replay } =
    useFieldMonitorLiveData({
      redOnRight,
    });

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
          : status === 'Auto Disabled'
            ? 'AUTO DISABLED'
            : status === 'E-STOPPED'
              ? 'E-STOP'
              : status === 'A-STOPPED'
                ? 'A-STOP'
                : status;

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
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide ${
            state === 'good' ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
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

  function MetricPill({
    label,
    value,
    emphasized = false,
  }: {
    label: string;
    value: string;
    emphasized?: boolean;
  }) {
    return (
      <div
        className={`inline-flex items-baseline gap-1 rounded-full px-2 py-1 ${
          emphasized ? 'bg-zinc-100 ring-1 ring-zinc-300' : 'bg-transparent'
        }`}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
        <span className={`${emphasized ? 'text-[15px]' : 'text-sm'} font-semibold text-zinc-900`}>{value}</span>
      </div>
    );
  }

  function CompactMetricGroup({
    title,
    children,
    emphasized = false,
  }: {
    title: string;
    children: React.ReactNode;
    emphasized?: boolean;
  }) {
    return (
      <div className={`rounded-xl px-2 py-1 ${emphasized ? 'bg-zinc-100 ring-1 ring-zinc-300' : 'bg-zinc-50/70'}`}>
        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">{children}</div>
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
                <div className={`mb-4 rounded-2xl px-4 py-3 text-lg font-semibold shadow-sm ${theme.header}`}>
                  {panel.title}
                </div>
                <div className="space-y-2.5">
                  {panel.rows.map((row) => (
                    <div key={`${panel.alliance}-${row.team}-${row.station}`} className={`relative overflow-hidden rounded-2xl ${rowClass(row.mode)}`}>
                      {row.mode !== 'normal' && <div className={`absolute inset-x-0 top-0 h-1.5 ${issueBand(row.mode)}`} />}
                      <div className={`absolute inset-y-2 left-2 w-2 rounded-full ${theme.rail}`} />

                      <div className="py-2 pl-7 pr-3">
                        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="shrink-0 text-[23px] font-bold leading-none tracking-tight">{row.team}</div>
                            <div className="flex min-w-0 items-center gap-2">
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
                            <div className="flex items-center gap-2 border-t border-zinc-100 pt-2">
                              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                                {row.ds && <HealthyChainItem {...row.ds} />}
                                {row.radio && <HealthyChainItem {...row.radio} />}
                                {row.rio && <HealthyChainItem {...row.rio} />}
                              </div>
                            </div>

                            <div className="grid grid-cols-[auto_auto_1fr] items-start gap-2 rounded-xl border-t border-zinc-100 bg-zinc-50/50 px-2 pb-1 pt-2">
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

                      <div className="px-3 py-2.5 pl-7">
                        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="shrink-0 text-[24px] font-bold leading-none tracking-tight">{row.team}</div>
                            <div className={`text-[12px] font-medium ${theme.accent}`}>{row.station}</div>
                            {row.mode !== 'blocking' && <IssueBadge mode={row.mode} />}
                          </div>

                          {row.mode === 'blocking' ? null : <VisualStatusPill status={row.status || ''} theme={theme} />}
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
                              <div
                                className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-2 ${
                                  row.ds?.state === 'good' ? 'bg-zinc-50/70' : 'bg-amber-50 ring-1 ring-amber-200'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                  <FontAwesomeIcon icon={faGamepad} className="h-3.5 w-3.5" /> DS
                                </div>
                                {row.ds && <div className="mt-1 flex justify-center"><DsRioStateIcon state={row.ds.state} /></div>}
                              </div>

                              <div className={`rounded-xl px-2.5 py-2 ${row.radio?.state === 'good' ? 'bg-zinc-50/70' : 'bg-amber-50 ring-1 ring-amber-200'}`}>
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                  <FontAwesomeIcon icon={faTowerBroadcast} className="h-3.5 w-3.5" /> Radio
                                </div>
                                <div className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold text-zinc-900">
                                  <span>
                                    {row.radio?.state === 'good'
                                      ? 'Link'
                                      : row.radio?.state === 'warn'
                                        ? 'Low Signal'
                                        : 'Missing'}
                                  </span>
                                  <span className="text-[13px] tracking-tight">{radioBars(row.radio?.detail || '')}</span>
                                </div>
                              </div>

                              <div
                                className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-2 ${
                                  row.rio?.state === 'good' ? 'bg-zinc-50/70' : 'bg-amber-50 ring-1 ring-amber-200'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                  <FontAwesomeIcon icon={faMicrochip} className="h-3.5 w-3.5" /> RIO
                                </div>
                                {row.rio && <div className="mt-1 flex justify-center"><DsRioStateIcon state={row.rio.state} /></div>}
                              </div>
                            </div>

                            <div className="mt-2 grid grid-cols-[1.2fr_1.15fr_0.9fr_1fr] gap-2.5 rounded-xl bg-zinc-50/60 px-2 py-2">
                              <div className={`rounded-xl px-2.5 py-2 ${row.mode === 'critical' ? 'bg-amber-50 ring-1 ring-amber-300' : 'bg-white/80'}`}>
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                  <FontAwesomeIcon icon={faBatteryHalf} className="h-3.5 w-3.5" /> Battery
                                </div>
                                <div className="mt-1 text-[18px] font-bold leading-none text-zinc-900">{row.battery?.value}</div>
                                <div className="mt-1 text-[11px] font-medium text-zinc-500">Min {row.battery?.min}</div>
                              </div>

                              <div className="rounded-xl bg-white/80 px-2.5 py-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                  <FontAwesomeIcon icon={faRightLeft} className="h-3.5 w-3.5" /> BWU
                                </div>
                                <div className="mt-1 text-[16px] font-semibold leading-none text-zinc-900">{row.bwu?.value}</div>
                                <div className="mt-1 flex gap-2 text-[11px] font-medium text-zinc-500">
                                  <span>Tx {row.bwu?.tx}</span>
                                  <span>Rx {row.bwu?.rx}</span>
                                </div>
                              </div>

                              <div className="rounded-xl bg-white/80 px-2.5 py-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                  <FontAwesomeIcon icon={faRoute} className="h-3.5 w-3.5" /> Trip
                                </div>
                                <div className="mt-1 text-[15px] font-semibold text-zinc-900">{row.trip}</div>
                              </div>

                              <div className="rounded-xl bg-white/80 px-2.5 py-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                  <FontAwesomeIcon icon={faTriangleExclamation} className="h-3.5 w-3.5" /> Lost Pkts
                                </div>
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

  return (
    <div className="min-h-screen bg-zinc-100 p-6 text-zinc-900">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">FIRST Field Monitor Split View Mockups</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {sourceMode === 'replay'
              ? 'A saved match recording is driving both concepts below. The layout side order follows the `redonright` query param.'
              : 'Live FMS data is feeding both concepts below. The layout side order follows the `redonright` query param.'}
          </p>
        </div>

        <div className="mb-6 grid gap-3 lg:grid-cols-[auto_auto_1fr]">
          <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Connection</div>
            <div className={`mt-1 text-sm font-semibold ${isConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
              {sourceMode === 'replay'
                ? replay.isPlaying
                  ? 'Replay playing'
                  : 'Replay paused'
                : isConnected
                  ? 'Live feed connected'
                  : 'Connecting to live feed'}
            </div>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Match</div>
            <div className="mt-1 text-sm font-semibold text-zinc-900">
              {matchStatus.matchNumber > 0 ? `M${matchStatus.matchNumber}` : 'No match yet'}
              {aheadBehind ? ` · ${aheadBehind}` : ''}
            </div>
            <div className="mt-1 text-sm text-zinc-600">{matchStatus.matchStateMessage}</div>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Feed Notes</div>
            <div className="mt-1 text-sm text-zinc-700">
              {sourceMode === 'replay'
                ? replay.error
                  ? replay.error
                  : replay.fileName
                    ? `Rendering from ${replay.fileName} at ${replay.speed}x speed.`
                    : 'Replay mode is ready for a recording file.'
                : error
                  ? error
                  : hasLiveData
                    ? 'SignalR station updates are active and the mockups are rendering live rows.'
                    : 'Waiting for the first station payload from the field monitor hubs.'}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-900">Recorder and replay</div>
              <div className="mt-1 text-sm text-zinc-600">
                Capture live SignalR traffic as JSON, then load that file back in to replay the match offline through the same UI.
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                {sourceMode === 'replay'
                  ? replay.fileName
                    ? `Replay loaded from ${replay.fileName} with ${replay.eventCount} events.`
                    : 'Load a saved recording to enter replay mode.'
                  : recorder.isRecording
                    ? `Recording ${recorder.eventCount} events${recorder.startedAtIso ? ` since ${new Date(recorder.startedAtIso).toLocaleTimeString()}` : ''}.`
                    : recorder.lastDownloadName
                      ? `Last saved ${recorder.lastEventCount} events to ${recorder.lastDownloadName}.`
                      : 'Ready to capture a live match.'}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-blue-500 hover:text-blue-700">
                  Load replay JSON
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        await replay.loadReplayFile(file);
                      }
                      event.target.value = '';
                    }}
                  />
                </label>

                {sourceMode === 'replay' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => (replay.isPlaying ? replay.pauseReplay() : replay.resumeReplay())}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      {replay.isPlaying ? 'Pause replay' : 'Resume replay'}
                    </button>
                    <button
                      type="button"
                      onClick={() => replay.restartReplay()}
                      className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      Restart replay
                    </button>
                    <button
                      type="button"
                      onClick={() => replay.clearReplay()}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-300 transition hover:bg-zinc-50"
                    >
                      Return to live
                    </button>
                    <select
                      value={String(replay.speed)}
                      onChange={(event) => replay.setReplaySpeed(Number(event.target.value))}
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500"
                    >
                      {replay.speedOptions.map((speed) => (
                        <option key={speed} value={speed}>
                          {speed}x
                        </option>
                      ))}
                    </select>
                  </>
                ) : null}
              </div>

              {sourceMode === 'live' ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={recordingLabel}
                    onChange={(event) => setRecordingLabel(event.target.value)}
                    disabled={recorder.isRecording}
                    placeholder="Optional label, e.g. qm-42"
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-blue-500 sm:w-64"
                  />
                  {recorder.isRecording ? (
                    <button
                      type="button"
                      onClick={() => recorder.stopRecordingAndDownload()}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Stop and download
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => recorder.startRecording(recordingLabel)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Start recording
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-zinc-500">
                  Replay time {Math.round(replay.currentTimeMs / 100) / 10}s / {Math.round(replay.durationMs / 100) / 10}s
                </div>
              )}
            </div>
          </div>
        </div>

        {sourceMode === 'replay' ? (
          <div className="mb-6 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900 ring-1 ring-blue-200">
            Live SignalR is disconnected while replay mode is active. Use `Return to live` to reconnect to the field.
          </div>
        ) : null}

        <OriginalConcept />
        <VisualConcept />

        <div className="mt-8 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200">
          <Link
            to={`/distance-first?redonright=${redOnRight}`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            Distance first concept →
          </Link>
          <div className="mt-1 text-sm text-zinc-600">
            Refined for 6 teams on fullscreen 16:9 or 4:3 using the same live field data feed.
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-5 text-sm text-zinc-700 shadow-sm ring-1 ring-zinc-200">
          <div className="font-semibold text-zinc-900">Live mapping notes</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>`TEAM MISMATCH` and `MOVE TO ...` rows are driven from live station status values.</li>
            <li>DS, Radio, and RIO states are inferred from the same connection flags used by the live Angular field monitor.</li>
            <li>Battery minimum is tracked over time per station while the hubs stay connected.</li>
            <li>Severity bands are derived from live connection quality, battery, bandwidth, trip time, and packet loss.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
