"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ChevronIcon from "../Icons/ChevronIcon";
import classes from "./RowScroller.module.css";

const NS: ContentNamespace[] = ["common"];

// A home-page list in a fixed number of rows that scrolls sideways
// (2026-10, the owner's sample: two rows of tiles and an arrow, instead of
// a grid that grows down the page with every item). Swipe on phones, the
// arrows and the wheel's sideways scroll on desktop; the edge fades show
// there is more. Works the same in RTL and LTR.
const RowScroller = ({
  children,
  rows = 2,
  itemWidth = "10rem",
  className = "",
}: {
  children: ReactNode;
  rows?: number;
  // one tile's width (the grid's column)
  itemWidth?: string;
  className?: string;
}) => {
  const ref = useRef<HTMLUListElement>(null);
  const getContent = useScopedLocale(NS);
  const [edges, setEdges] = useState({ start: false, end: false });

  // how far from each end the list is scrolled (RTL scrolls to negative x)
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const max = el.scrollWidth - el.clientWidth;
    const from = rtl ? -el.scrollLeft : el.scrollLeft;
    setEdges({ start: from > 4, end: from < max - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure, children]);

  // one screen of tiles towards the end (+1) or the start (-1)
  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div
      className={`${classes.main} ${edges.start ? classes.fadeStart : ""} ${edges.end ? classes.fadeEnd : ""} ${className}`}
    >
      <ul
        ref={ref}
        className={classes.track}
        style={{ gridTemplateRows: `repeat(${rows}, auto)`, gridAutoColumns: itemWidth }}
      >
        {children}
      </ul>
      {edges.start && (
        <button type="button" className={`${classes.arrow} ${classes.prev}`} onClick={() => page(-1)} aria-label={getContent("scrollPrev")}>
          <ChevronIcon />
        </button>
      )}
      {edges.end && (
        <button type="button" className={`${classes.arrow} ${classes.next}`} onClick={() => page(1)} aria-label={getContent("scrollNext")}>
          <ChevronIcon />
        </button>
      )}
    </div>
  );
};

export default RowScroller;
