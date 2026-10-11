"use client";

import { useSyncExternalStore } from "react";

// How a phone user finds the AI assistant (2026-10): the AI entry (the
// centre tab of the phone tab bar, or the floating pill in the provider
// panels) carries an attention dot until the assistant is first used, and a
// one-time coach mark explains it in one line. Both are remembered per
// device (localStorage, guarded: blocked storage just shows them again).
//
// The patient dashboard has one AI entry on phones, its tab: when the
// dashboard's own assistant (the Copilot) is available, the tab opens it
// instead of linking to the health assistant (/wizard), and the floating
// button stays off.

const USED_KEY = "noyan-ai-used";
const COACH_KEY = "noyan-ai-coach";
const OPEN_EVENT = "noyan:copilot-open";

const read = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};
const write = (key: string) => {
  try {
    localStorage.setItem(key, "1");
  } catch {
    // blocked storage: remembered for this page only
  }
};

type State = { used: boolean; coached: boolean; host: number };
let state: State = { used: false, coached: false, host: 0 };
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  emit();
};
const load = () => {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = { ...state, used: read(USED_KEY), coached: read(COACH_KEY) };
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
// before hydration nothing is shown: no dot, no coach mark
const SERVER: State = { used: true, coached: true, host: 0 };

export const useAiDiscovery = (): State =>
  useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => SERVER,
  );

// the user opened an assistant: the dot goes, and the coach mark with it
export const markAiUsed = () => {
  load();
  if (state.used && state.coached) return;
  write(USED_KEY);
  write(COACH_KEY);
  set({ used: true, coached: true });
};

export const markAiCoached = () => {
  load();
  if (state.coached) return;
  write(COACH_KEY);
  set({ coached: true });
};

// the dashboard's Copilot tells the tab bar it can be opened from the AI tab
export const registerCopilotHost = () => {
  set({ host: state.host + 1 });
  let done = false;
  return () => {
    if (done) return;
    done = true;
    set({ host: Math.max(0, state.host - 1) });
  };
};

export const openCopilot = () => {
  window.dispatchEvent(new Event(OPEN_EVENT));
};

export const onOpenCopilot = (fn: () => void) => {
  window.addEventListener(OPEN_EVENT, fn);
  return () => window.removeEventListener(OPEN_EVENT, fn);
};

// focused flows and full-screen tools where no coach mark interrupts:
// booking finalize, cart, payment, orders, checkout, calls, chat rooms,
// onboarding and the assistants themselves. Any language prefix is skipped.
const NO_COACH =
  /^\/(?:[a-z]{2}\/)?(?:book\/finalize|cart|payment|order|onboarding|wizard|call|newCall|dashboard\/chat|dashboard\/call|[a-zA-Z]+[pP]anel\/(?:chat|prescription)\/[^/]+)(?:\/|$)|\/checkout(?:\/|$)/;
export const coachAllowedOn = (pathname: string) => !NO_COACH.test(pathname || "/");

// an overlay is up (a popup, the booking sheet, a drawer, the install
// sheet). A closed drawer stays in the page (aria-hidden, visibility:
// hidden): only one actually showing counts.
export const shownOverlay = (selector: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(selector)).some(
    (el) => !el.closest('[aria-hidden="true"]') && getComputedStyle(el).visibility !== "hidden" && el.getClientRects().length > 0,
  );
export const overlayOpen = () =>
  document.documentElement.classList.contains("scrollLocked") ||
  shownOverlay('[role="dialog"][aria-modal="true"], [data-pwa-sheet], [data-copilot-panel]');
