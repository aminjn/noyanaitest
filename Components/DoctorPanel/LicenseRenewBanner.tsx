"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Button from "@/Components/UI/Button";
import { ICurrentLicense } from "@/Components/_Common/License/licenseTypes";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import classes from "./LicenseRenewBanner.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelHome"];
const DAY = 24 * 60 * 60 * 1000;
const SOON_DAYS = 7;

// A paid plan that has ended, or ends within a week (2026-10, owner
// decision): basic booking is free forever (Paziresh24's model), so the
// doctor's page and booking stay live and only the paid modules stop
// (backend doctorController.resolveMyLicenseModules). The doctor is told so,
// with a way to renew. Shown to whoever may see the plans page.
const LicenseRenewBanner = () => {
  const getContent = useScopedLocale(NS);
  const hasAccess = useDoctorAcl();
  const canView = hasAccess("readLicenses");
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const { data } = useSWR<ICurrentLicense>(
    canView ? `${API}/doctor/license/current` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const current = data?.current;
  const ends = current?.expiresAt ? new Date(current.expiresAt).getTime() : NaN;
  if (!canView || !current || !Number.isFinite(ends)) return null;
  const left = ends - Date.now();
  const ended = !!data?.isExpired || left <= 0;
  if (!ended && left > SOON_DAYS * DAY) return null;
  const plan = current.displayName || getContent("licenses");
  return (
    <div className={classes.main} role="status">
      <span className={classes.text}>
        {ended
          ? getContent("dpdPlanEndedBanner", [plan])
          : getContent("dpdPlanEndingBanner", [plan, num.format(Math.max(1, Math.ceil(left / DAY)))])}
      </span>
      <Button href="/doctorpanel/license" variant="Primary" size="S">
        {getContent("dpdRenewPlan")}
      </Button>
    </div>
  );
};

export default LicenseRenewBanner;
