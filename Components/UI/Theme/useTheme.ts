"use client";

import { useEffect, useState } from "react";
import { Theme, applyTheme, readTheme } from "./theme";

const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(readTheme());
    const listener = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener("noyan-theme", listener);
    return () => window.removeEventListener("noyan-theme", listener);
  }, []);

  return {
    theme,
    setTheme: (next: Theme) => applyTheme(next),
    toggle: () => applyTheme(readTheme() === "dark" ? "light" : "dark"),
  };
};

export default useTheme;
