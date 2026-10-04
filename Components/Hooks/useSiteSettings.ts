"use client";

import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { useIntlLocale } from "../i18n/navigation";

// The few public site settings the super admin sets (2026-10), sent with the
// site languages by GET /public/locales as `site`:
// - the emergency note of the disease / symptom / drug pages: its number
//   and whether it shows (System settings -> General). The wording is the
//   UI text of each language (seeDoctorWarningNote, drugSafetyNote), with
//   the number as ${1};
// - the patient's free-cancel window in hours (booking settings), the same
//   value the API's cancel rule uses.
// Until the answer arrives, or if it is malformed, the old fixed values
// (115, shown, 24 hours) are used - the page never waits on it.
export type SiteSettings = {
  emergencyNumber: string;
  emergencyNoteEnabled: boolean;
  patientFreeCancelHours: number;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  emergencyNumber: "115",
  emergencyNoteEnabled: true,
  patientFreeCancelHours: 24,
};

const parse = (raw: unknown): SiteSettings => {
  const site =
    raw && typeof raw === "object"
      ? ((raw as { site?: unknown }).site as Record<string, unknown> | undefined)
      : undefined;
  if (!site || typeof site !== "object") return DEFAULT_SITE_SETTINGS;
  const number =
    typeof site.emergencyNumber === "string" && /^[0-9+*#]{2,15}$/.test(site.emergencyNumber.trim())
      ? site.emergencyNumber.trim()
      : DEFAULT_SITE_SETTINGS.emergencyNumber;
  const hours = Number(site.patientFreeCancelHours);
  return {
    emergencyNumber: number,
    emergencyNoteEnabled: site.emergencyNoteEnabled !== false,
    patientFreeCancelHours:
      Number.isFinite(hours) && hours >= 0 && hours <= 168
        ? hours
        : DEFAULT_SITE_SETTINGS.patientFreeCancelHours,
  };
};

const useSiteSettings = () => {
  const intl = useIntlLocale();
  // its own cache key: other pages read the same URL with another shape
  const { data } = useSWR<SiteSettings>(
    [`${API}/public/locales`, "siteSettings"],
    ([url]: [string, string]) => fetcher({ url }).then((res) => parse(res?.data)),
    { revalidateOnFocus: false, dedupingInterval: 60_000 },
  );
  const settings = data || DEFAULT_SITE_SETTINGS;
  // digits in the reader's script (۱۱۵ in Persian); a number with + * # is
  // shown as written
  const localize = (value: string | number) => {
    const text = String(value);
    if (!/^\d+$/.test(text)) return text;
    try {
      return Number(text).toLocaleString(intl, { useGrouping: false });
    } catch {
      return text;
    }
  };
  return {
    ...settings,
    emergencyNumberText: localize(settings.emergencyNumber),
    freeCancelHoursText: localize(settings.patientFreeCancelHours),
  };
};

export default useSiteSettings;
