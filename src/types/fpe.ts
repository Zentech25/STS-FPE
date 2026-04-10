export interface Trainee {
  id: string;
  name: string;
  rank: string;
}

export type PracticeType = "grouping" | "application" | "timed" | "snapshot";
export type TimeOfDay = "day" | "night";
export type SessionStatus = "standby" | "live" | "paused";
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
}
