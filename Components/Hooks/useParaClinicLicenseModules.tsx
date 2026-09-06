import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { ParaClinicDashboardModule } from "../Admin/BaseParaClinicLicense/AdminManageBaseParaClinicLicensesPage";

// Mirrors paraClinicController.getMyLicenseModules on noyanai-back - the
// resolved set of dashboard modules this paraClinic (owner or delegated
// secretary) currently has access to, already accounting for the
// ParaClinicProfileLicense / default-BaseParaClinicLicense fallback
// server-side. Mirrors Components/Hooks/usePharmacyLicenseModules.tsx.
const useParaClinicLicenseModules = () => {
  const { data, error } = useSWR<ParaClinicDashboardModule[]>(
    `${API}/paraClinic/license/modules`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return { modules: data, isLoading: !data && !error, error };
};

export default useParaClinicLicenseModules;
