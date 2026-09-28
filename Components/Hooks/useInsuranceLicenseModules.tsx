import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { InsuranceDashboardModule } from "../Admin/BaseInsuranceLicense/AdminManageBaseInsuranceLicensesPage";

// Mirrors insuranceController.getMyLicenseModules on noyanai-back - the
// resolved set of dashboard modules this insurance (owner or delegated
// secretary) currently has access to, already accounting for the
// InsuranceProfileLicense / default-BaseInsuranceLicense fallback
// server-side. Mirrors Components/Hooks/useHospitalLicenseModules.tsx /
// useClinicLicenseModules.tsx / usePharmacyLicenseModules.tsx /
// useDoctorLicenseModules.tsx.
const useInsuranceLicenseModules = () => {
  const { data, error } = useSWR<InsuranceDashboardModule[]>(
    `${API}/insurance/license/modules`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  // a malformed (non-array) response is treated like no answer yet, so
  // the gates fail open instead of crashing on modules.includes
  const modules = Array.isArray(data) ? data : undefined;
  return { modules, isLoading: !data && !error, error };
};

export default useInsuranceLicenseModules;
