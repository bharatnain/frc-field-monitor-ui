import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  fieldMonitorTypes,
  resetFieldMonitorLiveTestState,
  useFieldMonitorLiveData,
} from './fieldMonitorLive';
import { createFakeHubFactory } from '../test/fakeSignalR';

const { AllianceType, MatchStateType, MonitorStatusType, RadioConnectionQuality, StationType } = fieldMonitorTypes;

function createStationPayload(overrides = {}) {
  return {
    Alliance: AllianceType.Red,
    Station: StationType.Station1,
    TeamNumber: 254,
    Connection: true,
    LinkActive: true,
    DSLinkActive: true,
    RadioLink: true,
    RIOLink: true,
    IsEnabled: true,
    IsAuto: false,
    Battery: 12.4,
    AverageTripTime: 7,
    LostPackets: 1,
    DataRateTotal: 4.8,
    DataRateToRobot: 1.9,
    DataRateFromRobot: 2.9,
    MonitorStatus: MonitorStatusType.EnabledTeleop,
    RadioConnectionQuality: RadioConnectionQuality.Excellent,
    RadioConnectedToAp: true,
    ...overrides,
  };
}

function createReplayFile(recording, name = 'recording.json') {
  return {
    name,
    text: vi.fn().mockResolvedValue(JSON.stringify(recording)),
  };
}

async function flushPromises() {
  await Promise.resolve();
}

