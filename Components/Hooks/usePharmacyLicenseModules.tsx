import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { PharmacyDashboardModule } from "../Admin/BasePharmacyLicense/AdminManageBasePharmacyLicensesPage";

// Mirrors pharmacyController.getMyLicenseModules on noyanai-back - the
// resolved set of dashboard modules this pharmacy (owner or delegated
// secretary) currently has access to, already accounting for the
// PharmacyProfileLicense / default-BasePharmacyLicense fallback
// server-side. Mirrors Components/Hooks/useDoctorLicenseModules.tsx.
const usePharmacyLicenseModules = () => {
  const { data, error } = useSWR<PharmacyDashboardModule[]>(
    `${API}/pharmacy/license/modules`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return { modules: data, isLoading: !data && !error, error };
};

export default usePharmacyLicenseModules;
