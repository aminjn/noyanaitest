"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import classes from "./CommandPalette.module.css";
import Ixon from "./Ixon";
import SearchIcon from "../Icons/SearchIcon";
import useProgress from "../Hooks/useProgress";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

export type CommandItem = {
  id: string;
  label: string;
  // group / breadcrumb shown under the label, also searched
  hint?: string;
  icon?: ReactNode;
  href: string;
};

// Arabic/Persian letter variants and zero-width joiners fold together so
// "ي/ی", "ك/ک" and "بسته‌ها/بسته ها" all match
const norm = (v: string) =>
  v
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[‌‏‎]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Ctrl/⌘+K (or the trigger button) opens a jump-to list over the current
// panel's pages - one keystroke instead of hunting through the menu
const CommandPalette = ({
  items,
  className = "",
  trigger = true,
}: {
  items: CommandItem[];
  className?: string;
  // false: keyboard only (the page already has its own search box)
  trigger?: boolean;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const push = useProgress();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(t);
  }, [open]);

  const results = useMemo(() => {
    const q = norm(query);
    if (!q) return items.slice(0, 40);
    const words = q.split(" ");
    return items
      .map((it) => {
        const label = norm(it.label);
        const hay = `${label} ${norm(it.hint || "")} ${it.href.toLowerCase()}`;
        if (!words.every((w) => hay.includes(w))) return null;
        return { it, score: label.startsWith(q) ? 0 : label.includes(q) ? 1 : 2 };
      })
      .filter((x): x is { it: CommandItem; score: number } => !!x)
      .sort((a, b) => a.score - b.score)
      .slice(0, 40)
      .map((x) => x.it);
  }, [items, query]);

  const go = useCallback(
    (it?: CommandItem) => {
      if (!it) return;
      setOpen(false);
      push(it.href);
    },
    [push],
  );

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      {trigger && (
      <button type="button" className={`${classes.trigger} ${className}`} onClick={() => setOpen(true)}>
        <Ixon width="1rem">
          <SearchIcon />
        </Ixon>
        <span className={classes.triggerText}>{getContent("cmdOpen")}</span>
        <kbd className={classes.kbd} dir="ltr">
          Ctrl K
        </kbd>
      </button>
      )}
      {open &&
        mounted &&
        createPortal(
          <div className={classes.backdrop} onMouseDown={() => setOpen(false)}>
            <div
              className={classes.panel}
              role="dialog"
              aria-modal="true"
              aria-label={getContent("cmdOpen")}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <label className={classes.search}>
                <Ixon width="1.125rem">
                  <SearchIcon />
                </Ixon>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKey}
                  placeholder={getContent("cmdPlaceholder")}
                  aria-label={getContent("cmdPlaceholder")}
                />
              </label>
              <ul className={classes.list} role="listbox">
                {!results.length ? (
                  <li className={classes.empty}>{getContent("cmdEmpty")}</li>
                ) : (
                  results.map((it, i) => (
                    <li key={it.id} role="option" aria-selected={i === active}>
                      <button
                        type="button"
                        className={`${classes.item} ${i === active ? classes.on : ""}`}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(it)}
                      >
                        {!!it.icon && (
                          <span className={classes.icon}>
                            <Ixon width="1.125rem">{it.icon}</Ixon>
                          </span>
                        )}
                        <span className={classes.text}>
                          <b>{it.label}</b>
                          {!!it.hint && <small>{it.hint}</small>}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
              <p className={classes.foot}>{getContent("cmdHint")}</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default CommandPalette;
