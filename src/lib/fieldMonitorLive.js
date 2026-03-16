import { useEffect, useMemo, useRef, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';

const RECORDING_FILE_VERSION = 1;

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

function getBaseUrl() {
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

function createEmptyStation(alliance, station) {
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
  };
}

function normalizeStation(raw, minBatteryMap) {
  const alliance = getValue(raw, 'p1', 'Alliance', AllianceType.None);
  const station = getValue(raw, 'p2', 'Station', StationType.None);
  const key = slotKey(alliance, station);
  const battery = Number(getValue(raw, 'pe', 'Battery', 0)) || 0;

  const previousMin = minBatteryMap.get(key) ?? 0;
  const nextMin = battery > 0 && (previousMin === 0 || battery < previousMin) ? battery : previousMin;
  minBatteryMap.set(key, nextMin);

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
    dataRateToRobot: Number(getValue(raw, 'paa', 'DataRateToRobot', 0)) || 0,
    dataRateFromRobot: Number(getValue(raw, 'pbb', 'DataRateFromRobot', 0)) || 0,
    bwUtilization: Number(getValue(raw, 'pcc', 'BWUtilization', BWUtilizationType.Low)) || 0,
    stationStatus: Number(getValue(raw, 'pff', 'StationStatus', StationStatusType.Unknown)) || 0,
    brownout: Boolean(getValue(raw, 'pgg', 'Brownout', false)),
    moveToStation: getValue(raw, 'pjk', 'MoveToStation', '') || '',
    radioConnectionQuality:
      Number(getValue(raw, 'pll', 'RadioConnectionQuality', RadioConnectionQuality.Warning)) || 0,
    radioConnectedToAp: Boolean(getValue(raw, 'pmm', 'RadioConnectedToAp', false)),
  };
}

