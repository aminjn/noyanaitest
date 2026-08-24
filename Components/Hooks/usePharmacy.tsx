import useSWR from "swr";
import { API } from "../config";
import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { fetcher } from "../helpers/fetcher";

const usePharmacy = () => {
  const { data, isLoading, mutate } = useSWR<IPharmacy | null>(
    `${API}/pharmacy`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );
  return { pharmacy: data, isLoading, mutate };
};

export default usePharmacy;
