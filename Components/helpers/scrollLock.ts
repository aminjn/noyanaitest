// Page scroll lock for drawers, sheets and popups.
//
// The page scrolls on the document (the window), not inside <body>: see
// globals.css. `overflow: hidden` on <body> no longer stops it, so the lock
// goes on <html> (`html.scrollLocked`). Locks are counted: a popup opened
// from a drawer keeps the page locked until both are closed. The class also
// tells floating controls (the «دستیار نویان» button) that an overlay is up.

let count = 0;

export const lockScroll = (): (() => void) => {
  if (typeof document === "undefined") return () => undefined;
  count += 1;
  document.documentElement.classList.add("scrollLocked");
  let released = false;
  return () => {
    if (released) return;
    released = true;
    count = Math.max(0, count - 1);
    if (!count) document.documentElement.classList.remove("scrollLocked");
  };
};
