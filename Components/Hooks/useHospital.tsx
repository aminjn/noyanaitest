import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { IHospital } from "../Admin/Hospital/AdminManageHospitalsPage";

const useHospital = () => {
  const { data, isLoading, mutate } = useSWR<IHospital | null>(
    `${API}/hospital`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  return { hospital: data, isLoading, mutate };
};

export default useHospital;
