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

  return { modules: data, isLoading: !data && !error, error };
};

export default useDoctorLicenseModules;
