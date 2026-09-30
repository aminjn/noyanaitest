"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

// `?open=<id>` (the requests queue links rows here): once the list has
// loaded, open that row's popup a single time.
const useOpenFromQuery = <T extends { _id: string }>(
  data: T[] | undefined,
  open: (node: T) => unknown,
) => {
  const openId = useSearchParams()?.get("open") || "";
  const opened = useRef("");
  useEffect(() => {
    if (!openId || !Array.isArray(data) || opened.current === openId) return;
    const node = data.find((row) => row?._id === openId);
    if (!node) return;
    opened.current = openId;
    open(node);
  }, [openId, data, open]);
};

export default useOpenFromQuery;
