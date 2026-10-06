// Front-desk helpers (2026-10), shared by the desk booking, move and days
// off forms. The API takes days as "YYYY-MM-DD" (a Tehran calendar day):
// toYmd is the Tehran day of a date (a picked day is its Tehran noon, see
// Components/helpers/tehranTime.ts); "today" is tehranTodayYmd().
import { tehranYmd } from "../../helpers/tehranTime";

export const toYmd = (d: Date) => tehranYmd(d);

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
