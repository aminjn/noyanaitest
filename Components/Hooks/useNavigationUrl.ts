"use client";

import { useEffect, useState } from "react";
import { getMapConfig } from "../Map/nexamap";
import { navigationUrl } from "../helpers/navigationUrl";

// navigationUrl with the super admin's NexaMap link format (map config,
// loaded once per page); an external link opens in a new tab.
const useNavigationUrl = (coordinates?: number[] | null, name?: string) => {
  const [template, setTemplate] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    getMapConfig().then((c) => alive && setTemplate(c?.navUrl || null));
    return () => {
      alive = false;
    };
  }, []);
  const href = navigationUrl(coordinates, name, template);
  return { href, external: !!href && /^https:/i.test(href) };
};

export default useNavigationUrl;
