"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./LanguageSwitcher.module.css";
import { usePathname, useLocale } from "./navigation";
import { enabledLocales, localeDir, localeNames, localizePath } from "./locales";
import Ixon from "../UI/Ixon";
import WEbsiteIcon from "../Icons/WEbsiteIcon";

// Header language menu. Only languages whose texts are translated
// (enabledLocales) are listed; hidden entirely while Persian is the only one.
// Switching does a full page load so the root layout re-renders with the
// new language's texts and direction.
const LanguageSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (enabledLocales.length < 2) return null;

  const go = (target: (typeof enabledLocales)[number]) => {
    setOpen(false);
    if (target === locale) return;
    window.location.assign(localizePath(pathname, target) + window.location.search);
  };

  return (
    <div className={classes.main} ref={ref}>
      <button
        type="button"
        className={classes.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={localeNames[locale]}
      >
        <Ixon width="1.25rem">
          <WEbsiteIcon />
        </Ixon>
        <span className={classes.code}>{locale.toUpperCase()}</span>
      </button>
      {open && (
        <ul className={classes.menu} role="listbox">
          {enabledLocales.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === locale}
                className={`${classes.option} ${code === locale ? classes.active : ""}`}
                dir={localeDir(code)}
                lang={code}
                onClick={() => go(code)}
              >
                {localeNames[code]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
