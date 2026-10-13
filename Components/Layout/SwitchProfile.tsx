// The member's panels and where each one lives. The switcher itself is the
// «پنل‌های شما» list in the header's account menu (UserButton.tsx); the
// labels, names and avatars come from usePanelsMaps.

export const panels = [
  "dashboard",
  "secetary",
  "doctor",
  "clinic",
  "paraClinic",
  "hospital",
  "insurance",
  "pharmacy",
] as const;

export type Panel = (typeof panels)[number];

export const panelToDashboardDict: Record<Panel, string> = {
  clinic: "/clinicpanel",
  secetary: "/secretarypanel",
  dashboard: "/dashboard",
  doctor: "/doctorpanel",
  hospital: "/hospitalpanel",
  insurance: "/insurancepanel",
  paraClinic: "/paraClinicPanel",
  pharmacy: "/pharmacypanel",
};
