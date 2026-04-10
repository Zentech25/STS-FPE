import { create } from 'zustand';
import type { LaneState, Trainee, ExerciseConfig, SessionStatus, ControlMode, ShotRecord, SessionRecord, ARCSelection } from '@/types/fpe';

const defaultExercise = (laneId: number): ExerciseConfig => ({
  laneId,
  type: 'custom',
  name: 'Standard Qualification',
  practiceType: 'application',
  weapon: 'M4A1',
  firingPosition: 'Prone Supported',
  range: 300,
  rounds: 40,
  timeOfDay: 'day',
  visibility: 100,
  targetType: 'fig120cm',
  timeLimit: 0,
  exposure: 0,
  upTime: 0,
  downTime: 0,
});

const sampleTrainees: Trainee[][] = [
  [
    { id: 'T001', name: 'Johnson, M.', rank: 'PFC' },
    { id: 'T002', name: 'Williams, K.', rank: 'SPC' },
    { id: 'T003', name: 'Davis, R.', rank: 'PV2' },
  ],
  [
    { id: 'T004', name: 'Martinez, A.', rank: 'SGT' },
    { id: 'T005', name: 'Brown, J.', rank: 'PFC' },
  ],
  [
    { id: 'T006', name: 'Taylor, S.', rank: 'CPL' },
  ],
  [],
];

const createLane = (id: number): LaneState => ({
  id,
  status: 'standby',
  mode: 'firer',
  traineeQueue: sampleTrainees[id - 1] || [],
  exercise: defaultExercise(id),
  shotsFired: 0,
  score: 0,
  hits: 0,
  shots: [],
  sessionHistory: [],
  arcSelection: { weapon: '', fireType: '', practice: '' },
});

interface FPEStore {
  lanes: LaneState[];
  selectedLaneId: number | null;
  selectLane: (id: number) => void;
  clearLane: () => void;
  setStatus: (laneId: number, status: SessionStatus) => void;
  setMode: (laneId: number, mode: ControlMode) => void;
  updateExercise: (laneId: number, config: Partial<ExerciseConfig>) => void;
  addTrainee: (laneId: number, trainee: Trainee) => void;
  removeTrainee: (laneId: number, traineeId: string) => void;
  reorderQueue: (laneId: number, fromIndex: number, toIndex: number) => void;
  fireShot: (laneId: number, shot: ShotRecord) => void;
  resetSession: (laneId: number) => void;
  saveSession: (laneId: number) => void;
  updateArcSelection: (laneId: number, sel: Partial<ARCSelection>) => void;
}

export const useFPEStore = create<FPEStore>((set) => ({
  lanes: [1, 2, 3, 4].map(createLane),
  selectedLaneId: 1,

  selectLane: (id) => set({ selectedLaneId: id }),
  clearLane: () => {},

  setStatus: (laneId, status) =>
    set((s) => ({
      lanes: s.lanes.map((l) => (l.id === laneId ? { ...l, status } : l)),
    })),

  setMode: (laneId, mode) =>
    set((s) => ({
      lanes: s.lanes.map((l) => (l.id === laneId ? { ...l, mode } : l)),
    })),

  updateExercise: (laneId, config) =>
    set((s) => ({
      lanes: s.lanes.map((l) =>
        l.id === laneId ? { ...l, exercise: { ...l.exercise, ...config } } : l
      ),
    })),

  addTrainee: (laneId, trainee) =>
    set((s) => ({
      lanes: s.lanes.map((l) =>
        l.id === laneId ? { ...l, traineeQueue: [...l.traineeQueue, trainee] } : l
      ),
    })),

  removeTrainee: (laneId, traineeId) =>
    set((s) => ({
      lanes: s.lanes.map((l) =>
        l.id === laneId
          ? { ...l, traineeQueue: l.traineeQueue.filter((t) => t.id !== traineeId) }
          : l
      ),
    })),

  reorderQueue: (laneId, fromIndex, toIndex) =>
    set((s) => ({
      lanes: s.lanes.map((l) => {
        if (l.id !== laneId) return l;
        const queue = [...l.traineeQueue];
        const [moved] = queue.splice(fromIndex, 1);
        queue.splice(toIndex, 0, moved);
        return { ...l, traineeQueue: queue };
      }),
    })),

  fireShot: (laneId, shot) =>
    set((s) => ({
      lanes: s.lanes.map((l) =>
        l.id === laneId
          ? {
              ...l,
              shotsFired: l.shotsFired + 1,
              hits: shot.isHit ? l.hits + 1 : l.hits,
              score: l.score + shot.score,
              shots: [...l.shots, shot],
            }
          : l
      ),
    })),

  resetSession: (laneId) =>
    set((s) => ({
      lanes: s.lanes.map((l) =>
        l.id === laneId
          ? { ...l, shotsFired: 0, hits: 0, score: 0, shots: [] }
          : l
      ),
    })),

  saveSession: (laneId) =>
    set((s) => ({
      lanes: s.lanes.map((l) => {
        if (l.id !== laneId || l.traineeQueue.length === 0) return l;
        const trainee = l.traineeQueue[0];
        const record: SessionRecord = {
          id: `SR-${Date.now()}`,
          traineeId: trainee.id,
          traineeName: trainee.name,
          traineeRank: trainee.rank,
          laneId: l.id,
          practiceType: l.exercise.practiceType,
          weapon: l.exercise.weapon,
          firingPosition: l.exercise.firingPosition,
          targetType: l.exercise.targetType,
          range: l.exercise.range,
          timeOfDay: l.exercise.timeOfDay,
          visibility: l.exercise.visibility,
          roundsAllotted: l.exercise.rounds,
          shotsFired: l.shotsFired,
          hits: l.hits,
          score: l.score,
          maxScore: l.exercise.rounds * 10,
          shots: [...l.shots],
          date: new Date().toISOString(),
        };
        return {
          ...l,
          sessionHistory: [...l.sessionHistory, record],
        };
      }),
    })),

  updateArcSelection: (laneId, sel) =>
    set((s) => ({
      lanes: s.lanes.map((l) =>
        l.id === laneId
          ? { ...l, arcSelection: { ...l.arcSelection, ...sel } }
          : l
      ),
    })),
}));
