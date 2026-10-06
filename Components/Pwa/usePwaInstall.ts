import { useEffect, useSyncExternalStore } from "react";

// Install state shared by the install sheet, the drawer/footer "install app"
// entries and anything else that wants it (module-level, no context).
//
// - Android / desktop Chrome and Edge fire `beforeinstallprompt`: it is kept
//   (preventDefault) so the sheet can offer the real install dialog later.
// - iOS Safari has no such event: the sheet shows the Share -> "Add to Home
//   Screen" steps instead.
// - Already installed (display-mode: standalone): nothing is offered.

type InstallOutcome = "accepted" | "dismissed" | "unavailable";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type SheetMode = "prompt" | "ios" | "other";

type State = {
  ready: boolean;
  canPrompt: boolean;
  isIos: boolean;
  isStandalone: boolean;
  sheet: SheetMode | null;
};

let deferred: BeforeInstallPromptEvent | null = null;
let state: State = {
  ready: false,
  canPrompt: false,
  isIos: false,
  isStandalone: false,
  sheet: null,
};
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};

const SERVER_STATE = state;

let initialised = false;
const init = () => {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  const ua = navigator.userAgent || "";
  const isIos =
    (/iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
    // only Safari can add to the home screen on older iOS
    !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  const standaloneQuery = window.matchMedia?.("(display-mode: standalone)");
  const isStandalone =
    !!standaloneQuery?.matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  set({ ready: true, isIos, isStandalone });

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    set({ canPrompt: true });
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    set({ canPrompt: false, isStandalone: true, sheet: null });
  });
  standaloneQuery?.addEventListener?.("change", (e) =>
    set({ isStandalone: e.matches }),
  );
};

export const openInstallSheet = () => {
  init();
  set({ sheet: state.canPrompt ? "prompt" : state.isIos ? "ios" : "other" });
};

export const closeInstallSheet = () => set({ sheet: null });

export const promptInstall = async (): Promise<InstallOutcome> => {
  if (!deferred) return "unavailable";
  const event = deferred;
  deferred = null;
  set({ canPrompt: false });
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    return outcome;
  } catch {
    return "unavailable";
  } finally {
    set({ sheet: null });
  }
};

const usePwaInstall = () => {
  useEffect(init, []);
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
    () => SERVER_STATE,
  );
};

export default usePwaInstall;
