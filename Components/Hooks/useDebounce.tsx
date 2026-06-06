import { Dispatch, SetStateAction, useEffect, useState } from "react";

const useDebounce = function <T = unknown>({
  initialValue,
  delay = 1000,
}: {
  initialValue: T;
  delay?: number;
}): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);
  const [toSet, setToSet] = useState<T>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => setState(toSet), delay);
    return () => clearTimeout(timer);
  }, [delay, toSet]);

  return [state, setToSet];
};

export default useDebounce;
