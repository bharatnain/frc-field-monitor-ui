import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';

const RECORDING_FILE_VERSION = 1;
const DEFAULT_REPLAY_SPEED = 1;
const REPLAY_SPEED_OPTIONS = [0.5, 1, 2, 4];
const BROWNOUT_LATCH_TICKS = 6;

let activeReplayRecording = null;
let activeReplayFileName = '';

const AllianceType = {
  None: 0,
  Red: 1,
  Blue: 2,
};

const StationType = {
  None: 0,
  Station1: 1,
  Station2: 2,
  Station3: 3,
};

const MonitorStatusType = {
  Unknown: 0,
  EStopped: 1,
  AStopped: 2,
  DisabledAuto: 3,
  DisabledTeleop: 4,
  EnabledAuto: 5,
  EnabledTeleop: 6,
};

const BWUtilizationType = {
  Low: 0,
  Medium: 1,
  High: 2,
  VeryHigh: 3,
};

const RadioConnectionQuality = {
  Warning: 0,
  Caution: 1,
  Good: 2,
  Excellent: 3,
};

const StationStatusType = {
  Good: 0,
  WrongStation: 1,
  WrongMatch: 2,
  Unknown: 3,
};

const MatchStateType = {
  NoCurrentlyActiveEvent: 0,
  NoCurrentlyActiveTournamentLevel: 1,
  WaitingForPrestart: 2,
  WaitingForPrestartTO: 3,
  Prestarting: 4,
  PrestartingTO: 5,
  WaitingForSetAudience: 6,
  WaitingForSetAudienceTO: 7,
  WaitingForMatchReady: 8,
  WaitingForMatchStart: 9,
  GameSpecificData: 10,
  MatchAuto: 11,
  MatchTransition: 12,
  MatchTeleop: 13,
  WaitingForCommit: 14,
  WaitingForPostResults: 15,
  TournamentLevelComplete: 16,
  MatchCancelled: 17,
  WaitingForMatchPreview: 18,
  WaitingForMatchPreviewTO: 19,
};

const ALL_STATION_SLOTS = [
  { alliance: AllianceType.Blue, station: StationType.Station1 },
  { alliance: AllianceType.Blue, station: StationType.Station2 },
  { alliance: AllianceType.Blue, station: StationType.Station3 },
  { alliance: AllianceType.Red, station: StationType.Station1 },
  { alliance: AllianceType.Red, station: StationType.Station2 },
  { alliance: AllianceType.Red, station: StationType.Station3 },
];

export const fieldMonitorTypes = {
  AllianceType,
  StationType,
  MonitorStatusType,
  BWUtilizationType,
  RadioConnectionQuality,
  StationStatusType,
  MatchStateType,
};

export function resetFieldMonitorLiveTestState() {
  activeReplayRecording = null;
  activeReplayFileName = '';
}

export function createHubConnection(url) {
  return new HubConnectionBuilder()
    .withUrl(url)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Error)
    .withHubProtocol(new MessagePackHubProtocol())
    .build();
}

function getBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_FIELD_MONITOR_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window === 'undefined') {
    return 'http://10.0.100.5';
  }

  const { hostname, origin } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://10.0.100.5';
  }

  return origin;
}

function getValue(object, shortKey, longKey, fallback) {
  if (object == null) return fallback;
  if (object[longKey] != null) return object[longKey];
  if (object[shortKey] != null) return object[shortKey];
  return fallback;
}

function slotKey(alliance, station) {
  return `${alliance}-${station}`;
}

export function createEmptyStation(alliance, station) {
  return {
    alliance,
    station,
    teamNumber: 0,
    connection: false,
    linkActive: false,
    dsLinkActive: false,
    radioLink: false,
    rioLink: false,
    isEnabled: false,
    isAuto: false,
    isBypassed: false,
    isEStopped: false,
    isAStopped: false,
    battery: 0,
    minBattery: 0,
    monitorStatus: MonitorStatusType.Unknown,
    averageTripTime: 0,
    lostPackets: 0,
    dataRateTotal: 0,
    dataRateToRobot: 0,
    dataRateFromRobot: 0,
    bwUtilization: BWUtilizationType.Low,
    stationStatus: StationStatusType.Unknown,
    moveToStation: '',
    radioConnectionQuality: RadioConnectionQuality.Warning,
    radioConnectedToAp: false,
    brownout: false,
    brownoutLatched: false,
  };
}

function getDirectionalRate(raw, primaryShortKey, primaryLongKey, fallbackShortKey) {
  const primaryValue = Number(getValue(raw, primaryShortKey, primaryLongKey, 0)) || 0;
  if (primaryValue > 0) {
    return primaryValue;
  }

  const fallbackValue = Number(getValue(raw, fallbackShortKey, '', 0)) || 0;
  return fallbackValue > 0 ? fallbackValue : 0;
}

