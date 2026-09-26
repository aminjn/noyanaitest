import useSWR from "swr";
import { API } from "../config";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { fetcher, FetchError } from "../helpers/fetcher";

const useDoctor = () => {
  const { data, isLoading, mutate, error } = useSWR<IDoctorProfile | null>(
    `${API}/doctor`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  // `error.status === 403` means "not a doctor"; anything else (network,
  // 5xx) is a real failure and must not be treated as "no profile".
  return { doctor: data, isLoading, mutate, error: error as FetchError | undefined };
};

export default useDoctor;
