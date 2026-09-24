"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

const ProgressContext = React.createContext<{
  push: (target: string) => void;
  isLoading: boolean;
}>({
  push: () => {},
  isLoading: false,
});

// Resets the loading flag whenever the URL (path or query) changes.
//
// Isolated in its own tiny component behind its own <Suspense> because
// useSearchParams() is the one hook here that can force a client-side-
// rendering bailout. Keeping it out of ProgressContextProvider itself means
// the provider — and everything under it, i.e. the whole app incl. header/
// footer — no longer needs a Suspense boundary at the root layout, so it's
// always server-rendered with its text content.
const RouteChangeWatcher = ({ onChange }: { onChange: () => void }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    onChange();
  }, [pathname, searchParams, onChange]);
  return null;
};

export const ProgressContextProvider = (props: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const resetLoading = useCallback(() => setIsLoading(false), []);

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
      <Suspense fallback={null}>
        <RouteChangeWatcher onChange={resetLoading} />
      </Suspense>
      {props.children}
    </ProgressContext.Provider>
  );
};

export default ProgressContext;
