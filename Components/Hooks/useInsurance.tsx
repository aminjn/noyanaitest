import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { IInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";

const useInsurance = () => {
  const { data, isLoading, mutate } = useSWR<IInsurance | null>(
    `${API}/insurance`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  return { insurance: data, isLoading, mutate };
};

export default useInsurance;
