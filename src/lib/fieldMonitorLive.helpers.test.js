import { afterEach, describe, expect, it } from 'vitest';
import {
  buildPanels,
  createEmptyStation,
  createRecordingFilename,
  fieldMonitorTypes,
  getReplayDurationMs,
  normalizeMatchStatus,
  normalizeStation,
  parseReplayRecording,
  resetFieldMonitorLiveTestState,
} from './fieldMonitorLive';

const { AllianceType, MatchStateType, MonitorStatusType, RadioConnectionQuality, StationType } = fieldMonitorTypes;

function createStation(alliance, station, overrides = {}) {
  return {
    ...createEmptyStation(alliance, station),
    monitorStatus: MonitorStatusType.EnabledTeleop,
    teamNumber: 1000 + station,
    ...overrides,
  };
}

function createHealthyRow(overrides = {}, matchStatusOverrides = {}) {
  const station = createStation(AllianceType.Red, StationType.Station1, {
    connection: true,
    dsLinkActive: true,
    radioLink: true,
    linkActive: true,
    rioLink: true,
    radioConnectedToAp: true,
    radioConnectionQuality: RadioConnectionQuality.Excellent,
    battery: 12.4,
    minBattery: 12.1,
    averageTripTime: 7,
    lostPackets: 1,
    dataRateTotal: 4.8,
    dataRateToRobot: 1.9,
    dataRateFromRobot: 2.9,
    ...overrides,
  });
  const matchStatus = normalizeMatchStatus({
    MatchState: MatchStateType.MatchTeleop,
    MatchNumber: 1,
    PlayNumber: 1,
    TournamentLevel: 'Qualification',
    ...matchStatusOverrides,
  });

  return buildPanels([station], true, matchStatus)[0].rows[0];
}

afterEach(() => {
  resetFieldMonitorLiveTestState();
});

