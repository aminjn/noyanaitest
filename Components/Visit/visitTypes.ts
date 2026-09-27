import { ContentKey } from "../Enums/contentKeys";

// Mirrors noyanai-back Models/VisitIntake.ts and Models/VisitNote.ts.
export const intakeOnsets = ["today", "days", "week", "month", "longer"] as const;
export const intakeConditions = ["diabetes", "hypertension", "heart", "asthma", "kidney", "thyroid", "pregnancy"] as const;
export const intakeRedFlags = ["chestPain", "breathing", "fainting", "bleeding", "weakness", "highFever"] as const;

export type IntakeOnset = (typeof intakeOnsets)[number];
export type IntakeCondition = (typeof intakeConditions)[number];
export type IntakeRedFlag = (typeof intakeRedFlags)[number];

export interface IVisitIntake {
  _id: string;
  complaint: string;
  onset?: IntakeOnset;
  severity?: number;
  conditions?: IntakeCondition[];
  medications?: string;
  allergies?: string;
  redFlags?: IntakeRedFlag[];
  notes?: string;
  aiSummary?: string;
  aiQuestions?: string[];
  submittedAt?: string;
  updatedAt?: string;
}

export interface IVisitNote {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  patientInstructions?: string;
  transcript?: string;
  aiAssisted?: boolean;
  updatedAt?: string;
}

export const onsetKeys: Record<IntakeOnset, ContentKey> = {
  today: "visitOnsetToday",
  days: "visitOnsetDays",
  week: "visitOnsetWeek",
  month: "visitOnsetMonth",
  longer: "visitOnsetLonger",
};

export const conditionKeys: Record<IntakeCondition, ContentKey> = {
  diabetes: "visitCondDiabetes",
  hypertension: "visitCondHypertension",
  heart: "visitCondHeart",
  asthma: "visitCondAsthma",
  kidney: "visitCondKidney",
  thyroid: "visitCondThyroid",
  pregnancy: "visitCondPregnancy",
};

export const redFlagKeys: Record<IntakeRedFlag, ContentKey> = {
  chestPain: "visitFlagChestPain",
  breathing: "visitFlagBreathing",
  fainting: "visitFlagFainting",
  bleeding: "visitFlagBleeding",
  weakness: "visitFlagWeakness",
  highFever: "visitFlagHighFever",
};

// Only keep values the current build knows (guards against bad data).
export const known = <T extends string>(list: readonly T[], values: unknown): T[] =>
  Array.isArray(values) ? values.filter((v): v is T => list.includes(v as T)) : [];
