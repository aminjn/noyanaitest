"use client";

import { CSSProperties, RefObject, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "@/Components/i18n/navigation";
import Ixon from "@/Components/UI/Ixon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import { coachAllowedOn, markAiCoached, overlayOpen, useAiDiscovery } from "./aiDiscovery";
import classes from "./AiCoachMark.module.css";

const SHOW_DELAY_MS = 1500;
const PHONE = "(max-width: 48rem)";

// A one-time bubble pointing at the AI entry on phones (Ada's and the big
// consumer apps' first-run coach mark): what the assistant does, in one
// line. Shown once per device, a little after the page settles, never over
// a popup, a drawer or the install sheet, never in a focused flow (booking
// finalize, cart, checkout, a call), never once the assistant was used.
// Goes on "got it", ✕, Esc, a tap on the entry or a scroll.
const AiCoachMark = ({
  anchor,
  title,
  text,
  gotIt,
  closeLabel,
}: {
  anchor: RefObject<HTMLElement>;
  title: string;
  text: string;
  gotIt: string;
  closeLabel: string;
}) => {
  const pathname = usePathname() || "/";
  const { coached, used } = useAiDiscovery();
  const [spot, setSpot] = useState<{ bottom: number; start: number; arrow: number; width: number } | null>(null);
  const id = useId();
  const allowed = !coached && !used && coachAllowedOn(pathname);

  // wait for the page, then show if the entry is on screen and nothing is over it
  useEffect(() => {
    if (!allowed) return;
    const timer = window.setTimeout(() => {
      const el = anchor.current;
      if (!el || !window.matchMedia(PHONE).matches || overlayOpen()) return;
      const r = el.getBoundingClientRect();
      if (!r.width || r.top <= 0 || r.bottom > window.innerHeight + 1 || getComputedStyle(el).opacity === "0") return;
      // the raised tab's orb sticks out above the tab itself
      const top = Array.from(el.querySelectorAll("*")).reduce((t, c) => Math.min(t, c.getBoundingClientRect().top || t), r.top);
      const vw = window.innerWidth;
      const width = Math.min(320, vw - 24);
      const centre = r.left + r.width / 2;
      const left = Math.min(Math.max(12, centre - width / 2), vw - 12 - width);
      const rtl = document.documentElement.dir === "rtl";
      setSpot({
        bottom: window.innerHeight - top + 12,
        start: rtl ? vw - (left + width) : left,
        // the arrow under the entry's centre, from the bubble's start edge
        arrow: rtl ? left + width - centre : centre - left,
        width,
      });
      markAiCoached();
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [allowed, anchor, pathname]);

  // gone on a scroll, an overlay, Esc, or a new page
  useEffect(() => {
    if (!spot) return;
    const start = window.scrollY;
    const close = () => setSpot(null);
    const onScroll = () => Math.abs(window.scrollY - start) > 48 && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const mo = new MutationObserver(() => overlayOpen() && close());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    mo.observe(document.body, { childList: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    const el = anchor.current;
    el?.addEventListener("click", close);
    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
      el?.removeEventListener("click", close);
    };
  }, [spot, anchor]);

  useEffect(() => setSpot(null), [pathname]);

  if (!spot) return null;
  return createPortal(
    <div
      className={classes.coach}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-t`}
      aria-describedby={`${id}-d`}
      data-ai-coach
      style={
        {
          insetBlockEnd: `${spot.bottom}px`,
          insetInlineStart: `${spot.start}px`,
          width: `${spot.width}px`,
          "--arrow": `${spot.arrow}px`,
        } as CSSProperties
      }
    >
      <div className={classes.head}>
        <strong id={`${id}-t`} className={classes.title}>
          {title}
        </strong>
        <button type="button" className={classes.close} aria-label={closeLabel} onClick={() => setSpot(null)}>
          <Ixon width="1rem">
            <XMarkIcon />
          </Ixon>
        </button>
      </div>
      <p id={`${id}-d`} className={classes.text}>
        {text}
      </p>
      <button type="button" className={classes.ok} onClick={() => setSpot(null)}>
        {gotIt}
      </button>
    </div>,
    document.body,
  );
};

export default AiCoachMark;
