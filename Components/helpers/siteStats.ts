import { useMemo } from "react";
import { useIntlLocale } from "@/Components/i18n/navigation";

// Mirrors the backend's Lib/siteStats.ts: every public number (home, about,
// insurance list) is counted from the site's own data (2026-09).
export type SiteStats = {
  doctors: number;
  pharmacies: number;
  labs: number;
  centers: number;
  patients: number;
  users: number;
  consultations: number;
  satisfactionPercent: number | null;
  feedbackCount: number;
  insurers: number;
  insuranceCenters: number;
  insuranceDoctors: number;
};

export const useStatFormat = () => {
  const intlTag = useIntlLocale();
  return useMemo(() => {
    const num = new Intl.NumberFormat(intlTag);
    const percent = new Intl.NumberFormat(intlTag, { style: "percent" });
    return {
      count: (value?: number | null) =>
        typeof value === "number" ? num.format(value) : "",
      percent: (value?: number | null) =>
        typeof value === "number" ? percent.format(value / 100) : "",
    };
  }, [intlTag]);
};
