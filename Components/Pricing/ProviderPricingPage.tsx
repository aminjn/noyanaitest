"use client";

import { useEffect, useMemo, useState } from "react";
import classes from "./ProviderPricingPage.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import LicenseCard from "@/Components/_Common/License/LicenseCard";
import LicenseDurationSelector from "@/Components/_Common/License/LicenseDurationSelector";
import LicensePromotionBanner from "@/Components/_Common/License/LicensePromotionBanner";
import useLicenseQuotes from "@/Components/_Common/License/useLicenseQuotes";
import { ILicenseDuration, LicenseOrg } from "@/Components/_Common/License/licenseTypes";
import { becomeOrgs } from "@/Components/Become/becomeOrgs";
import { t3xlBold, txsRegular } from "@/Components/UI/Typography";
import Button from "@/Components/UI/Button";

const LOCALE_NS: ContentNamespace[] = ["common", "sharedLicense", "becomeSomething"];

const ORGS: LicenseOrg[] = ["doctor", "clinic", "hospital", "pharmacy", "paraClinic", "insurance"];

// One kind's lineup: the period switcher, the running promotions with their
// countdown, and the plan cards - each card's action sends a visitor to
// the kind's sign-up (/become/<kind>).
const KindPlans = ({ org }: { org: LicenseOrg }) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { data, error, quoteOf, promotions } = useLicenseQuotes(org);
  const durations = useMemo(
    () => (Array.isArray(data?.durations) ? data.durations : []),
    [data],
  );
  const licenses = useMemo(
    () => (Array.isArray(data?.licenses) ? data.licenses : []).filter((l) => l.isPrimary !== false),
    [data],
  );
  const [selected, setSelected] = useState<ILicenseDuration | null>(null);
  useEffect(() => {
    if (!durations.length) return;
    if (selected && durations.some((d) => d._id === selected._id)) return;
    // the longest period first: the biggest discount sells the plan
    setSelected(durations[durations.length - 1]);
  }, [durations, selected]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.kind}>
          <LicensePromotionBanner promotions={promotions} />
          {!!durations.length && (
            <LicenseDurationSelector
              durations={durations}
              selectedDuration={selected}
              onSelect={setSelected}
              className={classes.durations}
            />
          )}
          {licenses.length ? (
            <div className={classes.list}>
              {licenses.map((license) => (
                <LicenseCard
                  key={license._id}
                  org={org}
                  license={license}
                  duration={selected}
                  quote={quoteOf(license._id, selected?.duration)}
                  href={becomeOrgs[org].path}
                  actionLabel={getContent("pricingStart" as ContentKey)}
                />
              ))}
            </div>
          ) : (
            <p className={classes.empty}>{getContent("pricingNoPlans" as ContentKey)}</p>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

const ProviderPricingPage = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const [tab, setTab] = useState<string>("doctor");
  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <h1 className={`${classes.h1} ${t3xlBold}`}>
          {getContent("pricingPageTitle" as ContentKey)}
        </h1>
        <p className={`${classes.legend} ${txsRegular}`}>
          {getContent("pricingPageDescription" as ContentKey)}
        </p>
      </header>
      <ClientTabSystem
        viewState={[tab, setTab]}
        items={ORGS.map((org) => ({
          id: org,
          title: getContent(becomeOrgs[org].nameKey),
          content: <KindPlans org={org} />,
        }))}
      />
      <div className={classes.infos}>
        <p className={classes.info}>{getContent("licenseInfoItem0")}</p>
        <p className={classes.info}>{getContent("licenseInfoItem1")}</p>
        <p className={classes.info}>{getContent("licenseInfoItem2")}</p>
      </div>
      <div className={classes.outro}>
        <p className={classes.consult}>{getContent("licenseConsult")}</p>
        <Button variant="Primary" mode="Fill" size="M" href="/contact" radius="Medium">
          {getContent("contactUs")}
        </Button>
      </div>
    </div>
  );
};

export default ProviderPricingPage;
