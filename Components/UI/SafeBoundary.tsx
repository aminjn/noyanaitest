"use client";

import { Component, ReactNode } from "react";
import { API } from "../config";

// Reports a browser-side crash to the backend log (POST /public/client-error)
// so a bug that only real data triggers can be found (2026-10).
export const reportClientError = (error: unknown, where: string) => {
  try {
    const e = error as { message?: string; stack?: string; digest?: string };
    const body = JSON.stringify({
      where,
      path: typeof window !== "undefined" ? window.location.pathname : "",
      message: String(e?.message || error).slice(0, 500),
      stack: String(e?.stack || "").slice(0, 2000),
      digest: e?.digest,
    });
    if (typeof navigator !== "undefined" && navigator.sendBeacon)
      navigator.sendBeacon(`${API}/public/client-error`, new Blob([body], { type: "text/plain" }));
  } catch {
    // never let the reporter itself throw
  }
};

// One item (a card, a widget) that fails to render is left out instead of
// taking the whole page down with it.
export default class SafeBoundary extends Component<{ children: ReactNode; fallback?: ReactNode; name?: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    reportClientError(error, this.props.name || "boundary");
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
