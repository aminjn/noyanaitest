import { ta } from "@/Components/Admin/i18n/adminText";

// «سیاست هوش مصنوعی» (2026-10): the shapes of backend Lib/ai/aiPolicy.ts and
// Lib/ai/aiFeatures.ts as the admin pages read them, and their labels.

export type AiAccess = "free" | "plan" | "off";
export type AiLimitSet = { day: number; month: number; orgMonth: number };
export type AiFeaturePolicy = {
  access: AiAccess;
  modules: Partial<Record<string, string[]>>;
  pro: boolean;
  limits: { free: AiLimitSet; paid: AiLimitSet };
};
export type AiPolicy = {
  enabled: boolean;
  mode: "free" | "plan" | "off";
  features: Record<string, AiFeaturePolicy>;
  updatedAt?: string;
};
export type AiFeatureDef = {
  key: string;
  group: string;
  audiences: string[];
  unit: "request" | "minute";
  // Persian, shown through ta()
  title: string;
  description: string;
  internal: boolean;
  policy?: AiFeaturePolicy;
};
export type AiPlanRow = {
  kind: string;
  _id: string;
  displayName: string;
  aiFeatures: string[];
  aiQuotas: Record<string, Partial<AiLimitSet>>;
};

export const PROVIDER_KINDS = ["doctor", "clinic", "hospital", "pharmacy", "paraClinic", "insurance"];

export const groupLabel = (g: string) =>
  ({
    assistant: ta("دستیار و گفتار"),
    clinical: ta("بالینی"),
    crm: ta("ارتباط با بیماران"),
    finance: ta("مالی و حسابداری"),
    content: ta("ابزارهای داخلی محتوا"),
  })[g] || g;

export const audienceLabel = (a: string) =>
  ({
    doctor: ta("پزشک"),
    clinic: ta("کلینیک"),
    hospital: ta("بیمارستان"),
    pharmacy: ta("داروخانه"),
    paraClinic: ta("پاراکلینیک"),
    insurance: ta("بیمه"),
    patient: ta("بیمار"),
    staff: ta("کارکنان"),
    admin: ta("مدیر سایت"),
  })[a] || a;

export const unitLabel = (u: string) => (u === "minute" ? ta("دقیقه") : ta("درخواست"));

export const accessOptions = (internal: boolean): Record<string, string> =>
  internal
    ? { free: ta("روشن"), off: ta("خاموش") }
    : { free: ta("رایگان برای همه"), plan: ta("فقط با پلن"), off: ta("خاموش") };

// the plan editor of each kind (the admin's own pages)
export const planPath = (kind: string, id: string) =>
  kind === "patient"
    ? `/licensePlans?tab=patientPro`
    : `/base${kind.charAt(0).toUpperCase()}${kind.slice(1)}License/${id}`;
