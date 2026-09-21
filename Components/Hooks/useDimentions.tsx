import { MutableRefObject, RefObject, useEffect, useState } from "react";

const useDimensions = <T extends HTMLElement = HTMLElement>({
  ref,
}: {
  ref: RefObject<T>;
}) => {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ height: 0, width: 0 });

  useEffect(() => {
    const current = ref.current;
    if (!current) return;
    setDimensions({
      width: current.getBoundingClientRect().width,
      height: current.getBoundingClientRect().height,
    });
    const listener = () => {
      setDimensions({
        width: current.getBoundingClientRect().width,
        height: current.getBoundingClientRect().height,
      });
    };
    window.addEventListener("resize", listener, false);
    return () => window.removeEventListener("resize", listener, false);
  }, [ref]);
  return dimensions;
};

export default useDimensions;
