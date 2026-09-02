import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { ClinicDashboardModule } from "../Admin/BaseClinicLicense/AdminManageBaseClinicLicensesPage";

// Mirrors clinicController.getMyLicenseModules on noyanai-back - the
// resolved set of dashboard modules this clinic (owner or delegated
// secretary) currently has access to, already accounting for the
// ClinicProfileLicense / default-BaseClinicLicense fallback server-side.
// Mirrors Components/Hooks/usePharmacyLicenseModules.tsx /
// useDoctorLicenseModules.tsx.
const useClinicLicenseModules = () => {
  const { data, error } = useSWR<ClinicDashboardModule[]>(
    `${API}/clinic/license/modules`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return { modules: data, isLoading: !data && !error, error };
};

export default useClinicLicenseModules;
