// Which parts of the CRM's engagement and service side each provider
// profile gets, and in which words (2026-10, docs/nexxa-crm-engagement-
// parity.md, "per profile"). Nexxa is the source of the features; each
// profile takes only what fits its work:
//   doctor     - a light club and sequences, pre-/post-visit checklists,
//                patient tickets, tasks for the secretary; the knowledge
//                base and quizzes only once the doctor has staff
//   clinic,
//   hospital   - everything: staff knowledge and quizzes, SLA tickets,
//                surgery checklists, timesheet
//   pharmacy   - a customer loyalty club, refill reminder sequences,
//                returns and after-sales; no surgery checklists
//   paraClinic - pre-test preparation sequences, sample checklists
//   insurance  - member tickets with SLA, member sequences; no club, no
//                returns, no clinical checklists
// Used by the sidebar (Components/Layout/panelSections.tsx) and the
// section's own sub-menu (CrmSection).

export type CrmProfile = "doctor" | "clinic" | "hospital" | "pharmacy" | "paraClinic" | "insurance";
export type ServicePart = "club" | "sequences" | "flows" | "tickets" | "tasks" | "timesheet" | "calendar" | "checklists" | "knowledge" | "quizzes" | "returns";

const ALL: ServicePart[] = ["club", "sequences", "flows", "tickets", "tasks", "timesheet", "calendar", "checklists", "knowledge", "quizzes", "returns"];

export const PROFILE_PARTS: Record<CrmProfile, ServicePart[]> = {
  doctor: ["club", "sequences", "flows", "tickets", "tasks", "calendar", "checklists", "knowledge", "quizzes", "returns"],
  clinic: ALL,
  hospital: ALL,
  pharmacy: ["club", "sequences", "flows", "tickets", "tasks", "timesheet", "calendar", "checklists", "knowledge", "quizzes", "returns"],
  paraClinic: ["club", "sequences", "flows", "tickets", "tasks", "timesheet", "calendar", "checklists", "knowledge", "quizzes", "returns"],
  insurance: ["sequences", "flows", "tickets", "tasks", "timesheet", "calendar", "knowledge", "quizzes"],
};

// parts that need a team (a doctor working alone has no one to train)
export const TEAM_PARTS: ServicePart[] = ["knowledge", "quizzes", "timesheet"];

export const isProfile = (v: unknown): v is CrmProfile => typeof v === "string" && v in PROFILE_PARTS;

// does this profile get this part? (`hasTeam`: the panel has secretaries)
export const partOn = (profile: CrmProfile | undefined, part: ServicePart, hasTeam = true) => {
  if (!profile) return true;
  if (!PROFILE_PARTS[profile].includes(part)) return false;
  return profile !== "doctor" || hasTeam || !TEAM_PARTS.includes(part);
};

// a part's title in the profile's own words: "crmeNavClub" becomes
// "crmeNavClub_pharmacy" (customers' club) where the profile has its own
const WORDED: Partial<Record<CrmProfile, ServicePart[]>> = {
  pharmacy: ["club", "tickets"],
  insurance: ["tickets", "sequences"],
  paraClinic: ["sequences", "checklists"],
  hospital: ["tickets"],
};
export const partTitle = (profile: CrmProfile | undefined, base: string, part: ServicePart) =>
  profile && WORDED[profile]?.includes(part) ? `${base}_${profile}` : base;

// the people a page is about, in the profile's own words (the way the sales
// side does it with WORDS in CrmSales/salesShared.tsx): a pharmacy serves
// customers, an insurer its members; "crmePatient" becomes
// "crmePatient_pharmacy". The service pages read every key through it
// (useCrmText in svc.tsx), and so does the section's hint (CrmSection).
const PEOPLE_KEYS: Partial<Record<CrmProfile, string[]>> = {
  pharmacy: [
    "crmePatient",
    "crmeAboutPatient",
    "crmeInternalNote",
    "crmeReplyPlaceholder",
    "crmeTkPending",
    "crmeStartFor",
    "crmeStartForPatient",
    "crmeTemplateHint",
    "crmeAsTemplate",
    "crmeRetCredit",
    "crmeNavTicketsHint",
    "crmeNavTasksHint",
    "crmeNavChecklistsHint",
    "crmPickContact",
  ],
  insurance: ["crmePatient", "crmeAboutPatient", "crmeInternalNote", "crmeReplyPlaceholder", "crmeTkPending", "crmeNavTicketsHint", "crmeNavTasksHint", "crmPickContact"],
};
export const profileKey = (profile: CrmProfile | undefined, key: string) => (profile && PEOPLE_KEYS[profile]?.includes(key) ? `${key}_${profile}` : key);
