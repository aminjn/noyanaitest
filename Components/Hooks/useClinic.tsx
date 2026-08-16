import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";

const useClinic = () => {
  const { data, isLoading, mutate } = useSWR<IClinic | null>(
    `${API}/clinic`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  return { clinic: data, isLoading, mutate };
};

export default useClinic;
