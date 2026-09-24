"use client";

import classes from "./LicensePlansPage.module.css";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import {
  ILicenseCatalog,
  ILicenseDuration,
  LicenseOrg,
  licensePanelRootByOrg,
} from "./licenseTypes";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Ixon from "@/Components/UI/Ixon";
import LockCloseIcon from "@/Components/Icons/LockCloseIcon";
import { useEffect, useState } from "react";
import Button from "@/Components/UI/Button";
import LicenseCard from "./LicenseCard";
import LicenseDurationSelector from "./LicenseDurationSelector";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import { t3xlBold, tlgDemiBold, txsRegular } from "@/Components/UI/Typography";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "sharedLicense"];

// Shared logic for the "/<panel>/license" page across every org panel
// (doctor/pharmacy/clinic/paraClinic) - fetches that org's primary,
// currently-sellable plan lineup (isActive AND isPrimary, sorted by order)
// from <org>Controller.getMyLicenseOverview, along with every
// LicenseDuration referenced by at least one of those plans' pricing
// options. JSX/styling intentionally left for a follow-up pass.
const LicensePlansPage = ({ name }: { name: LicenseOrg }) => {
  const { data, error } = useSWR<ILicenseCatalog>(
    `${API}/${name}/license`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [selectedDuration, setSelectedDuration] =
    useState<ILicenseDuration | null>(null);

  useEffect(() => {
    if (!!selectedDuration || !data?.durations.length) return;
    setSelectedDuration(data.durations[0]);
  }, [selectedDuration, data]);

  const getContent = useScopedLocale(LOCALE_NS);

  // TODO: render `licenses`/`durations` (plan cards + duration picker +
  // purchase action, calling `mutate` on a successful purchase) once the
  // JSX/CSS pass for this page happens. `error`/`isLoading` are already
  // wired up above for that pass's loading/error states.
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.header}>
            <div className={classes.icon}>
              <Ixon width="1.5rem">
                <LockCloseIcon />
              </Ixon>
            </div>
            <h1 className={`${classes.h1} ${t3xlBold}`}>
              {getContent("primaryLicencesPageTitle")}
            </h1>
            <legend className={`${classes.legend} ${txsRegular}`}>
              {getContent("primaryLicensesPageDescription")}
            </legend>
          </div>
          <div className={classes.content}>
            <div className={classes.intro}>
              <h2 className={`${classes.h2} ${tlgDemiBold}`}>
                {getContent("primaryLicensesIntroTitle")}
              </h2>
              <p className={`${classes.introDescription} ${txsRegular}`}>
                {getContent("primaryLicensesIntroDescription")}
              </p>
            </div>
            <LicenseDurationSelector
              durations={data.durations}
              selectedDuration={selectedDuration}
              onSelect={setSelectedDuration}
              className={classes.durationSelector}
            />
            {!!data.licenses.length && (
              <div className={classes.list}>
                {data.licenses.map((license) => (
                  <LicenseCard
                    key={license._id}
                    duration={selectedDuration}
                    license={license}
                    org={name}
                  />
                ))}
              </div>
            )}
            <Button
              className={classes.all}
              href={`${licensePanelRootByOrg[name]}/license/all`}
              variant="Secondary"
              mode="Inline"
              size="M"
              tailIcon={
                <Ixon style={{ transform: "rotateZ(90deg)" }}>
                  <ChevronIcon />
                </Ixon>
              }
            >
              {getContent("otherLicenses")}
            </Button>
            <div className={classes.infos}>
              <p className={classes.info} style={{ textAlign: "start" }}>
                {getContent("licenseInfoItem0")}
              </p>
              <p className={classes.info} style={{ textAlign: "center" }}>
                {getContent("licenseInfoItem1")}
              </p>
              <p className={classes.info} style={{ textAlign: "end" }}>
                {getContent("licenseInfoItem2")}
              </p>
            </div>
            <div className={classes.outro}>
              <p className={classes.consult}>{getContent("licenseConsult")}</p>
              <Button
                variant="Primary"
                mode="Fill"
                size="M"
                href="/contact"
                radius="Medium"
                className={classes.contact}
              >
                {getContent("contactUs")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

export default LicensePlansPage;
