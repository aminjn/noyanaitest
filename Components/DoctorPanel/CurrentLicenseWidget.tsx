"use client";
import { licenseModuleKey } from "@/Components/_Common/License/licenseModuleKey";

import useSWR from "swr";
import classes from "./CurrentLicenseWidget.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import IconTitle from "@/Components/UI/IconTitle";
import Badge from "@/Components/UI/Badge";
import Button from "@/Components/UI/Button";
import CartIcon from "@/Components/Icons/CartIcon";
import { ICurrentLicense } from "@/Components/_Common/License/licenseTypes";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelHome"];

// Surfaces the doctor's current DoctorProfileLicense on the dashboard home
// page (2026-09) so it's visible without going into the licenses tab. Only
// fetched/rendered for whoever can already see the "licenses" sidebar item
// (hasAccess("readLicenses")) - same gate DoctorSidebar itself uses. Fetches
// doctorController.getMyCurrentLicense - not the same as
// LicensePlansPage's own `${API}/doctor/license` (getMyLicenseOverview),
// which returns the purchasable catalog, not what the doctor already owns.
const CurrentLicenseWidget = () => {
  const getContent = useScopedLocale(NS);
  const hasAccess = useDoctorAcl();
  const canView = hasAccess("readLicenses");

  const { data, error } = useSWR<ICurrentLicense>(
    canView ? `${API}/doctor/license/current` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  if (!canView) return null;

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <IconTitle icon={<CartIcon />}>
            {getContent("currentLicense")}
          </IconTitle>
          {data.current && !data.isExpired ? (
            <>
              <span className={classes.name}>
                {data.current.displayName || getContent("licenses")}
              </span>
              {!!data.current.modules.length && (
                <div className={classes.modules}>
                  {data.current.modules.map((m) => (
                    <Badge key={m} color="Primarylight" size="S">
                      {getContent(licenseModuleKey(m))}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          ) : (
            <span className={classes.empty}>
              {getContent(
                data.current && data.isExpired
                  ? "licenseExpired"
                  : "noLicensePurchasedYet",
              )}
            </span>
          )}
          <Button
            href="/doctorpanel/license"
            variant="Primary"
            mode="Outline"
            size="S"
            className={classes.action}
          >
            {getContent("licenses")}
          </Button>
        </div>
      )}
    </HandleLoading>
  );
};

export default CurrentLicenseWidget;
