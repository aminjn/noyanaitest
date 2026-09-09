import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { HospitalDashboardModule } from "../Admin/BaseHospitalLicense/AdminManageBaseHospitalLicensesPage";

// Mirrors hospitalController.getMyLicenseModules on noyanai-back - the
// resolved set of dashboard modules this hospital (owner or delegated
// secretary) currently has access to, already accounting for the
// HospitalProfileLicense / default-BaseHospitalLicense fallback server-side.
// Mirrors Components/Hooks/useClinicLicenseModules.tsx /
// usePharmacyLicenseModules.tsx / useDoctorLicenseModules.tsx.
const useHospitalLicenseModules = () => {
  const { data, error } = useSWR<HospitalDashboardModule[]>(
    `${API}/hospital/license/modules`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return { modules: data, isLoading: !data && !error, error };
};

export default useHospitalLicenseModules;
