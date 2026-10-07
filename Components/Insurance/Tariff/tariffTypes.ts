// An insurer's coverage rule (backend Models/InsuranceTariff.ts, 2026-10).
export const tariffVisitKinds = ["any", "inPerson", "online"] as const;
export type TariffVisitKind = (typeof tariffVisitKinds)[number];
export const tariffLevels = ["any", "general", "specialist", "subspecialist"] as const;
export type TariffLevel = (typeof tariffLevels)[number];
export const tariffMethods = ["percent", "govTariff", "fixed"] as const;
export type TariffMethod = (typeof tariffMethods)[number];
export const tariffLimitPeriods = ["none", "month", "year"] as const;
export type TariffLimitPeriod = (typeof tariffLimitPeriods)[number];

type Ref = string | { _id: string; name?: string } | null;

export type InsuranceTariff = {
  _id: string;
  insurance?: Ref;
  plan?: Ref;
  title?: string;
  visitKind?: TariffVisitKind;
  level?: TariffLevel;
  speciality?: Ref;
  service?: Ref;
  method?: TariffMethod;
  percent?: number;
  amount?: number;
  govTariff?: number;
  ceiling?: number;
  copay?: number;
  limitPeriod?: TariffLimitPeriod;
  limitCount?: number;
  limitAmount?: number;
  validFrom?: string | null;
  validTo?: string | null;
  active?: boolean;
  note?: string;
};
