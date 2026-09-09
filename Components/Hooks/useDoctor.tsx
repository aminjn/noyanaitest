import useSWR from "swr";
import { API } from "../config";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { fetcher } from "../helpers/fetcher";

const useDoctor = () => {
  const { data, isLoading, mutate } = useSWR<IDoctorProfile | null>(
    `${API}/doctor`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  return { doctor: data, isLoading, mutate };
};

export default useDoctor;
