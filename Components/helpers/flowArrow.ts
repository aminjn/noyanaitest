// "from -> to" in the reading direction: ← on right-to-left pages, → on
// left-to-right ones (read from <html dir>, set by the locale layout)
export const flowArrow = () =>
  typeof document !== "undefined" && document.documentElement.dir === "ltr" ? " → " : " ← ";
