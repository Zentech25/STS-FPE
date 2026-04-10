import type { LaneState } from '@/types/fpe';

export interface FireTypeEntry {
  id: string;
  label: string;
  practices: string[];
}

export interface WeaponFireMap {
  [weaponId: string]: FireTypeEntry[];
}

export interface ARCConfigLoaded {
  weapon: string;
  typeOfFire: string;
  nameOfPractice: string;
  firingPosition: string;
  firingRange: number;
  typeOfTarget: string;
  practiceType: string;
  roundsAllotted: number;
  timeOfPractice: "day" | "night";
  timeSec: number;
  exposures: number;
  upTime: number;
  downTime: number;
}

// Default fire map matching Apex Command Console
export const DEFAULT_FIRE_MAP: WeaponFireMap = {
  'M4A1': [
    { id: "basic-mm", label: "ALL Armed and Services(Recruits) - Basic MM(Classification)", practices: ["BM1(TRB)", "BM2(GRP)"] },
    { id: "adv-marks", label: "Infantry - Advanced Marksmanship", practices: ["AM1(APP)", "AM2(TMD)"] },
  ],
  'M16A4': [
    { id: "basic-mm", label: "ALL Armed and Services(Recruits) - Basic MM(Classification)", practices: ["BM1(TRB)"] },
    { id: "sf-cqb", label: "Special Forces - CQB", practices: ["CQB1(SNP)"] },
  ],
  'M249': [
    { id: "basic-mm", label: "Basic Qualification", practices: ["BQ1(APP)", "BQ2(TMD)"] },
  ],
  'M9': [
    { id: "pistol-qual", label: "Pistol Qualification", practices: ["PQ1(GRP)", "PQ2(APP)"] },
  ],
};

// Sample saved ARC configs
export const SAMPLE_ARC_CONFIGS: ARCConfigLoaded[] = [
  {
    weapon: "M4A1", typeOfFire: "basic-mm", nameOfPractice: "BM1(TRB)",
    firingPosition: "Prone Supported", firingRange: 100, typeOfTarget: "fig120cm",
    practiceType: "Grouping", roundsAllotted: 5, timeOfPractice: "day",
    timeSec: 0, exposures: 0, upTime: 0, downTime: 0,
  },
  {
    weapon: "M4A1", typeOfFire: "basic-mm", nameOfPractice: "BM2(GRP)",
    firingPosition: "Prone Supported", firingRange: 100, typeOfTarget: "fig120cm",
    practiceType: "Grouping", roundsAllotted: 5, timeOfPractice: "day",
    timeSec: 0, exposures: 0, upTime: 0, downTime: 0,
  },
  {
    weapon: "M4A1", typeOfFire: "adv-marks", nameOfPractice: "AM1(APP)",
    firingPosition: "Kneeling", firingRange: 200, typeOfTarget: "fig11",
    practiceType: "Application", roundsAllotted: 10, timeOfPractice: "day",
    timeSec: 60, exposures: 0, upTime: 0, downTime: 0,
  },
  {
    weapon: "M4A1", typeOfFire: "adv-marks", nameOfPractice: "AM2(TMD)",
    firingPosition: "Standing", firingRange: 50, typeOfTarget: "fig12",
    practiceType: "Timed", roundsAllotted: 10, timeOfPractice: "day",
    timeSec: 30, exposures: 0, upTime: 0, downTime: 0,
  },
  {
    weapon: "M16A4", typeOfFire: "basic-mm", nameOfPractice: "BM1(TRB)",
    firingPosition: "Prone Supported", firingRange: 100, typeOfTarget: "fig120cm",
    practiceType: "Grouping", roundsAllotted: 5, timeOfPractice: "day",
    timeSec: 0, exposures: 0, upTime: 0, downTime: 0,
  },
  {
    weapon: "M16A4", typeOfFire: "sf-cqb", nameOfPractice: "CQB1(SNP)",
    firingPosition: "Standing", firingRange: 25, typeOfTarget: "fig12",
    practiceType: "Snap Shot", roundsAllotted: 8, timeOfPractice: "day",
    timeSec: 0, exposures: 4, upTime: 3, downTime: 5,
  },
  {
    weapon: "M249", typeOfFire: "basic-mm", nameOfPractice: "BQ1(APP)",
    firingPosition: "Prone Supported", firingRange: 300, typeOfTarget: "fig11",
    practiceType: "Application", roundsAllotted: 20, timeOfPractice: "day",
    timeSec: 120, exposures: 0, upTime: 0, downTime: 0,
  },
  {
    weapon: "M249", typeOfFire: "basic-mm", nameOfPractice: "BQ2(TMD)",
    firingPosition: "Prone Supported", firingRange: 200, typeOfTarget: "fig11",
    practiceType: "Timed", roundsAllotted: 15, timeOfPractice: "night",
    timeSec: 45, exposures: 0, upTime: 0, downTime: 0,
  },
  {
    weapon: "M9", typeOfFire: "pistol-qual", nameOfPractice: "PQ1(GRP)",
    firingPosition: "Standing", firingRange: 25, typeOfTarget: "fig120x4",
    practiceType: "Grouping", roundsAllotted: 5, timeOfPractice: "day",
    timeSec: 0, exposures: 0, upTime: 0, downTime: 0,
  },
  {
    weapon: "M9", typeOfFire: "pistol-qual", nameOfPractice: "PQ2(APP)",
    firingPosition: "Standing", firingRange: 15, typeOfTarget: "fig120x4",
    practiceType: "Application", roundsAllotted: 10, timeOfPractice: "day",
    timeSec: 60, exposures: 0, upTime: 0, downTime: 0,
  },
];

export function getFireTypes(weaponId: string): FireTypeEntry[] {
  return DEFAULT_FIRE_MAP[weaponId] ?? [];
}

export function getPractices(weaponId: string, fireTypeId: string): string[] {
  const ft = getFireTypes(weaponId).find((f) => f.id === fireTypeId);
  return ft?.practices ?? [];
}

export function getARCConfig(weaponId: string, fireTypeId: string, practice: string): ARCConfigLoaded | undefined {
  return SAMPLE_ARC_CONFIGS.find((c) => c.weapon === weaponId && c.typeOfFire === fireTypeId && c.nameOfPractice === practice);
}
