import useDoctor from "../Hooks/useDoctor";
import useClinic from "../Hooks/useClinic";
import useHospital from "../Hooks/useHospital";
import useInsurance from "../Hooks/useInsurance";
import usePharmacy from "../Hooks/usePharmacy";
import useParaClinic from "../Hooks/useParaClinic";
import { becomeOrgs } from "./becomeOrgs";

// Shared by app/become/layout.tsx (BecomeLayout) - checks, across all 6 org
// types at once, whether the current user already has a profile of any of
// them, same "does this user already have this node?" check every
// *PanelLayout already does individually for its own single org. Someone
// who already is one of these gets bounced to that panel from anywhere
// under /become/*, mirroring the old BecomeSomethingPage.tsx behavior.
const useBecomeOrgProfiles = () => {
  const { doctor, isLoading: isDoctorLoading } = useDoctor();
  const { clinic, isLoading: isClinicLoading } = useClinic();
  const { hospital, isLoading: isHospitalLoading } = useHospital();
  const { insurance, isLoading: isInsuranceLoading } = useInsurance();
  const { pharmacy, isLoading: isPharmacyLoading } = usePharmacy();
  const { paraClinic, isLoading: isParaClinicLoading } = useParaClinic();

  const isLoading =
    isDoctorLoading ||
    isClinicLoading ||
    isHospitalLoading ||
    isInsuranceLoading ||
    isPharmacyLoading ||
    isParaClinicLoading;

  const existingPanelPath = doctor
    ? becomeOrgs.doctor.panelPath
    : clinic
      ? becomeOrgs.clinic.panelPath
      : hospital
        ? becomeOrgs.hospital.panelPath
        : insurance
          ? becomeOrgs.insurance.panelPath
          : pharmacy
            ? becomeOrgs.pharmacy.panelPath
            : paraClinic
              ? becomeOrgs.paraClinic.panelPath
              : null;

  return { isLoading, existingPanelPath };
};

export default useBecomeOrgProfiles;
