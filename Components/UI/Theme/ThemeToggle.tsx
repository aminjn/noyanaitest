"use client";

import classes from "./ThemeToggle.module.css";
import Ixon from "../Ixon";
import SunIcon from "@/Components/Icons/SunIcon";
import MoonIcon from "@/Components/Icons/MoonIcon";
import useTheme from "./useTheme";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common"];

// Two-segment light/dark switch; the active side is filled.
// `compact`: a single icon button that flips the theme (tight headers).
const ThemeToggle = ({ className = "", compact = false }: { className?: string; compact?: boolean }) => {
  const { theme, setTheme, toggle } = useTheme();
  const getContent = useScopedLocale(NS);
  if (compact) {
    const label = getContent(theme === "dark" ? "themeLight" : "themeDark");
    return (
      <button type="button" className={`${classes.compact} ${className}`} aria-label={label} title={label} onClick={toggle}>
        <Ixon width="1.25rem">{theme === "dark" ? <SunIcon /> : <MoonIcon />}</Ixon>
      </button>
    );
  }
  return (
    <div className={`${classes.main} ${className}`} role="group" aria-label={getContent("themeSwitch")}>
      <button
        type="button"
        className={`${classes.option} ${theme === "light" ? classes.active : ""}`}
        aria-pressed={theme === "light"}
        aria-label={getContent("themeLight")}
        title={getContent("themeLight")}
        onClick={() => setTheme("light")}
      >
        <Ixon width="1.05rem">
          <SunIcon />
        </Ixon>
      </button>
      <button
        type="button"
        className={`${classes.option} ${theme === "dark" ? classes.active : ""}`}
        aria-pressed={theme === "dark"}
        aria-label={getContent("themeDark")}
        title={getContent("themeDark")}
        onClick={() => setTheme("dark")}
      >
        <Ixon width="1.05rem">
          <MoonIcon />
        </Ixon>
      </button>
    </div>
  );
};

export default ThemeToggle;
