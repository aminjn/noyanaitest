"use client";

import { useSearchParams } from "next/navigation";
import Button from "../Button";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import classes from "./ListPageOpenNowFilter.module.css";

const NS: ContentNamespace[] = ["openingHours"];

// «الان باز است» on a centre list (2026-10): a link that adds or removes
// ?openNow=1 (every view stays a crawlable URL), the rest of the query
// kept. The backend narrows the list to the centres open at this minute in
// Tehran (Lib/openingHours.ts); kept across search / category / page by
// keepListFilters.
const ListPageOpenNowFilter = ({ basePath }: { basePath: string }) => {
  const getContent = useScopedLocale(NS);
  const searchParams = useSearchParams();
  const active = searchParams.get("openNow") === "1";
  const params = new URLSearchParams(searchParams.toString());
  params.delete("page");
  if (active) params.delete("openNow");
  else params.set("openNow", "1");
  const query = params.toString();
  return (
    <div className={classes.main}>
      <Button
        variant="Primary"
        mode={active ? "Fill" : "Outline"}
        size="S"
        radius="High"
        href={query ? `${basePath}?${query}` : basePath}
      >
        <span className={`${classes.dot} ${active ? classes.on : ""}`} aria-hidden />
        {getContent("ohOpenNowFilter")}
      </Button>
    </div>
  );
};

export default ListPageOpenNowFilter;
