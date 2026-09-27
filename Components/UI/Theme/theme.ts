export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "noyan-theme";

// Runs in <head> before first paint so the page never flashes the wrong
// theme: the saved choice wins, otherwise the OS preference.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","light")}})();`;

export const readTheme = (): Theme =>
  typeof document !== "undefined" &&
  document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";

export const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // private mode / blocked storage: the choice just won't persist
  }
  window.dispatchEvent(new CustomEvent("noyan-theme", { detail: theme }));
};
