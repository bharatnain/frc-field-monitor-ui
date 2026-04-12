import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBatteryHalf,
  faCircleExclamation,
  faClipboardCheck,
  faMicrochip,
  faSignal,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';

const panelTheme = (alliance) =>
  alliance === 'red'
    ? {
        shell: 'ring-red-200 shadow-red-950/10',
        headerBand: 'border-b border-red-200 bg-red-50',
        stationBadge: 'bg-white text-red-900 ring-red-200',
        kicker: 'text-red-800',
        teamText: 'text-red-950',
      }
    : {
        shell: 'ring-blue-200 shadow-blue-950/10',
        headerBand: 'border-b border-blue-200 bg-blue-50',
        stationBadge: 'bg-white text-blue-900 ring-blue-200',
        kicker: 'text-blue-800',
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
    <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.1em] ring-1 ${theme.stationBadge}`}>
      {station}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-600">
        <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
}

function KeyValueRow({ label, value, detail = '', tone = 'neutral', testId }) {
  return (
    <div
      data-testid={testId}
      className={`rounded-xl border px-3 py-2.5 shadow-sm ${toneClass(tone)}`}
    >
      <div className="text-[10px] font-black uppercase tracking-[0.14em] opacity-70">{label}</div>
      <div className="mt-1 text-base font-bold leading-tight">{value}</div>
      {detail ? <div className="mt-1 text-xs font-medium opacity-80">{detail}</div> : null}
    </div>
  );
}

function FlagChip({ label, value, tone }) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${toneClass(tone)}`}>
      <span className="uppercase tracking-[0.08em] opacity-70">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function LabelValueList({ items }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-zinc-200 bg-white px-3 py-2">
          <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">{item.label}</dt>
          <dd className="mt-1 text-sm font-semibold text-zinc-900">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function DetailedTeamStatusCard({ alliance, row }) {
  const theme = panelTheme(alliance);
  const teamKnown = row.team && row.team !== '----';
  const teamLabel = teamKnown ? row.team : 'Unassigned';
  const healthDetail = row.health.battery.action
    ? `Min ${row.health.battery.min} · ${row.health.battery.action}`
    : `Min ${row.health.battery.min}`;

  return (
    <article
      className={`overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ${theme.shell}`}
      data-testid="diagnostics-card"
      aria-label={`Team ${teamLabel}, ${row.station}`}
    >
      <header className={`px-4 py-3 sm:px-5 ${theme.headerBand}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StationBadge station={row.station} theme={theme} />
              {issueLabel(row.mode) ? (
                <div className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] ring-1 ${issueTone(row.mode)}`}>
                  {issueLabel(row.mode)}
                </div>
              ) : null}
            </div>
            <div className={`mt-3 text-[10px] font-black uppercase tracking-[0.2em] ${theme.kicker}`}>Team</div>
            <div
              className={`mt-1 text-[clamp(1.9rem,5vw,3rem)] font-black leading-none tracking-tight ${theme.teamText}`}
              data-testid="diagnostics-team-number"
            >
              {teamLabel}
            </div>
            {!teamKnown ? (
              <p className="mt-2 text-sm font-semibold text-zinc-700">No team assigned for this station yet.</p>
            ) : null}
            {row.blockingText ? (
              <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950 ring-1 ring-amber-300">
                <FontAwesomeIcon icon={faCircleExclamation} className="h-4 w-4 shrink-0 text-amber-700" />
                <span>{row.blockingText}</span>
              </div>
            ) : row.status.detail ? (
              <p className="mt-3 text-sm font-medium text-zinc-700">{row.status.detail}</p>
            ) : null}
          </div>

          <div className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ring-1 ${toneClass(row.status.tone)}`}>
            {row.status.shortLabel}
          </div>
        </div>
      </header>

      <div className="space-y-3 p-3 sm:p-4">
        <Section title="Identity / Robot State" icon={faMicrochip}>
          <LabelValueList
            items={[
              { label: 'Status', value: row.status.label },
              { label: 'Control', value: row.robotState.enabledLabel },
              { label: 'Phase', value: row.robotState.phaseLabel },
              { label: 'Stop', value: row.robotState.stopLabel },
            ]}
          />
          {row.isPostMatchMuted ? (
            <p className="mt-2 text-xs font-medium text-zinc-500">Post-match disconnects are muted for this station.</p>
          ) : null}
        </Section>

        <Section title="Connection Path" icon={faWifi}>
          <div className="grid gap-2 md:grid-cols-3">
            <KeyValueRow
              label="DS"
              value={row.control.ds.state === 'bad' ? 'Out' : row.control.ds.state === 'warn' ? 'Warn' : 'Link'}
              detail={row.control.ds.detail}
              tone={row.control.ds.state}
              testId="diagnostics-ds-tile"
            />
            <KeyValueRow
              label="Radio"
              value={row.control.radio.detail.toUpperCase()}
              detail={row.network.quality.label}
              tone={row.control.radio.state}
              testId="diagnostics-radio-tile"
            />
            <KeyValueRow
              label="RIO"
              value={row.control.rio.state === 'bad' ? 'Out' : row.control.rio.state === 'warn' ? 'Warn' : 'Online'}
              detail={row.control.rio.detail}
              tone={row.control.rio.state}
              testId="diagnostics-rio-tile"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {row.control.flags.map((flag) => (
              <FlagChip key={flag.label} label={flag.label} value={flag.value} tone={flag.tone} />
            ))}
          </div>
        </Section>

        <Section title="Network" icon={faSignal}>
          <div className="grid gap-2 sm:grid-cols-2">
            <KeyValueRow label="Radio Quality" value={row.network.quality.label} detail={row.network.quality.value} tone={row.network.quality.tone} />
            <KeyValueRow
              label="Bandwidth"
              value={row.network.bandwidth}
              detail={`Tx ${row.network.tx} / Rx ${row.network.rx}`}
              tone={row.network.quality.tone}
              testId="diagnostics-bandwidth-tile"
            />
            <KeyValueRow label="Trip" value={row.network.trip} detail="Average round trip" tone="neutral" />
            <KeyValueRow label="Loss" value={row.network.loss} detail="Dropped packets" tone={row.mode === 'critical' ? 'warn' : 'neutral'} />
          </div>
          <div className="mt-2">
            <LabelValueList
              items={[
                { label: 'Signal', value: row.network.signal },
                { label: 'Noise', value: row.network.noise },
                { label: 'SNR', value: row.network.snr },
                { label: 'Inactivity', value: row.network.inactivity },
                { label: 'Rx Packets', value: row.network.rxPackets },
                { label: 'Rx MCS BW', value: row.network.rxMcsBandwidth },
                { label: 'Rx VHT', value: row.network.rxVht },
                { label: 'Rx VHT NSS', value: row.network.rxVhtNss },
              ]}
            />
          </div>
        </Section>

        <Section title="Health" icon={faBatteryHalf}>
          <div className="grid gap-2 sm:grid-cols-2">
            <KeyValueRow
              label="Battery"
              value={row.health.battery.value}
              detail={healthDetail}
              tone={row.health.battery.tone}
              testId="diagnostics-battery-tile"
            />
            <KeyValueRow label="Battery State" value={row.health.battery.detail || 'Stable'} tone={row.health.battery.tone} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {row.health.flags.map((flag) => (
              <FlagChip key={flag.label} label={flag.label} value={flag.value} tone={flag.tone} />
            ))}
          </div>
        </Section>

        <Section title="Evidence" icon={faClipboardCheck}>
          <LabelValueList
            items={[
              { label: 'Monitor', value: row.evidence.monitorStatus },
              { label: 'Station', value: row.evidence.stationStatus },
              { label: 'Move To', value: row.evidence.moveToStation },
              { label: 'MAC', value: row.evidence.macAddress },
            ]}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {row.evidence.flags.map((flag) => (
              <FlagChip key={flag.label} label={flag.label} value={flag.value} tone={flag.tone} />
            ))}
          </div>
        </Section>
      </div>
    </article>
  );
}
