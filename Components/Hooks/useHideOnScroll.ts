import { useEffect, useRef, useState } from "react";

// true while the page is being scrolled down (past the first screenful's
// top), false again on scroll up and on a new page. The phone tab bar and
// the floating «دستیار نویان» button step out of the way with it, like the
// toolbars of Doctolib's and Zocdoc's mobile web. The page scrolls on the
// window (globals.css).
const useHideOnScroll = (off: boolean, resetKey?: string) => {
  const [hidden, setHidden] = useState<boolean>(false);
  const last = useRef(0);

  useEffect(() => {
    if (off) return;
    last.current = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const now = window.scrollY;
        const delta = now - last.current;
        if (Math.abs(delta) < 8) return;
        // the end of the page (iOS bounces): keep what is showing
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (now > max - 2 && delta < 0) return;
        setHidden(delta > 0 && now > 96);
        last.current = now;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [off]);

  useEffect(() => setHidden(false), [resetKey]);
  return off ? false : hidden;
};

export default useHideOnScroll;
