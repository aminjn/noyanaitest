// (2026-10) An order's short reference ("8B90A1C2", the last 8 of its id),
// the way support asks for it. Inside a sentence it is wrapped in Unicode
// left-to-right isolates (LRI ... PDI), so it reads the same in a
// right-to-left one; never prefixed with a bare '#', which the bidi
// algorithm may move to the far side of a Latin id in Persian, Arabic or
// Urdu text. Where it stands alone in markup, <bdi dir="ltr"> does the same.
export const ltrIsolate = (text: string) => `⁦${text}⁩`;

export const orderShortId = (id: unknown) => String(id ?? "").slice(-8).toUpperCase();

export const orderRef = (id: unknown) => ltrIsolate(orderShortId(id));
