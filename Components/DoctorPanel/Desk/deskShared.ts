// Front-desk helpers (2026-10), shared by the desk booking, move and days
// off forms. The API takes days as "YYYY-MM-DD" (local calendar day).
export const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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
