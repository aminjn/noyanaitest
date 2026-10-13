"use client";

import { useEffect } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Button from "@/Components/UI/Button";
import { reportClientError } from "@/Components/UI/SafeBoundary";

// A page that crashes shows this instead of a blank "Application error"
// screen (2026-10): the header and footer stay, the visitor can try again,
// and the error goes to the backend log.
const PageError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  const getContent = useScopedLocale(["common"]);
  useEffect(() => {
    reportClientError(error, "page");
  }, [error]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "4rem 1rem", textAlign: "center" }}>
      <p style={{ color: "var(--gray10)", fontSize: "0.9375rem" }}>{getContent("unknownErrorOccured")}</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Button variant="Primary" mode="Fill" size="M" radius="High" onClick={() => reset()}>
          {getContent("tryAgain")}
        </Button>
        <Button variant="Primary" mode="Outline" size="M" radius="High" href="/">
          {getContent("homePage")}
        </Button>
      </div>
    </div>
  );
};

export default PageError;