export function normalizeStation(raw, minBatteryMap, brownoutLatchMap) {
  const alliance = getValue(raw, 'p1', 'Alliance', AllianceType.None);
  const station = getValue(raw, 'p2', 'Station', StationType.None);
  const key = slotKey(alliance, station);
  const battery = Number(getValue(raw, 'pe', 'Battery', 0)) || 0;
  const brownout = Boolean(getValue(raw, 'pgg', 'Brownout', false));

  const previousMin = minBatteryMap.get(key) ?? 0;
  const nextMin = battery > 0 && (previousMin === 0 || battery < previousMin) ? battery : previousMin;
  minBatteryMap.set(key, nextMin);

  const previousBrownoutTicks = brownoutLatchMap.get(key) ?? 0;
  const nextBrownoutTicks = brownout ? BROWNOUT_LATCH_TICKS : Math.max(previousBrownoutTicks - 1, 0);
  brownoutLatchMap.set(key, nextBrownoutTicks);

  return {
    alliance,
    station,
    teamNumber: Number(getValue(raw, 'p3', 'TeamNumber', 0)) || 0,
    connection: Boolean(getValue(raw, 'p4', 'Connection', false)),
    linkActive: Boolean(getValue(raw, 'p5', 'LinkActive', false)),
    dsLinkActive: Boolean(getValue(raw, 'p6', 'DSLinkActive', false)),
    radioLink: Boolean(getValue(raw, 'p7', 'RadioLink', false)),
    rioLink: Boolean(getValue(raw, 'p8', 'RIOLink', false)),
    isEnabled: Boolean(getValue(raw, 'p9', 'IsEnabled', false)),
    isAuto: Boolean(getValue(raw, 'pa', 'IsAuto', false)),
    isBypassed: Boolean(getValue(raw, 'pb', 'IsBypassed', false)),
    isEStopped: Boolean(getValue(raw, 'pd', 'IsEStopped', false)),
    isAStopped: Boolean(getValue(raw, 'pjj', 'IsAStopped', false)),
    battery,
    minBattery: nextMin,
    monitorStatus: Number(getValue(raw, 'pf', 'MonitorStatus', MonitorStatusType.Unknown)) || 0,
    averageTripTime: Number(getValue(raw, 'pg', 'AverageTripTime', 0)) || 0,
    lostPackets: Number(getValue(raw, 'ph', 'LostPackets', 0)) || 0,
    dataRateTotal: Number(getValue(raw, 'pz', 'DataRateTotal', 0)) || 0,
    dataRateToRobot: getDirectionalRate(raw, 'paa', 'DataRateToRobot', 'pn'),
    dataRateFromRobot: getDirectionalRate(raw, 'pbb', 'DataRateFromRobot', 'pt'),
    bwUtilization: Number(getValue(raw, 'pcc', 'BWUtilization', BWUtilizationType.Low)) || 0,
    stationStatus: Number(getValue(raw, 'pff', 'StationStatus', StationStatusType.Unknown)) || 0,
    brownout,
    brownoutLatched: nextBrownoutTicks > 0,
    moveToStation: getValue(raw, 'pjk', 'MoveToStation', '') || '',
    radioConnectionQuality:
      Number(getValue(raw, 'pll', 'RadioConnectionQuality', RadioConnectionQuality.Warning)) || 0,
    radioConnectedToAp: Boolean(getValue(raw, 'pmm', 'RadioConnectedToAp', false)),
  };
}

export function normalizeMatchStatus(raw) {
  if (!raw) {
    return {
      matchState: MatchStateType.WaitingForPrestart,
      matchNumber: 0,
      playNumber: 0,
      tournamentLevel: 'Unknown',
      matchStateMessage: 'Waiting for live data',
    };
  }

  const matchState = Number(getValue(raw, 'p1', 'MatchState', MatchStateType.WaitingForPrestart)) || 0;
  const matchNumber = Number(getValue(raw, 'p2', 'MatchNumber', 0)) || 0;
  const playNumber = Number(getValue(raw, 'p3', 'PlayNumber', 0)) || 0;
  const tournamentLevel = getValue(raw, 'p4', 'TournamentLevel', 'Unknown');

  return {
    matchState,
    matchNumber,
    playNumber,
    tournamentLevel,
    matchStateMessage: getMatchStateMessage(matchState),
  };
}

function getMatchStateMessage(matchState) {
  switch (matchState) {
    case MatchStateType.NoCurrentlyActiveEvent:
      return 'NO ACTIVE EVENT';
    case MatchStateType.NoCurrentlyActiveTournamentLevel:
      return 'NO ACTIVE TOURNAMENT LEVEL';
    case MatchStateType.WaitingForPrestart:
    case MatchStateType.WaitingForPrestartTO:
      return 'READY TO PRESTART';
    case MatchStateType.Prestarting:
    case MatchStateType.PrestartingTO:
      return 'PRESTARTING';
    case MatchStateType.WaitingForSetAudience:
    case MatchStateType.WaitingForSetAudienceTO:
      return 'WAITING FOR MATCH READY';
    case MatchStateType.WaitingForMatchReady:
      return 'WAITING FOR MATCH READY';
    case MatchStateType.WaitingForMatchStart:
      return 'READY FOR MATCH START';
    case MatchStateType.GameSpecificData:
      return 'GAME SPECIFIC DATA';
    case MatchStateType.MatchAuto:
      return 'MATCH AUTO';
    case MatchStateType.MatchTransition:
      return 'MATCH TRANSITION';
    case MatchStateType.MatchTeleop:
      return 'MATCH TELEOP';
    case MatchStateType.WaitingForCommit:
      return 'WAITING FOR COMMIT';
    case MatchStateType.WaitingForPostResults:
      return 'WAITING FOR POST RESULTS';
    case MatchStateType.TournamentLevelComplete:
      return 'TOURNAMENT LEVEL COMPLETE';
    case MatchStateType.MatchCancelled:
      return 'MATCH CANCELLED';
    case MatchStateType.WaitingForMatchPreview:
    case MatchStateType.WaitingForMatchPreviewTO:
      return 'MATCH PREVIEW';
    default:
      return 'LIVE FIELD MONITOR';
  }
}

function formatNumber(value, digits = 1) {
  return Number(value || 0).toFixed(digits);
}

function formatBattery(value) {
  return value > 0 ? `${formatNumber(value)}V` : '--';
}

function formatRate(value) {
  return `${formatNumber(value)} Mbps`;
}

function formatStationLabel(station) {
  return `Stn ${station}`;
}

function cloneRecordingPayload(payload) {
  if (typeof structuredClone === 'function') {
    return structuredClone(payload);
  }

  return JSON.parse(JSON.stringify(payload));
}

function createUnknownAheadBehindState() {
  return {
    isKnown: false,
    text: '',
  };
}

function createKnownAheadBehindState(text = '') {
  return {
    isKnown: true,
    text: typeof text === 'string' ? text : '',
  };
}

