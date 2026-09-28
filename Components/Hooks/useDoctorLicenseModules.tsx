import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { DoctorDashboardModule } from "../Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensesPage";

// Mirrors doctorController.getMyLicenseModules on noyanai-back - the
// resolved set of dashboard modules this doctor (owner or delegated
// secretary) currently has access to, already accounting for the
// DoctorProfileLicense / default-BaseDoctorLicense fallback server-side.
const useDoctorLicenseModules = () => {
  const { data, error } = useSWR<DoctorDashboardModule[]>(
    `${API}/doctor/license/modules`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  // a malformed (non-array) response is treated like no answer yet, so
  // the gates fail open instead of crashing on modules.includes
  const modules = Array.isArray(data) ? data : undefined;
  return { modules, isLoading: !data && !error, error };
};

export default useDoctorLicenseModules;
