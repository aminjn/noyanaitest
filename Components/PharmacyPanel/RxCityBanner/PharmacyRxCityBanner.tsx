"use client";

import Link from "@/Components/i18n/Link";
import usePharmacy from "@/Components/Hooks/usePharmacy";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { tsmMedium, tsmRegular } from "@/Components/UI/Typography";
import classes from "./PharmacyRxCityBanner.module.css";

// Owner decision (2026-10, backend Lib/delivery.ts rxNoPharmacyCity): a
// pharmacy whose city is unknown sells no prescription-only item - checkout
// refuses them. The city is filled from the map pin of the location form,
// so the banner sends the pharmacist there. Hidden while loading and once a
// city is set; `onLocationTab` (already on the profile page) drops the link
// target's reload and switches the tab instead.
const PharmacyRxCityBanner = ({
  ns,
  onLocationTab,
}: {
  ns: ContentNamespace;
  onLocationTab?: () => unknown;
}) => {
  const getContent = useScopedLocale(["common", ns]);
  const { pharmacy } = usePharmacy();
  if (!pharmacy || typeof pharmacy !== "object") return null;
  const city = (pharmacy as { city?: unknown }).city;
  if (city && (typeof city === "string" || typeof city === "object")) return null;
  return (
    <div className={classes.main} role="status">
      <span className={`${classes.text} ${tsmRegular}`}>{getContent("pharmacyRxNoCityBanner")}</span>
      {onLocationTab ? (
        <button type="button" className={`${classes.link} ${tsmMedium}`} onClick={() => onLocationTab()}>
          {getContent("pharmacyRxNoCityBannerLink")}
        </button>
      ) : (
        <Link className={`${classes.link} ${tsmMedium}`} href="/pharmacypanel/profile?tab=Location">
          {getContent("pharmacyRxNoCityBannerLink")}
        </Link>
      )}
    </div>
  );
};

export default PharmacyRxCityBanner;
