import { RefObject, useEffect, useRef, useState } from "react";

export default function useAnimateOnScroll<T extends Element>({
  threshold,
  rootMargin,
  reapear,
}: {
  threshold?: number;
  rootMargin?: string;
  reapear?: boolean;
}): [RefObject<T>, boolean] {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const makeApear: IntersectionObserverCallback = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) setIsVisible(true);
  };

  const makeApearRepeating: IntersectionObserverCallback = (entries) => {
    const [entry] = entries;
    setIsVisible(entry.isIntersecting);
  };

  const callback = reapear ? makeApearRepeating : makeApear;

  useEffect(() => {
    const containerRefCurrent = containerRef.current;
    const observer = new IntersectionObserver(callback, {
      threshold: threshold,
      rootMargin: rootMargin ? rootMargin : "0px",
    });

    if (containerRefCurrent) observer.observe(containerRefCurrent);

    return () => {
      if (containerRefCurrent) observer.unobserve(containerRefCurrent);
    };
  }, [callback, rootMargin, threshold]);

  return [containerRef, isVisible];
}
