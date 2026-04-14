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
  groupingSize: 0,
  groupingUnit: 'cm',
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

const generateDummyShots = (count: number): ShotRecord[] => {
  const shots: ShotRecord[] = [];
  for (let i = 0; i < count; i++) {
    const isHit = Math.random() > 0.3;
    shots.push({
      id: `SH-${Date.now()}-${i}`,
      x: 25 + Math.random() * 50,
      y: 15 + Math.random() * 70,
      zone: isHit ? Math.ceil(Math.random() * 5) : 0,
      score: isHit ? Math.ceil(Math.random() * 10) : 0,
      isHit,
      timestamp: Date.now() + i * 3000,
    });
  }
  return shots;
};

const generateDummySessions = (laneId: number): SessionRecord[] => {
  const trainees = sampleTrainees[laneId - 1] || [];
  if (trainees.length === 0) return [];

  const weapons = ['M4A1', 'M16A4', 'M249', 'M9'];
  const practices: ('grouping' | 'application' | 'timed' | 'snapshot')[] = ['grouping', 'application', 'timed', 'snapshot'];
  const positions = ['Prone Supported', 'Prone Unsupported', 'Kneeling', 'Standing'];
  const targets = ['fig11', 'fig12', 'fig120cm', 'fig120x4'];
  const records: SessionRecord[] = [];

  const daysAgo = [0, 1, 1, 2, 3, 5, 7, 10];

  trainees.forEach((t, ti) => {
    const numSessions = 2 + Math.floor(Math.random() * 3);
    for (let s = 0; s < numSessions; s++) {
      const shots = generateDummyShots(20 + Math.floor(Math.random() * 20));
      const hits = shots.filter((sh) => sh.isHit).length;
      const score = shots.reduce((sum, sh) => sum + sh.score, 0);
      const day = daysAgo[(ti * numSessions + s) % daysAgo.length];
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

      records.push({
        id: `SR-${laneId}${ti}${s}-${1000 + records.length}`,
        traineeId: t.id,
        traineeName: t.name,
        traineeRank: t.rank,
        laneId,
        practiceType: practices[s % practices.length],
        weapon: weapons[s % weapons.length],
        firingPosition: positions[s % positions.length],
        targetType: targets[s % targets.length],
        range: [25, 50, 100, 200, 300][s % 5],
        timeOfDay: s % 2 === 0 ? 'day' : 'night',
        visibility: 100,
        roundsAllotted: 40,
        shotsFired: shots.length,
        hits,
        score,
        maxScore: 400,
        shots,
        date: date.toISOString(),
      });
    }
  });

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

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
  sessionHistory: generateDummySessions(id),
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
  setTrainee: (laneId: number, trainee: Trainee) => void;
  clearTrainee: (laneId: number) => void;
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

  setTrainee: (laneId, trainee) =>
    set((s) => ({
      lanes: s.lanes.map((l) =>
        l.id === laneId ? { ...l, traineeQueue: [trainee] } : l
      ),
    })),

  clearTrainee: (laneId) =>
    set((s) => ({
      lanes: s.lanes.map((l) =>
        l.id === laneId ? { ...l, traineeQueue: [] } : l
      ),
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
