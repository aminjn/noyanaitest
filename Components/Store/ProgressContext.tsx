"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ReactNode, useCallback, useEffect, useState } from "react";

const ProgressContext = React.createContext<{
  push: (target: string) => void;
  isLoading: boolean;
}>({
  push: () => {},
  isLoading: false,
});

export const ProgressContextProvider = (props: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  const push = useCallback(
    (target: string) => {
      if (pathname === target.split("?")[0]) {
        setIsLoading(false);
        router.push(`${target}`);
        return;
      }
      setIsLoading(true);
      router.push(`${target}`);
    },
    [pathname, router]
  );

  return (
    <ProgressContext.Provider value={{ push, isLoading }}>
      {props.children}
    </ProgressContext.Provider>
  );
};

export default ProgressContext;
