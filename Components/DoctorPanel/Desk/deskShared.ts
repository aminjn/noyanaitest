// Front-desk helpers (2026-10), shared by the desk booking, move and days
// off forms. The API takes days as "YYYY-MM-DD" (a Tehran calendar day).
// toYmd reads the day a date picker returned (the picker works in the
// device's calendar, so the day clicked is its local day); "today" is
// Tehran's: tehranTodayYmd() (Components/helpers/tehranTime.ts).
export const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// a "YYYY-MM-DD" day as the date picker's own value (its local noon)
export { pickerDate } from "../../helpers/tehranTime";

export type DeskSlot = {
  start: number;
  end: number;
  office: { _id: string; name?: string } | null;
  sessionTypes: string[];
  taken: boolean;
  past: boolean;
};

export type PickedSlot = { date: string; start: number; end: number };

export const deskSessionTypes = ["inPerson", "phone", "voiceCall", "videoCall", "textChat"] as const;

export { formatPhone } from "../../helpers/formatPhone";
