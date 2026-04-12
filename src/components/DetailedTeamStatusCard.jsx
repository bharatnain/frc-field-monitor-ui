import { Fragment, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faCircleExclamation,
  faMicrochip,
  faSignal,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import MiniSparkline from './MiniSparkline';

const panelTheme = (alliance) =>
  alliance === 'red'
    ? {
        shell: 'ring-red-200 shadow-red-950/10',
        headerBand: 'border-b border-red-200 bg-red-50',
        stationBadge: 'bg-white text-red-900 ring-red-200',
        teamText: 'text-red-950',
      }
    : {
        shell: 'ring-blue-200 shadow-blue-950/10',
        headerBand: 'border-b border-blue-200 bg-blue-50',
        stationBadge: 'bg-white text-blue-900 ring-blue-200',
        teamText: 'text-blue-950',
      };

const issueLabel = (mode) => {
  if (mode === 'estopped') return 'E-STOP';
  if (mode === 'bypassed') return 'BYPASS';
  if (mode === 'astopped') return 'A-STOP';
  if (mode === 'critical') return 'Critical';
  if (mode === 'degraded') return 'Warning';
  if (mode === 'blocking') return 'Action';
  return '';
};

const issueTone = (mode) => {
  if (mode === 'estopped' || mode === 'bypassed') return 'bg-rose-600 text-white ring-rose-700';
  if (mode === 'critical' || mode === 'blocking') return 'bg-amber-600 text-white ring-amber-700';
  if (mode === 'astopped' || mode === 'degraded') return 'bg-amber-100 text-amber-950 ring-amber-300';
  return 'bg-zinc-100 text-zinc-700 ring-zinc-200';
};

const toneClass = (tone) => {
  if (tone === 'bad' || tone === 'danger' || tone === 'critical') {
    return 'border-rose-200 bg-rose-50 text-rose-950';
  }

  if (tone === 'warn') {
    return 'border-amber-200 bg-amber-50 text-amber-950';
  }

  if (tone === 'auto') {
    return 'border-violet-200 bg-violet-50 text-violet-900';
  }

  if (tone === 'tele') {
    return 'border-sky-200 bg-sky-50 text-sky-900';
  }

  if (tone === 'good') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  }

  return 'border-zinc-200 bg-white text-zinc-900';
};

function StationBadge({ station, theme }) {
  return (
    <div className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.1em] ring-1 ${theme.stationBadge}`}>
      {station}
    </div>
  );
}

function Section({ title, icon, collapsible = false, collapseSignal, children }) {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const appliedVersionRef = useRef(0);

  let collapsed = localCollapsed;
  if (collapseSignal && collapseSignal.version !== appliedVersionRef.current) {
    collapsed = collapseSignal.target;
  }

  useEffect(() => {
    if (collapseSignal && collapseSignal.version !== appliedVersionRef.current) {
      appliedVersionRef.current = collapseSignal.version;
      setLocalCollapsed(collapseSignal.target);
    }
  }, [collapseSignal]);

  return (
    <section className="space-y-1.5 border-t border-zinc-100 pt-2 first:border-t-0 first:pt-0">
      <div
        className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500 ${collapsible ? 'cursor-pointer select-none' : ''}`}
        onClick={collapsible ? () => setLocalCollapsed((c) => !c) : undefined}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? !collapsed : undefined}
      >
        <FontAwesomeIcon icon={icon} className="h-3 w-3" />
        <span className="flex-1">{title}</span>
        {collapsible && (
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`h-2.5 w-2.5 transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`}
          />
        )}
      </div>
      {(!collapsible || !collapsed) && children}
    </section>
  );
}

function PrimaryMetricTile({ label, value, detail = '', tone = 'neutral', testId }) {
  return (
    <div
      data-testid={testId}
      className={`rounded-lg border px-2.5 py-2 ${toneClass(tone)}`}
    >
      <div className="text-[9px] font-black uppercase tracking-[0.14em] opacity-70">{label}</div>
      <div className="mt-0.5 text-[15px] font-bold leading-tight">{value}</div>
      {detail ? <div className="mt-0.5 text-[11px] font-medium opacity-80">{detail}</div> : null}
    </div>
  );
}

