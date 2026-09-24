import { useMemo } from "react";
import { Panel, panels, panelToDashboardDict } from "./SwitchProfile";
import { ContentKey } from "../Enums/contentKeys";
import useUser from "../Hooks/useUser";
import useDoctor from "../Hooks/useDoctor";
import usePharmacy from "../Hooks/usePharmacy";
import useClinic from "../Hooks/useClinic";
import useParaClinic from "../Hooks/useParaClinic";
import useHospital from "../Hooks/useHospital";
import useInsurance from "../Hooks/useInsurance";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import { usePathname } from "next/navigation";

const usePanelsMap = () => {
  const { user } = useUser();
  const { doctor, isLoading: isDoctorLoading } = useDoctor();
  const { pharmacy, isLoading: isPharmacyLoading } = usePharmacy();
  const { clinic, isLoading: isClinicLoading } = useClinic();
  const { paraClinic, isLoading: isParaClinicLoading } = useParaClinic();
  const { hospital, isLoading: isHospitalLoading } = useHospital();
  const { insurance, isLoading: isInsuranceLoading } = useInsurance();

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

  return { panelsMap, isLoading, currentPanel };
};

export default usePanelsMap;
