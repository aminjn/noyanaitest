import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import classes from "./PwaInstallPrompt.module.css";
import usePwaInstall, {
  closeInstallSheet,
  openInstallSheet,
  promptInstall,
} from "./usePwaInstall";
import useScopedLocale from "../Hooks/useScopedLocale";
import useUser from "../Hooks/useUser";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import XMarkIcon from "../Icons/XMarkIcon";
import PlusSquareIcon from "../Icons/PlusSquareIcon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";

const LOCALE_NS: ContentNamespace[] = ["common"];

const VISITS_KEY = "noyan-visits";
const VISIT_SESSION_KEY = "noyan-visit-counted";
const DISMISSED_KEY = "noyan-pwa-dismissed";
const DISMISS_DAYS = 14;
const SHOW_DELAY_MS = 3500;

// storage may be blocked (private mode, previews): every access is guarded
const read = (store: () => Storage, key: string) => {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
};
const write = (store: () => Storage, key: string, value: string) => {
  try {
    store().setItem(key, value);
  } catch {
    // ignore
  }
};

// counts one visit per browser session; returns the total
const countVisit = (): number => {
  const total = Number(read(() => localStorage, VISITS_KEY)) || 0;
  if (read(() => sessionStorage, VISIT_SESSION_KEY)) return total;
  write(() => sessionStorage, VISIT_SESSION_KEY, "1");
  write(() => localStorage, VISITS_KEY, String(total + 1));
  return total + 1;
};

const dismissedRecently = () => {
  const at = Number(read(() => localStorage, DISMISSED_KEY)) || 0;
  return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
};

// iOS "Share" glyph (box with an up arrow), drawn inline
const ShareGlyph = () => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden="true">
    <path
      d="M12 3v12M12 3l-4 4M12 3l4 4M7 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Registers the site's one service worker (/service-worker.js: push + app
// shell cache + offline page; usePushNotifications registers the same URL,
// so there is a single registration), and shows the "install Noyan" sheet:
// automatically from the second visit or once signed in, never instantly on
// a first page view, never when installed, and not again for DISMISS_DAYS
// after "not now". The drawer and footer open it on demand.
const PwaInstallPrompt = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { user } = useUser();
  const { ready, canPrompt, isIos, isStandalone, sheet } = usePwaInstall();
  const shownOnce = useRef(false);
  const visits = useRef(0);

  useEffect(() => {
    visits.current = countVisit();
    if (!("serviceWorker" in navigator)) return;
    const register = () =>
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => {
          // keep the offline page of this language in the cache
          const seg = window.location.pathname.split("/")[1];
          const prefix =
            seg && document.documentElement.lang === seg ? `/${seg}` : "";
          reg.active?.postMessage({ type: "cache-offline", url: `${prefix}/offline` });
        })
        .catch(() => undefined);
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  useEffect(() => {
    if (!ready || isStandalone || shownOnce.current || sheet) return;
    if (!canPrompt && !isIos) return;
    if (dismissedRecently()) return;
    if (visits.current < 2 && !user) return;
    const timer = setTimeout(() => {
      shownOnce.current = true;
      openInstallSheet();
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, canPrompt, isIos, isStandalone, user, sheet]);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  const dismiss = () => {
    write(() => localStorage, DISMISSED_KEY, String(Date.now()));
    closeInstallSheet();
  };

  if (!sheet || isStandalone || typeof document === "undefined") return null;

  // into <body>, for the same reason as the tab bar (fixed inside a frosted
  // panel would anchor to the panel)
  return createPortal(
    <div
      className={`${classes.sheet} glassMenu`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="pwa-install-title"
      data-pwa-sheet={sheet}
    >
      <button
        type="button"
        className={classes.close}
        onClick={dismiss}
        aria-label={getContent("close")}
      >
        <Ixon width="1rem">
          <XMarkIcon />
        </Ixon>
      </button>
      <div className={classes.head}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={classes.icon}
          src="/icons/icon-192.png"
          alt=""
          width={56}
          height={56}
        />
        <div className={classes.text}>
          <span id="pwa-install-title" className={classes.title}>
            {getContent("pwaInstallTitle")}
          </span>
          <span className={classes.desc}>{getContent("pwaInstallText")}</span>
        </div>
      </div>

      {sheet === "ios" && (
        <ol className={classes.steps}>
          <li className={classes.step}>
            <span className={classes.stepIcon}>
              <Ixon width="1.125rem">
                <ShareGlyph />
              </Ixon>
            </span>
            <span>{getContent("pwaIosStep1")}</span>
          </li>
          <li className={classes.step}>
            <span className={classes.stepIcon}>
              <Ixon width="1.125rem">
                <PlusSquareIcon />
              </Ixon>
            </span>
            <span>{getContent("pwaIosStep2")}</span>
          </li>
          <li className={classes.step}>
            <span className={classes.stepIcon}>
              <Ixon width="1.125rem">
                <CheckCircleIcon />
              </Ixon>
            </span>
            <span>{getContent("pwaIosStep3")}</span>
          </li>
        </ol>
      )}

      {sheet === "other" && (
        <p className={classes.hint}>{getContent("pwaOtherHint")}</p>
      )}

      <div className={classes.actions}>
        {sheet === "prompt" && (
          <Button
            variant="Primary"
            mode="Fill"
            radius="High"
            size="M"
            onClick={() => {
              promptInstall().then((outcome) => {
                if (outcome === "dismissed")
                  write(() => localStorage, DISMISSED_KEY, String(Date.now()));
              });
            }}
          >
            {getContent("pwaInstallAction")}
          </Button>
        )}
        <Button
          variant="Primary"
          mode="Inline"
          radius="High"
          size="M"
          onClick={dismiss}
        >
          {getContent("pwaLater")}
        </Button>
      </div>
    </div>,
    document.body,
  );
};

export default PwaInstallPrompt;
