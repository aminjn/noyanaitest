"use client";

import { useEffect, useState } from "react";

// `/become/clinic?another=1` and `/become/hospital?another=1` (2026-10): an
// owner who already has a centre asks for one more (the centre switcher's
// "add another centre"), so the page shows the request form instead of
// "you already have a panel". Read after mount, which keeps the page free
// of a useSearchParams() Suspense boundary.
const useAnotherCentre = () => {
  const [another, setAnother] = useState(false);
  useEffect(() => {
    setAnother(new URLSearchParams(window.location.search).get("another") === "1");
  }, []);
  return another;
};

export default useAnotherCentre;
