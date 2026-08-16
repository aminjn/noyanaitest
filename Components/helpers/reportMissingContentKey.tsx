import { API } from "../config";

export type MissingContentKeyReason = "not-in-namespace" | "no-value";

// Fire-and-forget dev diagnostic: tells the backend a ContentKey lookup
// looked wrong so it can be appended to a txt file for manual review (see
// reportMissingContentKey in the backend's publicController.ts). Never
// awaited by callers, never throws, and is a complete no-op outside
// development so it can't accidentally ship a network call (or write a
// file) in production.
export const reportMissingContentKey = (payload: {
  key: string;
  namespaces: string[];
  reason: MissingContentKeyReason;
}) => {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof window === "undefined") return;
  fetch(`${API}/public/reportMissingContentKey`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...payload, path: window.location.pathname }),
    keepalive: true,
  }).catch(() => {
    // Best-effort only — a failed report should never affect the page.
  });
};
