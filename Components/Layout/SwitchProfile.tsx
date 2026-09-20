import { Fragment, useMemo } from "react";
import useClinic from "../Hooks/useClinic";
import useDoctor from "../Hooks/useDoctor";
import useHospital from "../Hooks/useHospital";
import useInsurance from "../Hooks/useInsurance";
import useParaClinic from "../Hooks/useParaClinic";
import usePharmacy from "../Hooks/usePharmacy";
import usePopup from "../Hooks/usePopup";
import useScopedLocale from "../Hooks/useScopedLocale";
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

const panels = [
  "dashboard",
  "secetary",
  "doctor",
  "clinic",
  "paraClinic",
  "hospital",
  "insurance",
  "pharmacy",
] as const;

type Panel = (typeof panels)[number];

const panelToDashboardDict: Record<Panel, string> = {
  clinic: "/clinicpanel",
  secetary: "/secretarypanel",
  dashboard: "/dashboard",
  doctor: "/doctorpanel",
  hospital: "/hospitalpanel",
  insurance: "/insurancepanel",
  paraClinic: "/paraClinicPanel",
  pharmacy: "/pharmacypanel",
};

const SwitchProfilePopup = () => {
  const getContent = useScopedLocale(["common"]);
  const { user } = useUser();
  const { doctor, isLoading: isDoctorLoading } = useDoctor();
  const { pharmacy, isLoading: isPharmacyLoading } = usePharmacy();
  const { clinic, isLoading: isClinicLoading } = useClinic();
  const { paraClinic, isLoading: isParaClinicLoading } = useParaClinic();
  const { hospital, isLoading: isHospitalLoading } = useHospital();
  const { insurance, isLoading: isInsuranceLoading } = useInsurance();

  const { closePopup } = usePopup();

  const isLoading = useMemo<boolean>(
    () =>
      !user ||
      isDoctorLoading ||
      isPharmacyLoading ||
      isClinicLoading ||
      isParaClinicLoading ||
      isHospitalLoading ||
      isInsuranceLoading,
    [
      user,
      isDoctorLoading,
      isPharmacyLoading,
      isClinicLoading,
      isParaClinicLoading,
      isHospitalLoading,
      isInsuranceLoading,
    ],
  );

  const panelsMap = useMemo<
    Record<
      Panel,
      { active?: boolean; name?: string; label: ContentKey; avatar?: string }
    >
  >(
    () => ({
      clinic: {
        label: "clinicPanel",
        active: !!clinic,
        name: clinic?.name,
        avatar: clinic?.image,
      },
      dashboard: {
        label: "dashboard",
        active: true,
        name: user?.username,
        avatar: user?.avatar,
      },
      doctor: {
        label: "doctorDashboard",
        active: !!doctor,
        name: doctor ? getDoctorProfileLabel(doctor) : "پزشک",
        avatar: doctor?.avatar,
      },
      hospital: {
        label: "hospitalDashboard",
        active: !!hospital,
        name: hospital?.name,
        avatar: hospital?.image,
      },
      insurance: {
        label: "insuranceDashboard",
        active: !!insurance,
        name: insurance?.name,
        avatar: insurance?.image,
      },
      paraClinic: {
        label: "paraClinicDashboard",
        active: !!paraClinic,
        name: paraClinic?.name,
        avatar: paraClinic?.image,
      },
      pharmacy: {
        label: "pharmacyDashboard",
        active: !!pharmacy,
        name: pharmacy?.name,
        avatar: pharmacy?.avatar,
      },
      secetary: {
        label: "secretaryDashboard",
        active: true,
        name: user?.username,
        avatar: user?.avatar,
      },
    }),
    [user, doctor, pharmacy, clinic, paraClinic, hospital, insurance],
  );

  const pathname = usePathname();

  const currentPanel = useMemo<Panel>(() => {
    for (const p of panels) {
      if (pathname.startsWith(panelToDashboardDict[p])) return p;
    }
    return "dashboard";
  }, [pathname]);

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
  const getContent = useScopedLocale(["common"]);

  const { setPopup } = usePopup();

  return (
    <div className={classes.main}>
      <span className={`${classes.label} ${t2xsMedium}`}>
        {getContent("publicProfile")}
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
