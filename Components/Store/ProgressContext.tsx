"use client";

import { usePathname, useRouter } from "@/Components/i18n/navigation";
import { useSearchParams } from "next/navigation";
import React, {
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import classes from "./ProgressContext.module.css";

// a navigation that never lands (offline, a server error) must not leave
// the bar and the busy buttons on for ever
const STUCK_MS = 20000;

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
  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => setIsLoading(false), STUCK_MS);
    return () => clearTimeout(t);
  }, [isLoading]);

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
      {/* the tap's feedback while the next page loads (an App Router push
          shows nothing until the server answers - on a phone network the
          tap seemed to do nothing) */}
      {isLoading && <div className={classes.bar} aria-hidden="true" />}
    </ProgressContext.Provider>
  );
};

export default ProgressContext;