function normalizeMatchStatus(raw) {
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
      return 'SET AUDIENCE';
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

function createRecordingFilename(label, matchStatus, startedAt) {
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

function getStatusLabel(station) {
  if (station.isEStopped || station.monitorStatus === MonitorStatusType.EStopped) {
    return 'E-STOPPED';
  }

  if (station.isAStopped || station.monitorStatus === MonitorStatusType.AStopped) {
    return 'A-STOPPED';
  }

  if (
    station.monitorStatus === MonitorStatusType.EnabledAuto ||
    station.monitorStatus === MonitorStatusType.DisabledAuto
  ) {
    return station.monitorStatus === MonitorStatusType.EnabledAuto ? 'Auto Enabled' : 'Auto Disabled';
  }

  if (
    station.monitorStatus === MonitorStatusType.EnabledTeleop ||
    station.monitorStatus === MonitorStatusType.DisabledTeleop
  ) {
    return station.monitorStatus === MonitorStatusType.EnabledTeleop ? 'Teleop Enabled' : 'Teleop Disabled';
  }

  return `${station.isAuto ? 'Auto' : 'Teleop'} ${station.isEnabled ? 'Enabled' : 'Disabled'}`;
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

function getRowMode(station) {
  if (getBlockingText(station)) {
    return 'blocking';
  }

  const hasCriticalConnection =
    !station.connection ||
    !station.rioLink ||
    (!station.radioConnectedToAp && !station.linkActive) ||
    station.isEStopped ||
    station.isAStopped;
  const hasCriticalPerformance =
    station.brownout ||
    (station.battery > 0 && station.battery < 8.5) ||
    station.averageTripTime >= 55;

  if (hasCriticalConnection || hasCriticalPerformance) {
    return 'critical';
  }

  const hasWarningConnection =
    station.stationStatus === StationStatusType.Unknown ||
    (!station.linkActive && station.radioConnectedToAp) ||
    (station.rioLink && !station.linkActive) ||
    station.radioConnectionQuality <= RadioConnectionQuality.Caution;
  const hasWarningPerformance =
    (station.battery > 0 && station.battery < 10.0) ||
    station.lostPackets >= 5 ||
    station.averageTripTime >= 25 ||
    station.bwUtilization >= BWUtilizationType.High;

  if (hasWarningConnection || hasWarningPerformance) {
    return 'degraded';
  }

  return 'normal';
}

function toRow(station) {
  const blockingText = getBlockingText(station);
  const mode = getRowMode(station);

  return {
    team: station.teamNumber > 0 ? String(station.teamNumber) : '----',
    station: formatStationLabel(station.station),
    mode,
    status: getStatusLabel(station),
    ds: getDsSignal(station),
    radio: getRadioSignal(station),
    rio: getRioSignal(station),
    battery: {
      value: formatBattery(station.battery),
      min: station.minBattery > 0 ? formatNumber(station.minBattery) : '--',
    },
    bwu: {
      value: formatRate(station.dataRateTotal),
      tx: formatNumber(station.dataRateToRobot),
      rx: formatNumber(station.dataRateFromRobot),
    },
    trip: `${Math.round(station.averageTripTime)} ms`,
    pkts: String(Math.round(station.lostPackets)),
    blockingText,
  };
}

function buildPanels(stations, redOnRight) {
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

  const orderedKeys = redOnRight ? ['blue', 'red'] : ['red', 'blue'];

  return orderedKeys.map((alliance) => ({
    alliance,
    title: alliance === 'red' ? 'Red Alliance' : 'Blue Alliance',
    rows: grouped[alliance].map(toRow),
  }));
}

function buildInitialStations() {
  return ALL_STATION_SLOTS.map(({ alliance, station }) => createEmptyStation(alliance, station));
}

export function useFieldMonitorLiveData({ redOnRight = true } = {}) {
  const baseUrl = getBaseUrl();
  const minBatteryRef = useRef(new Map());
  const currentMatchRef = useRef(null);
  const recordingStateRef = useRef({
    isRecording: false,
    startedAtMs: 0,
    startedAtIso: '',
    label: '',
    initialState: null,
    events: [],
  });
  const [stations, setStations] = useState(buildInitialStations);
  const [matchStatus, setMatchStatus] = useState(normalizeMatchStatus());
  const [aheadBehind, setAheadBehind] = useState('');
  const [error, setError] = useState('');
  const [isFieldHubConnected, setIsFieldHubConnected] = useState(false);
  const [isInfrastructureHubConnected, setIsInfrastructureHubConnected] = useState(false);
  const [recorderState, setRecorderState] = useState({
    isRecording: false,
    eventCount: 0,
    startedAtIso: '',
    lastDownloadName: '',
    lastEventCount: 0,
  });

  function recordIncomingEvent(source, event, payload) {
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
  }

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
        aheadBehind,
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
        redOnRight,
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

  useEffect(() => {
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
  }, [baseUrl]);

  useEffect(() => {
    const fieldHub = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/fieldMonitorHub`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Error)
      .withHubProtocol(new MessagePackHubProtocol())
      .build();

    const infrastructureHub = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/infrastructureHub`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Error)
      .withHubProtocol(new MessagePackHubProtocol())
      .build();

    let isMounted = true;

    function handleStationData(dataArray) {
      recordIncomingEvent('fieldHub', 'fieldMonitorDataChanged', dataArray || []);

      const stationMap = new Map(
        ALL_STATION_SLOTS.map((slot) => [slotKey(slot.alliance, slot.station), createEmptyStation(slot.alliance, slot.station)])
      );

      (dataArray || []).forEach((item) => {
        const station = normalizeStation(item, minBatteryRef.current);
        stationMap.set(slotKey(station.alliance, station.station), station);
      });

      if (isMounted) {
        setStations(ALL_STATION_SLOTS.map((slot) => stationMap.get(slotKey(slot.alliance, slot.station))));
      }
    }

    function handleMatchStatus(data) {
      recordIncomingEvent('infrastructureHub', 'matchStatusInfoChanged', data);

      const nextStatus = normalizeMatchStatus(data);
      if (
        nextStatus.matchState === MatchStateType.WaitingForPrestart ||
        nextStatus.matchState === MatchStateType.MatchAuto
      ) {
        minBatteryRef.current.clear();
      }

      if (isMounted) {
        setMatchStatus(nextStatus);
      }
    }

    fieldHub.on('fieldMonitorDataChanged', handleStationData);
    infrastructureHub.on('matchStatusInfoChanged', handleMatchStatus);
    infrastructureHub.on('ScheduleAheadBehindChanged', (data) => {
      recordIncomingEvent('infrastructureHub', 'ScheduleAheadBehindChanged', data || '');

      if (isMounted) {
        setAheadBehind(data || '');
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
  }, [baseUrl]);

  const alliancePanels = useMemo(() => buildPanels(stations, redOnRight), [redOnRight, stations]);

  return {
    alliancePanels,
    matchStatus,
    aheadBehind,
    error,
    isConnected: isFieldHubConnected && isInfrastructureHubConnected,
    hasLiveData: stations.some((station) => station.teamNumber > 0),
    recorder: {
      isRecording: recorderState.isRecording,
      eventCount: recorderState.eventCount,
      startedAtIso: recorderState.startedAtIso,
      lastDownloadName: recorderState.lastDownloadName,
      lastEventCount: recorderState.lastEventCount,
      startRecording,
      stopRecordingAndDownload,
    },
  };
}
