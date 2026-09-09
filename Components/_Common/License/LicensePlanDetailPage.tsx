"use client";

import classes from "./LicensePlanDetailPage.module.css";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import {
  IBaseLicenseDetail,
  ILicenseDuration,
  LicenseOrg,
  licensePanelRootByOrg,
} from "./licenseTypes";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Button from "@/Components/UI/Button";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useProgress from "@/Components/Hooks/useProgress";
import RenderRtf from "@/Components/UI/RenderRtf";
import LicenseDurationSelector from "./LicenseDurationSelector";
import { useEffect, useState } from "react";
import LicensePriceDetails from "./LicensePriceDetails";
import ShareIcon from "@/Components/Icons/ShareIcon";
import { tlgDemiBold, txsRegular } from "@/Components/UI/Typography";
import Ixon from "@/Components/UI/Ixon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";

// Shared logic for the "/<panel>/license/[nodeId]" page across every org
// panel (doctor/pharmacy/clinic/paraClinic) - fetches a single
// Base<Org>License by id from <org>Controller.getLicenseById, which
// (unlike the list endpoints in LicensePlansPage/AllLicensePlansPage) keeps
// `details` and populates each pricing entry's `duration` inline. JSX/
// styling intentionally left for a follow-up pass.
const LicensePlanDetailPage = ({ name }: { name: LicenseOrg }) => {
  const { nodeId } = useParams<{ nodeId: string }>();

  const { data, error } = useSWR<IBaseLicenseDetail>(
    nodeId ? `${API}/${name}/license/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [selectedDuration, setSelectedDuration] =
    useState<ILicenseDuration | null>(null);

  useEffect(() => {
    if (!!selectedDuration || !data?.pricing.length) return;
    setSelectedDuration(data.pricing[0].duration);
  }, [selectedDuration, data]);

  const getContent = useScopedLocale(["common"]);
  const push = useProgress();

  // TODO: render `license` (plan details + duration/price picker + purchase
  // action) once the JSX/CSS pass for this page happens. `error`/
  // `isLoading` are already wired up above for that pass's loading/error
  // states.
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.header}>
            <div className={classes.details}>
              <div className={classes.intro}>
                <h1 className={`${classes.name} ${tlgDemiBold}`}>
                  {data.displayName}
                </h1>
                {!!data.summary && (
                  <p className={`${classes.summary} ${txsRegular}`}>
                    {data.summary}
                  </p>
                )}
              </div>
              <Button
                variant="Disable"
                mode="Fill"
                radius="High"
                size="S"
                tailIcon={<ShareIcon />}
                onClick={() =>
                  navigator.share({ text: window.location.toString() })
                }
              >
                {getContent("share")}
              </Button>
            </div>
            <div className={classes.bot}>
              <LicenseDurationSelector
                className={classes.selector}
                durations={data.pricing.map((el) => el.duration)}
                onSelect={setSelectedDuration}
                selectedDuration={selectedDuration}
              />
              <LicensePriceDetails
                duration={selectedDuration}
                pricing={
                  data.pricing.find(
                    (el) => el.duration._id === selectedDuration?._id,
                  ) || null
                }
              />
            </div>
          </div>
          <RenderRtf value={data.details} />
          <div className={classes.footer}>
            <LicensePriceDetails
              duration={selectedDuration}
              pricing={
                data.pricing.find(
                  (el) => el.duration._id === selectedDuration?._id,
                ) || null
              }
            />
            <Button
              size="M"
              variant="Primary"
              mode="Fill"
              radius="Medium"
              tailIcon={
                <Ixon style={{ transform: "rotateZ(90deg)" }}>
                  <ChevronIcon />
                </Ixon>
              }
              onClick={() =>
                selectedDuration &&
                push(
                  `${licensePanelRootByOrg[name]}/license/${data._id}/checkout?duration=${selectedDuration._id}`,
                )
              }
            >
              {getContent("confirmAndContinue")}
            </Button>
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

export default LicensePlanDetailPage;