function coerceAheadBehindSnapshot(rawValue, rawKnown) {
  if (typeof rawKnown === 'boolean') {
    return rawKnown ? createKnownAheadBehindState(rawValue || '') : createUnknownAheadBehindState();
  }

  if (typeof rawValue === 'string' && rawValue.length > 0) {
    return createKnownAheadBehindState(rawValue);
  }

  return createUnknownAheadBehindState();
}

function sanitizeFilenamePart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatTimestampForFilename(date) {
  const pad = (value) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

export function createRecordingFilename(label, matchStatus, startedAt) {
  const safeLabel = sanitizeFilenamePart(label);
  const safeLevel = sanitizeFilenamePart(matchStatus?.tournamentLevel) || 'unknown';
  const matchNumber = Number(matchStatus?.matchNumber) || 0;
  const playNumber = Number(matchStatus?.playNumber) || 0;
  const parts = ['field-monitor'];

  if (safeLabel) {
    parts.push(safeLabel);
  } else if (matchNumber > 0) {
    parts.push(safeLevel);
    parts.push(`match-${matchNumber}`);
    if (playNumber > 0) {
      parts.push(`play-${playNumber}`);
    }
  } else {
    parts.push('capture');
  }

  parts.push(formatTimestampForFilename(startedAt));

  return `${parts.join('-')}.json`;
}

function downloadRecordingFile(filename, recording) {
  const blob = new Blob([JSON.stringify(recording, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function createDefaultReplayState() {
  return {
    isReplayMode: false,
    isPlaying: false,
    currentTimeMs: 0,
    durationMs: 0,
    eventCount: 0,
    speed: DEFAULT_REPLAY_SPEED,
    fileName: '',
    error: '',
  };
}

export function getReplayDurationMs(recording) {
  if (!recording) {
    return 0;
  }

  const metaDuration = Number(recording?.meta?.durationMs) || 0;
  if (metaDuration > 0) {
    return metaDuration;
  }

  const lastEvent = recording.events?.[recording.events.length - 1];
  return Number(lastEvent?.t) || 0;
}

function coerceMatchStatusSnapshot(raw) {
  if (!raw) {
    return normalizeMatchStatus();
  }

  if ('matchState' in raw || 'matchStateMessage' in raw) {
    const matchState = Number(raw.matchState) || MatchStateType.WaitingForPrestart;

    return {
      matchState,
      matchNumber: Number(raw.matchNumber) || 0,
      playNumber: Number(raw.playNumber) || 0,
      tournamentLevel: raw.tournamentLevel || 'Unknown',
      matchStateMessage: raw.matchStateMessage || getMatchStateMessage(matchState),
    };
  }

  return normalizeMatchStatus(raw);
}

function coerceStationSnapshot(station) {
  if (!station) {
    return null;
  }

  if ('teamNumber' in station || 'alliance' in station || 'station' in station) {
    const alliance = Number(station.alliance) || AllianceType.None;
    const stationNumber = Number(station.station) || StationType.None;

    if (!alliance || !stationNumber) {
      return null;
    }

    return {
      ...createEmptyStation(alliance, stationNumber),
      ...station,
      alliance,
      station: stationNumber,
      teamNumber: Number(station.teamNumber) || 0,
      battery: Number(station.battery) || 0,
      minBattery: Number(station.minBattery) || 0,
      averageTripTime: Number(station.averageTripTime) || 0,
      lostPackets: Number(station.lostPackets) || 0,
      dataRateTotal: Number(station.dataRateTotal) || 0,
      dataRateToRobot: Number(station.dataRateToRobot) || 0,
      dataRateFromRobot: Number(station.dataRateFromRobot) || 0,
      bwUtilization: Number(station.bwUtilization) || BWUtilizationType.Low,
      stationStatus: Number(station.stationStatus) || StationStatusType.Unknown,
      radioConnectionQuality: Number(station.radioConnectionQuality) || RadioConnectionQuality.Warning,
      brownoutLatched: Boolean(station.brownoutLatched),
    };
  }

  return null;
}

function buildStationsFromSnapshot(stationSnapshot) {
  const stationMap = new Map(
    ALL_STATION_SLOTS.map((slot) => [slotKey(slot.alliance, slot.station), createEmptyStation(slot.alliance, slot.station)])
  );

  (stationSnapshot || []).forEach((station) => {
    const nextStation = coerceStationSnapshot(station);
    if (!nextStation) {
      return;
    }

    stationMap.set(slotKey(nextStation.alliance, nextStation.station), nextStation);
  });

  return ALL_STATION_SLOTS.map((slot) => stationMap.get(slotKey(slot.alliance, slot.station)));
}

function createMinBatteryMap(stations) {
  const minBatteryMap = new Map();

  (stations || []).forEach((station) => {
    if (!station) {
      return;
    }

    const minBattery = Number(station.minBattery) || 0;
    if (minBattery > 0) {
      minBatteryMap.set(slotKey(station.alliance, station.station), minBattery);
    }
  });

  return minBatteryMap;
}

export function parseReplayRecording(text) {
  const parsed = JSON.parse(text);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Replay file must contain a JSON object.');
  }

  if (!Array.isArray(parsed.events)) {
    throw new Error('Replay file is missing an events array.');
  }

  const events = parsed.events.map((event, index) => {
    if (!event || typeof event !== 'object') {
      throw new Error(`Replay event ${index + 1} is invalid.`);
    }

    return {
      t: Number(event.t) || 0,
      source: event.source || '',
      event: event.event || '',
      payload: event.payload,
    };
  });

  return {
    version: Number(parsed.version) || RECORDING_FILE_VERSION,
    meta: parsed.meta || {},
    initialState: parsed.initialState || {},
    events,
  };
}

function getStopKind(station) {
  if (station.isEStopped || station.monitorStatus === MonitorStatusType.EStopped) {
    return 'estopped';
  }

  if (station.isBypassed) {
    return 'bypassed';
  }

  if (station.isAStopped || station.monitorStatus === MonitorStatusType.AStopped) {
    return 'astopped';
  }

  return '';
}

function getStatusInfo(station) {
  const stopKind = getStopKind(station);

  if (stopKind === 'estopped') {
    return {
      kind: stopKind,
      label: 'E-STOPPED',
      shortLabel: 'E-STOP',
      tone: 'danger',
      headline: 'Robot cannot operate',
      detail: 'E-stopped by referee or team',
    };
  }

  if (stopKind === 'bypassed') {
    return {
      kind: stopKind,
      label: 'BYPASSED',
      shortLabel: 'BYPASS',
      tone: 'danger',
      headline: 'Robot will not run',
      detail: 'Bypassed before the match',
    };
  }

  if (stopKind === 'astopped') {
    return {
      kind: stopKind,
      label: 'A-STOPPED',
      shortLabel: 'A-STOP',
      tone: 'warn',
      headline: 'Robot intentionally disabled',
      detail: 'Usually expected during autonomous',
    };
  }

  if (
    station.monitorStatus === MonitorStatusType.EnabledAuto ||
    station.monitorStatus === MonitorStatusType.DisabledAuto
  ) {
    const isEnabled = station.monitorStatus === MonitorStatusType.EnabledAuto;
    return {
      kind: isEnabled ? 'auto-enabled' : 'auto-disabled',
      label: isEnabled ? 'Auto Enabled' : 'Auto Disabled',
      shortLabel: isEnabled ? 'AUTO' : 'AUTO DISABLED',
      tone: 'auto',
      headline: '',
      detail: '',
    };
  }

  if (
    station.monitorStatus === MonitorStatusType.EnabledTeleop ||
    station.monitorStatus === MonitorStatusType.DisabledTeleop
  ) {
    const isEnabled = station.monitorStatus === MonitorStatusType.EnabledTeleop;
    return {
      kind: isEnabled ? 'teleop-enabled' : 'teleop-disabled',
      label: isEnabled ? 'Teleop Enabled' : 'Teleop Disabled',
      shortLabel: isEnabled ? 'TELEOP' : 'TELEOP OFF',
      tone: 'tele',
      headline: '',
      detail: '',
    };
  }

  const isAuto = station.isAuto;
  const isEnabled = station.isEnabled;

  return {
    kind: isAuto ? (isEnabled ? 'auto-enabled' : 'auto-disabled') : isEnabled ? 'teleop-enabled' : 'teleop-disabled',
    label: `${isAuto ? 'Auto' : 'Teleop'} ${isEnabled ? 'Enabled' : 'Disabled'}`,
    shortLabel: isAuto ? (isEnabled ? 'AUTO' : 'AUTO DISABLED') : isEnabled ? 'TELEOP' : 'TELEOP OFF',
    tone: isAuto ? 'auto' : 'tele',
    headline: '',
    detail: '',
  };
}

function getBlockingText(station) {
  if (station.stationStatus === StationStatusType.WrongStation && station.moveToStation) {
    return `MOVE TO ${station.moveToStation.toUpperCase()}`;
  }

  if (station.stationStatus === StationStatusType.WrongMatch) {
    return 'TEAM MISMATCH';
  }

  return '';
}

function getDsSignal(station) {
  if (!station.connection) {
    return { label: 'DS', state: 'bad', detail: 'Missing' };
  }

  if (station.stationStatus === StationStatusType.Unknown || !station.dsLinkActive) {
    return { label: 'DS', state: 'warn', detail: 'Degraded' };
  }

  return { label: 'DS', state: 'good', detail: 'Connected' };
}

function getRadioBars(quality) {
  if (quality >= RadioConnectionQuality.Excellent) return 4;
  if (quality >= RadioConnectionQuality.Good) return 3;
  if (quality >= RadioConnectionQuality.Caution) return 2;
  return 1;
}

function getRadioSignal(station) {
  if (!station.radioConnectedToAp && !station.linkActive) {
    return { label: 'Radio', state: 'bad', detail: '0 bars' };
  }

  if (!station.linkActive && station.radioConnectedToAp) {
    return { label: 'Radio', state: 'warn', detail: `${getRadioBars(station.radioConnectionQuality)} bars` };
  }

  if (!station.radioConnectedToAp) {
    return { label: 'Radio', state: 'bad', detail: '0 bars' };
  }

  const bars = getRadioBars(station.radioConnectionQuality);
  const state = bars >= 3 ? 'good' : 'warn';
  return { label: 'Radio', state, detail: `${bars} bars` };
}

function getRioSignal(station) {
  if (!station.rioLink) {
    return { label: 'RIO', state: 'bad', detail: 'Missing' };
  }

  if (!station.linkActive) {
    return { label: 'RIO', state: 'warn', detail: 'Degraded' };
  }

  return { label: 'RIO', state: 'good', detail: 'Connected' };
}

function isPostMatchMuteState(matchState) {
  return (
    matchState === MatchStateType.WaitingForCommit ||
    matchState === MatchStateType.WaitingForPostResults ||
    matchState === MatchStateType.TournamentLevelComplete ||
    matchState === MatchStateType.MatchCancelled
  );
}

function shouldMutePostMatchDisconnects(station, matchStatus) {
  if (!isPostMatchMuteState(matchStatus?.matchState)) {
    return false;
  }

  if (station.brownout || station.brownoutLatched || station.isEnabled || getStopKind(station) || getBlockingText(station)) {
    return false;
  }

  return (
    !station.dsLinkActive &&
    !station.linkActive &&
    !station.radioLink &&
    !station.rioLink &&
    station.battery <= 0
  );
}

function getBatteryInfo(station) {
  const currentBattery = station.battery;
  const minBattery = station.minBattery > 0 ? formatNumber(station.minBattery) : '--';

  if (station.brownout) {
    return {
      value: formatBattery(currentBattery),
      min: minBattery,
      tone: 'critical',
      action: 'BROWNOUT',
      detail: 'Robot is browning out now',
    };
  }

  if (currentBattery > 0 && currentBattery < 7.0) {
    return {
      value: formatBattery(currentBattery),
      min: minBattery,
      tone: 'critical',
      action: 'LOW BATT',
      detail: 'Brownout risk',
    };
  }

  return {
    value: formatBattery(currentBattery),
    min: minBattery,
    tone: 'normal',
    action: '',
    detail: currentBattery > 0 ? 'Stable' : '',
  };
}

function formatDirectionalTraffic(value) {
  if (!(value > 0)) {
    return '--';
  }

  if (value >= 100) {
    return String(Math.round(value));
  }

  return formatNumber(value);
}

function isLiveMatchState(matchState) {
  return (
    matchState === MatchStateType.MatchAuto ||
    matchState === MatchStateType.MatchTransition ||
    matchState === MatchStateType.MatchTeleop
  );
}

function getRowMode(station, matchStatus) {
  const stopKind = getStopKind(station);
  if (stopKind === 'estopped' || stopKind === 'bypassed') {
    return stopKind;
  }

  if (getBlockingText(station)) {
    return 'blocking';
  }

  if (stopKind === 'astopped') {
    return stopKind;
  }

  if (shouldMutePostMatchDisconnects(station, matchStatus)) {
    return 'normal';
  }

  const isLiveMatch = isLiveMatchState(matchStatus?.matchState);
  const hasCriticalConnection =
    isLiveMatch &&
    (!station.connection || !station.rioLink || (!station.radioConnectedToAp && !station.linkActive));
  const hasCriticalPerformance =
    station.brownout ||
    (station.battery > 0 && station.battery < 7.0);

  if (hasCriticalConnection || hasCriticalPerformance) {
    return 'critical';
  }

  const hasWarningConnection =
    isLiveMatch &&
    ((station.connection && !station.dsLinkActive) ||
      (!station.linkActive && station.radioConnectedToAp) ||
      (station.rioLink && !station.linkActive) ||
      (station.radioConnectedToAp && station.radioConnectionQuality <= RadioConnectionQuality.Caution));

  if (hasWarningConnection) {
    return 'degraded';
  }

  return 'normal';
}

function toRow(station, matchStatus) {
  const blockingText = getBlockingText(station);
  const status = getStatusInfo(station);
  const battery = getBatteryInfo(station);
  const mode = getRowMode(station, matchStatus);
  const isPostMatchMuted = shouldMutePostMatchDisconnects(station, matchStatus);

  return {
    team: station.teamNumber > 0 ? String(station.teamNumber) : '----',
    station: formatStationLabel(station.station),
    mode,
    status,
    isPostMatchMuted,
    ds: getDsSignal(station),
    radio: getRadioSignal(station),
    rio: getRioSignal(station),
    battery,
    bwu: {
      value: formatRate(station.dataRateTotal),
      tx: formatDirectionalTraffic(station.dataRateToRobot),
      rx: formatDirectionalTraffic(station.dataRateFromRobot),
    },
    trip: `${Math.round(station.averageTripTime)} ms`,
    pkts: String(Math.round(station.lostPackets)),
    blockingText: mode === 'blocking' ? blockingText : '',
    secondaryText: mode === 'estopped' || mode === 'bypassed' ? blockingText : '',
  };
}

export function buildPanels(stations, mirrorLayout, matchStatus) {
  const grouped = {
    red: [],
    blue: [],
  };

  stations.forEach((station) => {
    const key = station.alliance === AllianceType.Red ? 'red' : 'blue';
    if (grouped[key]) {
      grouped[key].push(station);
    }
  });

  grouped.red.sort((a, b) => a.station - b.station);
  grouped.blue.sort((a, b) => a.station - b.station);

  if (mirrorLayout) {
    grouped.red.reverse();
  }

  const orderedKeys = mirrorLayout ? ['blue', 'red'] : ['red', 'blue'];

  return orderedKeys.map((alliance) => ({
    alliance,
    title: alliance === 'red' ? 'Red Alliance' : 'Blue Alliance',
    rows: grouped[alliance].map((station) => toRow(station, matchStatus)),
  }));
}

function buildInitialStations() {
  return ALL_STATION_SLOTS.map(({ alliance, station }) => createEmptyStation(alliance, station));
}

export function useFieldMonitorLiveData({ mirrorLayout = false, hubConnectionFactory = createHubConnection } = {}) {
  const baseUrl = getBaseUrl();
  const minBatteryRef = useRef(new Map());
  const brownoutLatchRef = useRef(new Map());
  const currentMatchRef = useRef(null);
  const recordingStateRef = useRef({
    isRecording: false,
    startedAtMs: 0,
    startedAtIso: '',
    label: '',
    initialState: null,
    events: [],
  });
  const replayRuntimeRef = useRef({
    timeoutId: null,
    basePositionMs: 0,
    wallStartMs: 0,
    nextEventIndex: 0,
    speed: DEFAULT_REPLAY_SPEED,
  });
  const [stations, setStations] = useState(buildInitialStations);
  const [matchStatus, setMatchStatus] = useState(normalizeMatchStatus());
  const [aheadBehind, setAheadBehind] = useState(createUnknownAheadBehindState);
  const [error, setError] = useState('');
  const [isFieldHubConnected, setIsFieldHubConnected] = useState(false);
  const [isInfrastructureHubConnected, setIsInfrastructureHubConnected] = useState(false);
  const [sourceMode, setSourceMode] = useState(() => (activeReplayRecording ? 'replay' : 'live'));
  const [replayRecording, setReplayRecording] = useState(() => activeReplayRecording);
  const [replayState, setReplayState] = useState(() => {
    if (!activeReplayRecording) {
      return createDefaultReplayState();
    }

    return {
      isReplayMode: true,
      isPlaying: true,
      currentTimeMs: 0,
      durationMs: getReplayDurationMs(activeReplayRecording),
      eventCount: activeReplayRecording.events.length,
      speed: DEFAULT_REPLAY_SPEED,
      fileName: activeReplayFileName,
      error: '',
    };
  });
  const [recorderState, setRecorderState] = useState({
    isRecording: false,
    eventCount: 0,
    startedAtIso: '',
    lastDownloadName: '',
    lastEventCount: 0,
  });

  const clearReplayTimer = useCallback(() => {
    if (replayRuntimeRef.current.timeoutId) {
      window.clearTimeout(replayRuntimeRef.current.timeoutId);
      replayRuntimeRef.current.timeoutId = null;
    }
  }, []);

  const getCurrentReplayPositionMs = useCallback(() => {
    const runtime = replayRuntimeRef.current;

    if (!replayState.isPlaying || runtime.wallStartMs === 0) {
      return runtime.basePositionMs;
    }

    return runtime.basePositionMs + (Date.now() - runtime.wallStartMs) * runtime.speed;
  }, [replayState.isPlaying]);

  const applyReplaySnapshot = useCallback((recording) => {
    const snapshotStations = buildStationsFromSnapshot(recording?.initialState?.stations);
    minBatteryRef.current = createMinBatteryMap(snapshotStations);
    brownoutLatchRef.current = new Map();
    currentMatchRef.current = recording?.initialState?.currentMatch ?? null;
    setStations(snapshotStations);
    setMatchStatus(coerceMatchStatusSnapshot(recording?.initialState?.matchStatus));
    setAheadBehind(
      coerceAheadBehindSnapshot(recording?.initialState?.aheadBehind, recording?.initialState?.aheadBehindKnown)
    );
    setError('');
    setIsFieldHubConnected(false);
    setIsInfrastructureHubConnected(false);
  }, []);

  const recordIncomingEvent = useCallback((source, event, payload) => {
    if (!recordingStateRef.current.isRecording) {
      return;
    }

    recordingStateRef.current.events.push({
      t: Date.now() - recordingStateRef.current.startedAtMs,
      source,
      event,
      payload: cloneRecordingPayload(payload),
    });

    setRecorderState((current) => ({
      ...current,
      eventCount: recordingStateRef.current.events.length,
    }));
  }, []);

  const applyStationData = useCallback(
    (dataArray, { shouldRecord = false } = {}) => {
      if (shouldRecord) {
        recordIncomingEvent('fieldHub', 'fieldMonitorDataChanged', dataArray || []);
      }

      const stationMap = new Map(
        ALL_STATION_SLOTS.map((slot) => [slotKey(slot.alliance, slot.station), createEmptyStation(slot.alliance, slot.station)])
      );

      (dataArray || []).forEach((item) => {
        const station = normalizeStation(item, minBatteryRef.current, brownoutLatchRef.current);
        stationMap.set(slotKey(station.alliance, station.station), station);
      });

      setStations(ALL_STATION_SLOTS.map((slot) => stationMap.get(slotKey(slot.alliance, slot.station))));
    },
    [recordIncomingEvent]
  );

  const applyMatchStatus = useCallback(
    (data, { shouldRecord = false } = {}) => {
      if (shouldRecord) {
        recordIncomingEvent('infrastructureHub', 'matchStatusInfoChanged', data);
      }

      const nextStatus = normalizeMatchStatus(data);
      if (
        nextStatus.matchState === MatchStateType.WaitingForPrestart ||
        nextStatus.matchState === MatchStateType.MatchAuto
      ) {
        minBatteryRef.current.clear();
        brownoutLatchRef.current.clear();
      }

      setMatchStatus(nextStatus);
    },
    [recordIncomingEvent]
  );

  const applyAheadBehind = useCallback(
    (data, { shouldRecord = false } = {}) => {
      if (shouldRecord) {
        recordIncomingEvent('infrastructureHub', 'ScheduleAheadBehindChanged', data || '');
      }

      setAheadBehind(createKnownAheadBehindState(data || ''));
    },
    [recordIncomingEvent]
  );

  function startRecording(label = '') {
    const startedAt = new Date();

    recordingStateRef.current = {
      isRecording: true,
      startedAtMs: startedAt.getTime(),
      startedAtIso: startedAt.toISOString(),
      label: label.trim(),
      initialState: {
        currentMatch: cloneRecordingPayload(currentMatchRef.current),
        matchStatus: cloneRecordingPayload(matchStatus),
        stations: cloneRecordingPayload(stations),
        aheadBehind: aheadBehind.text,
        aheadBehindKnown: aheadBehind.isKnown,
      },
      events: [],
    };

    setRecorderState({
      isRecording: true,
      eventCount: 0,
      startedAtIso: startedAt.toISOString(),
      lastDownloadName: '',
      lastEventCount: 0,
    });
  }

  function stopRecordingAndDownload() {
    if (!recordingStateRef.current.isRecording) {
      return false;
    }

    const startedAt = new Date(recordingStateRef.current.startedAtIso);
    const stoppedAt = new Date();
    const recording = {
      version: RECORDING_FILE_VERSION,
      meta: {
        host: baseUrl,
        capturedAt: recordingStateRef.current.startedAtIso,
        stoppedAt: stoppedAt.toISOString(),
        durationMs: stoppedAt.getTime() - recordingStateRef.current.startedAtMs,
        mirrorLayout,
        label: recordingStateRef.current.label,
      },
      initialState: recordingStateRef.current.initialState,
      events: recordingStateRef.current.events,
    };
    const filename = createRecordingFilename(recordingStateRef.current.label, matchStatus, startedAt);

    downloadRecordingFile(filename, recording);

    setRecorderState({
      isRecording: false,
      eventCount: 0,
      startedAtIso: '',
      lastDownloadName: filename,
      lastEventCount: recordingStateRef.current.events.length,
    });
    recordingStateRef.current = {
      isRecording: false,
      startedAtMs: 0,
      startedAtIso: '',
      label: '',
      initialState: null,
      events: [],
    };

    return true;
  }

  const initializeReplay = useCallback(
    (recording, fileName, { autoPlay = true } = {}) => {
      clearReplayTimer();
      applyReplaySnapshot(recording);
      replayRuntimeRef.current = {
        timeoutId: null,
        basePositionMs: 0,
        wallStartMs: autoPlay ? Date.now() : 0,
        nextEventIndex: 0,
        speed: DEFAULT_REPLAY_SPEED,
      };
      setReplayRecording(recording);
      setSourceMode('replay');
      setReplayState({
        isReplayMode: true,
        isPlaying: autoPlay,
        currentTimeMs: 0,
        durationMs: getReplayDurationMs(recording),
        eventCount: recording.events.length,
        speed: DEFAULT_REPLAY_SPEED,
        fileName,
        error: '',
      });
      setError('');
    },
    [applyReplaySnapshot, clearReplayTimer]
  );

  const dispatchReplayEvent = useCallback(
    (entry) => {
      if (entry.source === 'fieldHub' && entry.event === 'fieldMonitorDataChanged') {
        applyStationData(entry.payload, { shouldRecord: false });
        return;
      }

      if (entry.source === 'infrastructureHub' && entry.event === 'matchStatusInfoChanged') {
        applyMatchStatus(entry.payload, { shouldRecord: false });
        return;
      }

      if (entry.source === 'infrastructureHub' && entry.event === 'ScheduleAheadBehindChanged') {
        applyAheadBehind(entry.payload, { shouldRecord: false });
      }
    },
    [applyAheadBehind, applyMatchStatus, applyStationData]
  );

  const scheduleReplay = useCallback(() => {
    clearReplayTimer();

    if (sourceMode !== 'replay' || !replayRecording || !replayState.isPlaying) {
      return;
    }

    const runtime = replayRuntimeRef.current;
    const durationMs = getReplayDurationMs(replayRecording);
    const events = replayRecording.events || [];
    let positionMs = Math.min(getCurrentReplayPositionMs(), durationMs);

    while (runtime.nextEventIndex < events.length && events[runtime.nextEventIndex].t <= positionMs) {
      const nextEntry = events[runtime.nextEventIndex];
      dispatchReplayEvent(nextEntry);
      runtime.nextEventIndex += 1;
      positionMs = nextEntry.t;
    }

    setReplayState((current) => ({
      ...current,
      currentTimeMs: positionMs,
    }));

    if (runtime.nextEventIndex >= events.length) {
      runtime.basePositionMs = durationMs;
      runtime.wallStartMs = 0;
      setReplayState((current) => ({
        ...current,
        isPlaying: false,
        currentTimeMs: durationMs,
      }));
      return;
    }

    const nextEntry = events[runtime.nextEventIndex];
    runtime.basePositionMs = positionMs;
    runtime.wallStartMs = Date.now();
    runtime.speed = replayState.speed;
    runtime.timeoutId = window.setTimeout(() => {
      const currentRuntime = replayRuntimeRef.current;
      dispatchReplayEvent(nextEntry);
      currentRuntime.nextEventIndex += 1;
      currentRuntime.basePositionMs = nextEntry.t;
      currentRuntime.wallStartMs = Date.now();
      setReplayState((current) => ({
        ...current,
        currentTimeMs: nextEntry.t,
      }));
      scheduleReplay();
    }, Math.max(0, (nextEntry.t - positionMs) / replayState.speed));
  }, [
    clearReplayTimer,
    dispatchReplayEvent,
    getCurrentReplayPositionMs,
    replayRecording,
    replayState.isPlaying,
    replayState.speed,
    sourceMode,
  ]);

  const loadReplayFile = useCallback(
    async (file) => {
      if (!file) {
        return false;
      }

      try {
        const text = await file.text();
        const recording = parseReplayRecording(text);
        activeReplayRecording = recording;
        activeReplayFileName = file.name || 'field-monitor-recording.json';
        initializeReplay(recording, activeReplayFileName);
        return true;
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unable to load replay file';
        setReplayState((current) => ({
          ...current,
          error: message,
        }));
        setError(message);
        return false;
      }
    },
    [initializeReplay]
  );

  const pauseReplay = useCallback(() => {
    clearReplayTimer();
    const nextPosition = Math.min(getCurrentReplayPositionMs(), replayState.durationMs);
    replayRuntimeRef.current.basePositionMs = nextPosition;
    replayRuntimeRef.current.wallStartMs = 0;
    setReplayState((current) => ({
      ...current,
      isPlaying: false,
      currentTimeMs: nextPosition,
    }));
  }, [clearReplayTimer, getCurrentReplayPositionMs, replayState.durationMs]);

  const resumeReplay = useCallback(() => {
    if (!replayRecording) {
      return;
    }

    replayRuntimeRef.current.wallStartMs = Date.now();
    replayRuntimeRef.current.speed = replayState.speed;
    setReplayState((current) => ({
      ...current,
      isPlaying: true,
      error: '',
    }));
  }, [replayRecording, replayState.speed]);

  const restartReplay = useCallback(() => {
    if (!replayRecording) {
      return;
    }

    initializeReplay(replayRecording, replayState.fileName, { autoPlay: true });
  }, [initializeReplay, replayRecording, replayState.fileName]);

  const setReplaySpeed = useCallback(
    (nextSpeed) => {
      const speed = REPLAY_SPEED_OPTIONS.includes(nextSpeed) ? nextSpeed : DEFAULT_REPLAY_SPEED;
      const nextPosition = Math.min(getCurrentReplayPositionMs(), replayState.durationMs);
      replayRuntimeRef.current.basePositionMs = nextPosition;
      replayRuntimeRef.current.wallStartMs = replayState.isPlaying ? Date.now() : 0;
      replayRuntimeRef.current.speed = speed;
      setReplayState((current) => ({
        ...current,
        speed,
        currentTimeMs: nextPosition,
      }));
    },
    [getCurrentReplayPositionMs, replayState.durationMs, replayState.isPlaying]
  );

  const clearReplay = useCallback(() => {
    clearReplayTimer();
    activeReplayRecording = null;
    activeReplayFileName = '';
    replayRuntimeRef.current = {
      timeoutId: null,
      basePositionMs: 0,
      wallStartMs: 0,
      nextEventIndex: 0,
      speed: DEFAULT_REPLAY_SPEED,
    };
    minBatteryRef.current.clear();
    currentMatchRef.current = null;
    setReplayRecording(null);
    setReplayState(createDefaultReplayState());
    setSourceMode('live');
    setStations(buildInitialStations());
    setMatchStatus(normalizeMatchStatus());
    setAheadBehind(createUnknownAheadBehindState());
    setError('');
    setIsFieldHubConnected(false);
    setIsInfrastructureHubConnected(false);
  }, [clearReplayTimer]);

  useEffect(() => {
    if (sourceMode !== 'live') {
      return undefined;
    }

    let isCancelled = false;

    async function fetchCurrentMatch() {
      try {
        const response = await fetch(`${baseUrl}/api/v1.0/fieldMonitor/get/GetCurrentMatchAndPlayNumber`);
        if (!response.ok) {
          throw new Error(`Current match request failed with ${response.status}`);
        }

        const data = await response.json();
        if (isCancelled) return;
        currentMatchRef.current = data;

        setMatchStatus((current) => ({
          ...current,
          matchNumber: Number(data.item2) || current.matchNumber,
          playNumber: Number(data.item3) || current.playNumber,
          tournamentLevel: data.item1 || current.tournamentLevel,
        }));
      } catch (fetchError) {
        if (!isCancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'Unable to fetch current match');
        }
      }
    }

    fetchCurrentMatch();

    return () => {
      isCancelled = true;
    };
  }, [baseUrl, sourceMode]);

  useEffect(() => {
    if (sourceMode !== 'live') {
      return undefined;
    }

    const fieldHub = hubConnectionFactory(`${baseUrl}/fieldMonitorHub`);
    const infrastructureHub = hubConnectionFactory(`${baseUrl}/infrastructureHub`);

    let isMounted = true;

    function handleStationData(dataArray) {
      if (isMounted) {
        applyStationData(dataArray, { shouldRecord: true });
      }
    }

    function handleMatchStatus(data) {
      if (isMounted) {
        applyMatchStatus(data, { shouldRecord: true });
      }
    }

    fieldHub.on('fieldMonitorDataChanged', handleStationData);
    infrastructureHub.on('matchStatusInfoChanged', handleMatchStatus);
    infrastructureHub.on('ScheduleAheadBehindChanged', (data) => {
      if (isMounted) {
        applyAheadBehind(data, { shouldRecord: true });
      }
    });

    fieldHub.onreconnected(() => {
      if (isMounted) {
        setIsFieldHubConnected(true);
      }
    });

    infrastructureHub.onreconnected(() => {
      if (isMounted) {
        setIsInfrastructureHubConnected(true);
      }
    });

    fieldHub.onclose(() => {
      if (isMounted) {
        setIsFieldHubConnected(false);
      }
    });

    infrastructureHub.onclose(() => {
      if (isMounted) {
        setIsInfrastructureHubConnected(false);
      }
    });

    Promise.all([
      fieldHub
        .start()
        .then(() => {
          if (isMounted) {
            setIsFieldHubConnected(true);
          }
        })
        .catch((hubError) => {
          if (isMounted) {
            setError(hubError instanceof Error ? hubError.message : 'Unable to connect to field monitor hub');
          }
        }),
      infrastructureHub
        .start()
        .then(() => {
          if (isMounted) {
            setIsInfrastructureHubConnected(true);
          }
        })
        .catch((hubError) => {
          if (isMounted) {
            setError(hubError instanceof Error ? hubError.message : 'Unable to connect to infrastructure hub');
          }
        }),
    ]);

    return () => {
      isMounted = false;
      fieldHub.stop();
      infrastructureHub.stop();
    };
  }, [applyAheadBehind, applyMatchStatus, applyStationData, baseUrl, hubConnectionFactory, sourceMode]);

  useEffect(() => {
    if (
      sourceMode !== 'replay' ||
      !replayRecording ||
      replayRuntimeRef.current.nextEventIndex !== 0 ||
      replayRuntimeRef.current.wallStartMs !== 0 ||
      replayState.currentTimeMs !== 0
    ) {
      return;
    }

    initializeReplay(replayRecording, replayState.fileName || activeReplayFileName, { autoPlay: replayState.isPlaying });
  }, [initializeReplay, replayRecording, replayState.currentTimeMs, replayState.fileName, replayState.isPlaying, sourceMode]);

  useEffect(() => {
    if (sourceMode !== 'replay' || !replayRecording || !replayState.isPlaying) {
      clearReplayTimer();
      return undefined;
    }

    scheduleReplay();

    return () => {
      clearReplayTimer();
    };
  }, [clearReplayTimer, replayRecording, replayState.isPlaying, replayState.speed, scheduleReplay, sourceMode]);

  const alliancePanels = useMemo(
    () => buildPanels(stations, mirrorLayout, matchStatus),
    [matchStatus, mirrorLayout, stations]
  );
  const scheduleStatus = aheadBehind.isKnown ? aheadBehind.text || 'On schedule' : 'Unknown';

  return {
    sourceMode,
    alliancePanels,
    matchStatus,
    aheadBehind: aheadBehind.text,
    isAheadBehindKnown: aheadBehind.isKnown,
    scheduleStatus,
    error,
    isConnected: sourceMode === 'live' && isFieldHubConnected && isInfrastructureHubConnected,
    hasLiveData: stations.some((station) => station.teamNumber > 0),
    recorder: {
      isRecording: sourceMode === 'live' && recorderState.isRecording,
      eventCount: recorderState.eventCount,
      startedAtIso: recorderState.startedAtIso,
      lastDownloadName: recorderState.lastDownloadName,
      lastEventCount: recorderState.lastEventCount,
      startRecording,
      stopRecordingAndDownload,
    },
    replay: {
      ...replayState,
      speedOptions: REPLAY_SPEED_OPTIONS,
      loadReplayFile,
      resumeReplay,
      pauseReplay,
      restartReplay,
      clearReplay,
      setReplaySpeed,
    },
  };
}