describe('useFieldMonitorLiveData', () => {
  beforeEach(() => {
    resetFieldMonitorLiveTestState();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        item1: 'Qualification',
        item2: 42,
        item3: 1,
      }),
    });
  });

  afterEach(() => {
    resetFieldMonitorLiveTestState();
  });

  it('bootstraps live data, handles hub events, and cleans up both SignalR connections', async () => {
    const hubFactory = createFakeHubFactory();
    const { result, unmount } = renderHook(() =>
      useFieldMonitorLiveData({
        hubConnectionFactory: hubFactory.factory,
      })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://10.0.100.5/api/v1.0/fieldMonitor/get/GetCurrentMatchAndPlayNumber'
    );

    const fieldHub = hubFactory.getHubByName('fieldMonitorHub');
    const infrastructureHub = hubFactory.getHubByName('infrastructureHub');

    expect(fieldHub).toBeTruthy();
    expect(infrastructureHub).toBeTruthy();

    act(() => {
      fieldHub.emit('fieldMonitorDataChanged', [createStationPayload()]);
      infrastructureHub.emit('matchStatusInfoChanged', {
        MatchState: MatchStateType.MatchTeleop,
        MatchNumber: 42,
        PlayNumber: 1,
        TournamentLevel: 'Qualification',
      });
      infrastructureHub.emit('ScheduleAheadBehindChanged', 'Ahead by 1');
    });

    await waitFor(() => {
      expect(result.current.hasLiveData).toBe(true);
    });

    expect(result.current.scheduleStatus).toBe('Ahead by 1');
    expect(result.current.matchStatus.matchNumber).toBe(42);
    expect(result.current.alliancePanels[0].rows[0]).toMatchObject({
      team: '254',
      station: 'Stn 1',
    });

    act(() => {
      fieldHub.emitClose();
      infrastructureHub.emitClose();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });

    unmount();

    expect(fieldHub.stop).toHaveBeenCalledTimes(1);
    expect(infrastructureHub.stop).toHaveBeenCalledTimes(1);
  });

  it('records live hub traffic and downloads a JSON capture', async () => {
    const hubFactory = createFakeHubFactory();
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:recording');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const { result } = renderHook(() =>
      useFieldMonitorLiveData({
        hubConnectionFactory: hubFactory.factory,
      })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const fieldHub = hubFactory.getHubByName('fieldMonitorHub');
    const infrastructureHub = hubFactory.getHubByName('infrastructureHub');

    act(() => {
      result.current.recorder.startRecording('qm-42');
    });

    act(() => {
      fieldHub.emit('fieldMonitorDataChanged', [createStationPayload()]);
      infrastructureHub.emit('matchStatusInfoChanged', {
        MatchState: MatchStateType.MatchTeleop,
        MatchNumber: 42,
        PlayNumber: 1,
        TournamentLevel: 'Qualification',
      });
    });

    await waitFor(() => {
      expect(result.current.recorder.eventCount).toBe(2);
    });

    act(() => {
      result.current.recorder.stopRecordingAndDownload();
    });

    await waitFor(() => {
      expect(result.current.recorder.isRecording).toBe(false);
    });

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:recording');
    expect(result.current.recorder.lastDownloadName).toContain('field-monitor-qm-42-');
    expect(result.current.recorder.lastEventCount).toBe(2);

    const blob = createObjectURLSpy.mock.calls[0][0];
    const recording = JSON.parse(await blob.text());

    expect(recording.meta.label).toBe('qm-42');
    expect(recording.events).toHaveLength(2);
    expect(recording.events[0].event).toBe('fieldMonitorDataChanged');
  });

  it('loads replay files, advances through events with fake timers, and returns to live mode', async () => {
    const hubFactory = createFakeHubFactory();
    const { result } = renderHook(() =>
      useFieldMonitorLiveData({
        hubConnectionFactory: hubFactory.factory,
      })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 2, 3, 4, 5));

    const file = createReplayFile({
      version: 1,
      meta: { durationMs: 1000 },
      initialState: {
        stations: [],
        matchStatus: {
          matchState: MatchStateType.WaitingForPrestart,
          matchNumber: 0,
          playNumber: 0,
          tournamentLevel: 'Unknown',
          matchStateMessage: 'Waiting for live data',
        },
        aheadBehind: '',
        aheadBehindKnown: false,
      },
      events: [
        {
          t: 250,
          source: 'fieldHub',
          event: 'fieldMonitorDataChanged',
          payload: [createStationPayload()],
        },
        {
          t: 500,
          source: 'infrastructureHub',
          event: 'ScheduleAheadBehindChanged',
          payload: 'Behind by 1',
        },
      ],
    });

    await act(async () => {
      await result.current.replay.loadReplayFile(file);
      await flushPromises();
    });

    expect(result.current.sourceMode).toBe('replay');
    expect(result.current.replay.fileName).toBe('recording.json');
    expect(result.current.replay.isPlaying).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
      await flushPromises();
    });

    expect(result.current.hasLiveData).toBe(true);

    act(() => {
      result.current.replay.pauseReplay();
    });

    expect(result.current.replay.isPlaying).toBe(false);
    expect(result.current.replay.currentTimeMs).toBeGreaterThanOrEqual(250);

    act(() => {
      result.current.replay.setReplaySpeed(2);
      result.current.replay.resumeReplay();
    });

    expect(result.current.replay.speed).toBe(2);
    expect(result.current.replay.isPlaying).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
      await flushPromises();
    });

    expect(result.current.scheduleStatus).toBe('Behind by 1');
    expect(result.current.replay.isPlaying).toBe(false);

    expect(result.current.replay.currentTimeMs).toBe(1000);

    act(() => {
      result.current.replay.restartReplay();
    });

    expect(result.current.replay.currentTimeMs).toBe(0);
    expect(result.current.replay.isPlaying).toBe(true);

    act(() => {
      result.current.replay.clearReplay();
    });

    expect(result.current.sourceMode).toBe('live');
    expect(result.current.replay.isReplayMode).toBe(false);
    expect(result.current.scheduleStatus).toBe('Unknown');
  });

  it('surfaces replay file parsing errors without leaving live mode', async () => {
    const hubFactory = createFakeHubFactory();
    const { result } = renderHook(() =>
      useFieldMonitorLiveData({
        hubConnectionFactory: hubFactory.factory,
      })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const badFile = {
      name: 'broken.json',
      text: vi.fn().mockResolvedValue('{}'),
    };

    let didLoad = true;
    await act(async () => {
      didLoad = await result.current.replay.loadReplayFile(badFile);
    });

    expect(didLoad).toBe(false);
    expect(result.current.sourceMode).toBe('live');
    expect(result.current.replay.error).toBe('Replay file is missing an events array.');
    expect(result.current.error).toBe('Replay file is missing an events array.');
  });
});
