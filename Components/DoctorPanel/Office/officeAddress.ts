// the office's address as patients read it: the map's address, then the
// plaque / floor / unit the doctor typed
export const officeAddressText = (o: { address?: string | null; addressDetail?: string | null } | null | undefined) =>
  [o?.address, o?.addressDetail].map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean).join(" · ");