describe('fieldMonitorLive helpers', () => {
  it('tracks minimum battery and brownout latch while normalizing station updates', () => {
    const minBatteryMap = new Map();
    const brownoutLatchMap = new Map();

    const first = normalizeStation(
      {
        Alliance: AllianceType.Red,
        Station: StationType.Station1,
        TeamNumber: 254,
        Battery: 11.8,
        Brownout: false,
      },
      minBatteryMap,
      brownoutLatchMap
    );

    expect(first.minBattery).toBe(11.8);
    expect(first.brownoutLatched).toBe(false);

    const second = normalizeStation(
      {
        Alliance: AllianceType.Red,
        Station: StationType.Station1,
        TeamNumber: 254,
        Battery: 12.4,
        Brownout: true,
      },
      minBatteryMap,
      brownoutLatchMap
    );

    expect(second.minBattery).toBe(11.8);
    expect(second.brownout).toBe(true);
    expect(second.brownoutLatched).toBe(true);

    let latest = second;
    for (let index = 0; index < 5; index += 1) {
      latest = normalizeStation(
        {
          Alliance: AllianceType.Red,
          Station: StationType.Station1,
          TeamNumber: 254,
          Battery: 12.1,
          Brownout: false,
        },
        minBatteryMap,
        brownoutLatchMap
      );
    }

    expect(latest.brownoutLatched).toBe(true);

    latest = normalizeStation(
      {
        Alliance: AllianceType.Red,
        Station: StationType.Station1,
        TeamNumber: 254,
        Battery: 12.1,
        Brownout: false,
      },
      minBatteryMap,
      brownoutLatchMap
    );

    expect(latest.brownoutLatched).toBe(false);
  });

  it('swaps the default alliance sides and lets mirror restore the opposite layout', () => {
    const stations = [
      createStation(AllianceType.Red, StationType.Station2, { teamNumber: 222 }),
      createStation(AllianceType.Blue, StationType.Station3, { teamNumber: 333 }),
      createStation(AllianceType.Red, StationType.Station1, { teamNumber: 111 }),
      createStation(AllianceType.Blue, StationType.Station1, { teamNumber: 444 }),
      createStation(AllianceType.Red, StationType.Station3, { teamNumber: 555 }),
      createStation(AllianceType.Blue, StationType.Station2, { teamNumber: 666 }),
    ];

    const matchStatus = normalizeMatchStatus({
      MatchState: MatchStateType.MatchTeleop,
      MatchNumber: 42,
      PlayNumber: 1,
      TournamentLevel: 'Qualification',
    });

    const defaultPanels = buildPanels(stations, false, matchStatus);
    expect(defaultPanels.map((panel) => panel.alliance)).toEqual(['blue', 'red']);
    expect(defaultPanels[1].rows.map((row) => row.station)).toEqual(['Stn 3', 'Stn 2', 'Stn 1']);

    const mirroredPanels = buildPanels(stations, true, matchStatus);
    expect(mirroredPanels.map((panel) => panel.alliance)).toEqual(['red', 'blue']);
    expect(mirroredPanels[0].rows.map((row) => row.station)).toEqual(['Stn 1', 'Stn 2', 'Stn 3']);
  });

  it('parses replay recordings and derives duration from metadata or the last event', () => {
    const parsed = parseReplayRecording(
      JSON.stringify({
        version: 2,
        meta: { durationMs: 950 },
        initialState: { stations: [] },
        events: [{ t: '125', source: 'fieldHub', event: 'fieldMonitorDataChanged', payload: [] }],
      })
    );

    expect(parsed.version).toBe(2);
    expect(parsed.events[0]).toEqual({
      t: 125,
      source: 'fieldHub',
      event: 'fieldMonitorDataChanged',
      payload: [],
    });
    expect(getReplayDurationMs(parsed)).toBe(950);
    expect(
      getReplayDurationMs({
        events: [{ t: 200 }, { t: 725 }],
      })
    ).toBe(725);
  });

  it('validates replay recordings before use', () => {
    expect(() => parseReplayRecording(JSON.stringify({}))).toThrow('Replay file is missing an events array.');
    expect(() => parseReplayRecording(JSON.stringify({ events: [null] }))).toThrow('Replay event 1 is invalid.');
  });

  it('creates safe recording filenames from labels or match metadata', () => {
    const startedAt = new Date(2024, 0, 2, 3, 4, 5);

    expect(
      createRecordingFilename('QM 42 / Finals', normalizeMatchStatus(), startedAt)
    ).toBe('field-monitor-qm-42-finals-20240102-030405.json');

    expect(
      createRecordingFilename(
        '',
        normalizeMatchStatus({
          MatchState: MatchStateType.MatchTeleop,
          MatchNumber: 88,
          PlayNumber: 2,
          TournamentLevel: 'Quarterfinal',
        }),
        startedAt
      )
    ).toBe('field-monitor-quarterfinal-match-88-play-2-20240102-030405.json');
  });

  it('normalizes empty match status payloads into a safe default state', () => {
    expect(normalizeMatchStatus()).toEqual({
      matchState: MatchStateType.WaitingForPrestart,
      matchNumber: 0,
      playNumber: 0,
      tournamentLevel: 'Unknown',
      matchStateMessage: 'Waiting for live data',
    });
  });

  it('treats set audience as waiting for the match to be ready', () => {
    expect(
      normalizeMatchStatus({
        MatchState: MatchStateType.WaitingForSetAudience,
      }).matchStateMessage
    ).toBe('WAITING FOR MATCH READY');

    expect(
      normalizeMatchStatus({
        MatchState: MatchStateType.WaitingForSetAudienceTO,
      }).matchStateMessage
    ).toBe('WAITING FOR MATCH READY');
  });

  it('supports both short and long station payload keys', () => {
    const minBatteryMap = new Map();
    const brownoutLatchMap = new Map();

    const station = normalizeStation(
      {
        p1: AllianceType.Blue,
        p2: StationType.Station2,
        p3: 1678,
        p4: true,
        p5: true,
        p6: true,
        p7: true,
        p8: true,
        p9: true,
        pa: false,
        pe: 12.7,
        pg: 9,
        ph: 1,
        pz: 6.2,
        paa: 2.4,
        pbb: 3.8,
        pll: RadioConnectionQuality.Excellent,
        pmm: true,
      },
      minBatteryMap,
      brownoutLatchMap
    );

    expect(station).toMatchObject({
      alliance: AllianceType.Blue,
      station: StationType.Station2,
      teamNumber: 1678,
      battery: 12.7,
      averageTripTime: 9,
      lostPackets: 1,
      dataRateTotal: 6.2,
      dataRateToRobot: 2.4,
      dataRateFromRobot: 3.8,
      radioConnectedToAp: true,
    });
  });

  it('treats battery at 7.0V as a critical row but keeps 7.1V normal', () => {
    const thresholdRow = createHealthyRow({ battery: 7.0, minBattery: 7.0 });
    const safeRow = createHealthyRow({ battery: 7.1, minBattery: 7.1 });

    expect(thresholdRow.battery).toMatchObject({
      value: '7.0V',
      min: '7.0',
      tone: 'critical',
      action: 'LOW BATT',
    });
    expect(thresholdRow.mode).toBe('critical');
    expect(safeRow.battery.tone).toBe('normal');
    expect(safeRow.mode).toBe('normal');
  });

  it('exposes explicit radio bars and live link flags in row data', () => {
    const row = createHealthyRow({ radioConnectionQuality: RadioConnectionQuality.Caution });

    expect(row.radio).toMatchObject({
      label: 'Radio',
      state: 'warn',
      detail: '2 bars',
      bars: 2,
      connectedToAp: true,
      linkActive: true,
    });
  });

  it('keeps the radio warning separate when the field sees the radio but the live link is down', () => {
    const row = createHealthyRow({
      linkActive: false,
      radioConnectedToAp: true,
      radioConnectionQuality: RadioConnectionQuality.Excellent,
    });

    expect(row.radio).toMatchObject({
      state: 'warn',
      detail: '4 bars',
      bars: 4,
      connectedToAp: true,
      linkActive: false,
    });
    expect(row.mode).toBe('degraded');
  });

  it('drops the unused secondaryText field from built rows', () => {
    const row = createHealthyRow();

    expect(row).not.toHaveProperty('secondaryText');
  });
});
