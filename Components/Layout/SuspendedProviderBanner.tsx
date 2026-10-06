"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import classes from "./SuspendedProviderBanner.module.css";
import Link from "@/Components/i18n/Link";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "layoutPanel"];

// The provider's own panel (doctor, clinic, hospital, pharmacy, para clinic,
// insurance) when an admin has suspended it (backend Lib/providerStatus.ts):
// why, since when, and what still works. The panel itself stays open, so
// visits and orders already placed can be completed, as on Doctolib Pro /
// Docplanner when a profile is taken offline.
export type SuspendableProvider = {
  status?: string;
  statusReason?: string;
  statusChangedAt?: string | Date;
} | null | undefined;

const SuspendedProviderBanner = ({ node }: { node: SuspendableProvider }) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const intlTag = useIntlLocale();
  if (node?.status !== "suspended") return null;
  const since = node.statusChangedAt ? new Date(node.statusChangedAt) : null;
  const sinceText =
    since && !isNaN(since.getTime())
      ? new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, year: "numeric", month: "long", day: "numeric" }).format(since)
      : "";
  return (
    <div className={classes.main} role="alert">
      <strong className={classes.title}>
        {sinceText
          ? getContent("panelSuspendedSince", [sinceText])
          : getContent("panelSuspendedTitle")}
      </strong>
      <p className={classes.text}>{getContent("panelSuspendedText")}</p>
      {!!node.statusReason && (
        <p className={classes.reason}>
          {getContent("panelSuspendedReason", [node.statusReason])}
        </p>
      )}
      <Link href="/dashboard/support" className={classes.link}>
        {getContent("panelSuspendedContact")}
      </Link>
    </div>
  );
};

export default SuspendedProviderBanner;
