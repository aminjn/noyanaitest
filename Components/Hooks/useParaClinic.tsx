import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { IParaClinic } from "../Layout/ParaClinicPanelLayout";

const useParaClinic = () => {
  const { data, isLoading, mutate } = useSWR<IParaClinic | null>(
    `${API}/paraClinic`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  return { paraClinic: data, isLoading, mutate };
};

export default useParaClinic;
