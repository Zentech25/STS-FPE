export interface Trainee {
  id: string;
  name: string;
  rank: string;
}

export type PracticeType = "grouping" | "application" | "timed" | "snapshot";
export type TimeOfDay = "day" | "night";
export type SessionStatus = "standby" | "live" | "paused" | "completed";
export type ControlMode = "master" | "firer";

export interface ExerciseConfig {
  laneId: number;
  type: "custom" | "arc";
  name: string;
  practiceType: PracticeType;
  weapon: string;
  firingPosition: string;
  range: number;
  rounds: number;
  timeOfDay: TimeOfDay;
  visibility: number;
  targetType: string;
  timeLimit: number;
  exposure: number;
  upTime: number;
  downTime: number;
  groupingSize: number;
  groupingUnit: "cm" | "inches";
}

export interface ShotRecord {
  id: string;
  x: number; // % position on target
  y: number;
  zone: number;
  score: number;
  isHit: boolean;
  timestamp: number;
}

export interface SessionRecord {
  id: string;
  traineeId: string;
  traineeName: string;
  traineeRank: string;
  laneId: number;
  practiceType: PracticeType;
  weapon: string;
  firingPosition: string;
  targetType: string;
  range: number;
  timeOfDay: TimeOfDay;
  visibility: number;
  roundsAllotted: number;
  shotsFired: number;
  hits: number;
  score: number;
  maxScore: number;
  shots: ShotRecord[];
  date: string;
}

export interface ARCSelection {
  weapon: string;
  fireType: string;
  practice: string;
}

export interface LaneState {
  id: number;
  status: SessionStatus;
  mode: ControlMode;
  traineeQueue: Trainee[];
  exercise: ExerciseConfig;
  shotsFired: number;
  score: number;
  hits: number;
  shots: ShotRecord[];
  sessionHistory: SessionRecord[];
  arcSelection: ARCSelection;
  sessionStartTime: number | null;
}
