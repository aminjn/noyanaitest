"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { fetcher } from "../helpers/fetcher";
import { API, BACKEND } from "../config";

// Silently reports each page visit to the backend analytics endpoint.
// Mounted once near the app root (see Layout.tsx) so it fires on every
// route change, client-side navigation included. The backend resolves
// the visitor (cookie-based identity, optionally linked to the logged
// in user) and dedupes repeated hits to the same page within a time
// window, so this can safely fire on every pathname/query change
// without worrying about spamming records.
const AnalyticsTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const query = searchParams?.toString();
    const page = query ? `${pathname}?${query}` : pathname;
    fetcher({
      url: `${API}/analytics/visit`,
      method: "POST",
      payload: { page },
    }).catch(() => {
      // Analytics failures should never affect the user experience.
    });
  }, [pathname, searchParams]);

  return null;
};

export default AnalyticsTracker;
