import { useEffect, useState } from "react";

const useWindow = () => {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ height: 0, width: 0 });

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const listener = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", listener, false);
    return () => window.removeEventListener("resize", listener, false);
  }, []);

  return dimensions;
};

export default useWindow;
