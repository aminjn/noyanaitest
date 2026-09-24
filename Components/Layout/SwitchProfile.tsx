import { Fragment, useMemo } from "react";
import useClinic from "../Hooks/useClinic";
import useDoctor from "../Hooks/useDoctor";
import useHospital from "../Hooks/useHospital";
import useInsurance from "../Hooks/useInsurance";
import useParaClinic from "../Hooks/useParaClinic";
import usePharmacy from "../Hooks/usePharmacy";
import usePopup from "../Hooks/usePopup";
import PopupCard from "../UI/PopupCard";
import { t2xsMedium, t2xsRegular, tbaseMedium } from "../UI/Typography";
import classes from "./SwitchProfile.module.css";
import Loading from "../Admin/UI/Loading";
import { usePathname } from "next/navigation";
import { ContentKey } from "../Enums/contentKeys";
import useUser from "../Hooks/useUser";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import Link from "next/link";
import HostedImage from "../UI/HostedImage";
import Ixon from "../UI/Ixon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import usePanelsMap from "./usePanelsMaps";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

export const panels = [
  "dashboard",
  "secetary",
  "doctor",
  "clinic",
  "paraClinic",
  "hospital",
  "insurance",
  "pharmacy",
] as const;

export type Panel = (typeof panels)[number];

export const panelToDashboardDict: Record<Panel, string> = {
  clinic: "/clinicpanel",
  secetary: "/secretarypanel",
  dashboard: "/dashboard",
  doctor: "/doctorpanel",
  hospital: "/hospitalpanel",
  insurance: "/insurancepanel",
  paraClinic: "/paraClinicPanel",
  pharmacy: "/pharmacypanel",
};

export const SwitchProfilePopup = () => {
  const getContent = useScopedLocale(LOCALE_NS);

  const { closePopup } = usePopup();

  const { currentPanel, isLoading, panelsMap } = usePanelsMap();

  return (
    <PopupCard title={getContent("myProfiles")}>
      {isLoading ? (
        <Loading />
      ) : (
        <div className={classes.content}>
          {Object.entries(panelsMap).map(([panel, details]) => (
            <Fragment key={panel}>
              {details.active && panel !== currentPanel ? (
                <Link
                  href={panelToDashboardDict[panel as Panel]}
                  className={classes.panel}
                  onClick={() => closePopup()}
                >
                  <div className={classes.panelImage}>
                    <HostedImage
                      src={details.avatar}
                      alt={details.name}
                      fill
                      sizes="2.125rem"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className={classes.panelContent}>
                    <span className={`${classes.panelLabel} ${tbaseMedium}`}>
                      {getContent(details.label)}
                    </span>
                    {details.name && (
                      <span className={`${classes.panelName} ${t2xsRegular}`}>
                        {details.name}
                      </span>
                    )}
                  </div>
                  <Ixon className={classes.arrow} width="1rem">
                    <ArrowLeftIcon />
                  </Ixon>
                </Link>
              ) : null}
            </Fragment>
          ))}
        </div>
      )}
    </PopupCard>
  );
};

const SwitchProfile = () => {
  const getContent = useScopedLocale(LOCALE_NS);

  const { setPopup } = usePopup();

  const { currentPanel, panelsMap } = usePanelsMap();

  return (
    <div className={classes.main}>
      <span className={`${classes.label} ${t2xsMedium}`}>
        {getContent(panelsMap[currentPanel].label)}
      </span>
      <button
        type="button"
        className={`${classes.switchButton} ${t2xsRegular}`}
        onClick={() => setPopup("SwithProfile", <SwitchProfilePopup />)}
      >
        {getContent("switch")}
      </button>
    </div>
  );
};

export default SwitchProfile;