function InlineFlagList({ flags, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] ${className}`}>
      {flags.map((flag) => (
        <div key={flag.label} className="inline-flex items-center gap-0.5">
          <span className="font-bold uppercase tracking-[0.06em] text-zinc-500">{flag.label}</span>
          <span
            className={
              flag.tone === 'bad'
                ? 'font-semibold text-rose-700'
                : flag.tone === 'warn'
                  ? 'font-semibold text-amber-700'
                  : 'font-medium text-zinc-600'
            }
          >
            {flag.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function DetailGrid({ items, columns = 2 }) {
  const xlCols = {
    2: '',
    3: 'xl:grid-cols-[auto_1fr_auto_1fr_auto_1fr]',
    4: 'xl:grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1fr]',
  };
  const colClass = `grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto_1fr] ${xlCols[columns] || ''}`;
  return (
    <dl className={`grid items-baseline gap-x-2 gap-y-0.5 sm:gap-x-3 ${colClass}`}>
      {items.map((item) => (
        <Fragment key={item.label}>
          <dt className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500">{item.label}</dt>
          <dd data-testid={item.testId} className="text-sm font-semibold tabular-nums text-zinc-900">{item.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

function SparklineRow({ tripData, snrData, bandwidthData }) {
  if (!tripData.length && !snrData.length && !bandwidthData.length) return null;
  return (
    <div className="flex gap-3">
      <MiniSparkline label="Avg Trip" data={tripData} unit="ms" color="#6366f1" />
      <MiniSparkline label="SNR" data={snrData} unit="dB" color="#10b981" />
      <MiniSparkline label="Data Rate" data={bandwidthData} unit="Mbps" color="#f59e0b" decimals={1} />
    </div>
  );
}

function CompactStatLine({ items }) {
  return (
    <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px]">
      {items.map((item) => (
        <div key={item.label} className="inline-flex items-baseline gap-0.5">
          <span className="font-bold uppercase tracking-[0.06em] text-zinc-500">{item.label}</span>
          <span className="font-semibold tabular-nums text-zinc-700">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DetailedTeamStatusCard({ alliance, row, collapseSignal }) {
  const theme = panelTheme(alliance);
  const teamKnown = row.team && row.team !== '----';
  const teamLabel = teamKnown ? row.team : 'Unassigned';
  const healthDetail = row.health.battery.action
    ? `Min ${row.health.battery.min} · ${row.health.battery.action}`
    : `Min ${row.health.battery.min}`;
  const robotStateSummary = `${row.robotState.enabledLabel} · ${row.robotState.phaseLabel} · Stop ${row.robotState.stopLabel}`;

  return (
    <article
      className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${theme.shell}`}
      data-testid="diagnostics-card"
      aria-label={`Team ${teamLabel}, ${row.station}`}
    >
      <header className={`px-3 py-2 sm:px-4 ${theme.headerBand}`}>
        <div className="flex items-center gap-2">
          <StationBadge station={row.station} theme={theme} />
          {issueLabel(row.mode) ? (
            <div className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ring-1 ${issueTone(row.mode)}`}>
              {issueLabel(row.mode)}
            </div>
          ) : null}
          <div
            className={`min-w-0 flex-1 truncate text-xl font-black leading-none tracking-tight ${theme.teamText}`}
            data-testid="diagnostics-team-number"
          >
            {teamLabel}
          </div>
          <div className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ring-1 ${toneClass(row.status.tone)}`}>
            {row.status.shortLabel}
          </div>
        </div>
        {!teamKnown ? (
          <p className="mt-1 text-xs font-semibold text-zinc-700">No team assigned for this station yet.</p>
        ) : null}
        {row.blockingText ? (
          <div className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-950 ring-1 ring-amber-300">
            <FontAwesomeIcon icon={faCircleExclamation} className="h-3.5 w-3.5 shrink-0 text-amber-700" />
            <span>{row.blockingText}</span>
          </div>
        ) : row.status.detail ? (
          <p className="mt-1.5 text-xs font-medium text-zinc-700">{row.status.detail}</p>
        ) : null}
      </header>

      <div className="space-y-2 p-3 sm:px-4">
        <Section title="Robot State" icon={faMicrochip} collapsible collapseSignal={collapseSignal}>
          <div className="text-[13px] font-semibold text-zinc-900">{robotStateSummary}</div>
          {row.isPostMatchMuted ? (
            <p className="text-[10px] font-medium text-zinc-500">Post-match disconnects muted.</p>
          ) : null}
          <DetailGrid
            columns={4}
            items={[
              { label: 'Monitor', value: row.evidence.monitorStatus },
              { label: 'Station', value: row.evidence.stationStatus },
              { label: 'Move To', value: row.evidence.moveToStation },
              { label: 'MAC', value: row.evidence.macAddress },
            ]}
          />
          <InlineFlagList flags={row.evidence.flags} className="text-[9px]" />
        </Section>

        <Section title="Status" icon={faWifi} collapsible collapseSignal={collapseSignal}>
          <DetailGrid
            columns={4}
            items={[
              {
                label: 'DS',
                value: `${row.control.ds.state === 'bad' ? 'Out' : row.control.ds.state === 'warn' ? 'Warn' : 'Link'} · ${row.control.ds.detail}`,
                testId: 'diagnostics-ds-tile',
              },
              {
                label: 'Radio',
                value: `${row.control.radio.detail.toUpperCase()} · ${row.network.quality.label}`,
                testId: 'diagnostics-radio-tile',
              },
              {
                label: 'RIO',
                value: `${row.control.rio.state === 'bad' ? 'Out' : row.control.rio.state === 'warn' ? 'Warn' : 'Online'} · ${row.control.rio.detail}`,
                testId: 'diagnostics-rio-tile',
              },
              {
                label: 'Battery',
                value: `${row.health.battery.value} · ${healthDetail}`,
                testId: 'diagnostics-battery-tile',
              },
            ]}
          />
          <InlineFlagList flags={[...row.control.flags, ...row.health.flags]} />
        </Section>

        <Section title="Network" icon={faSignal}>
          <SparklineRow
            tripData={row.network.history.trip}
            snrData={row.network.history.snr}
            bandwidthData={row.network.history.bandwidth}
          />
          <DetailGrid
            columns={4}
            items={[
              { label: 'Tx / Rx (Field AP)', value: `${row.network.tx} / ${row.network.rx}` },
              { label: 'Lost Packets', value: row.network.loss },
              { label: 'Signal', value: row.network.signal },
              { label: 'Noise', value: row.network.noise },
              { label: 'Inactivity', value: row.network.inactivity },
              { label: 'Rx Packets', value: row.network.rxPackets },
              { label: 'Rx MCS Bandwidth', value: row.network.rxMcsBandwidth },
              { label: 'Rx VHT', value: row.network.rxVht },
              { label: 'Rx VHT NSS', value: row.network.rxVhtNss },
            ]}
          />
        </Section>
      </div>
    </article>
  );
}
