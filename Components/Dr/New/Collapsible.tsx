"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import classes from "./Collapsible.module.css";

const NS: ContentNamespace[] = ["common", "drProfile"];

// A long block folds to a few lines with «مشاهده بیشتر» (2026-10); the full
// text stays in the HTML (search engines read it), only its height is
// clipped. A block that fits never shows the button.
export const CollapsibleText = ({
  children,
  lines = 4,
}: {
  children: ReactNode;
  lines?: number;
}) => {
  const getContent = useScopedLocale(NS);
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className={classes.main}>
      <div
        ref={ref}
        className={`${classes.body} ${open ? classes.open : ""}`}
        style={{ ["--lines" as string]: lines }}
      >
        {children}
      </div>
      {(overflows || open) && (
        <button type="button" className={classes.toggle} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {getContent(open ? "drSeeLess" : "drSeeMore")}
        </button>
      )}
    </div>
  );
};

// A long chip list shows its first `limit` items and «+n مورد دیگر»
export const CollapsibleList = <T,>({
  items,
  limit = 10,
  render,
  className,
}: {
  items: T[];
  limit?: number;
  render: (item: T) => ReactNode;
  className?: string;
}) => {
  const getContent = useScopedLocale(NS);
  const [open, setOpen] = useState(false);
  const shown = open ? items : items.slice(0, limit);
  const rest = items.length - limit;
  return (
    <ul className={className}>
      {shown.map(render)}
      {rest > 0 && (
        <li>
          <button type="button" className={classes.toggle} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? getContent("drSeeLess") : getContent("drMoreItems", [String(rest)])}
          </button>
        </li>
      )}
    </ul>
  );
};
