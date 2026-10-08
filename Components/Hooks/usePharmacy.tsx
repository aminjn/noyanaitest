import useSWR from "swr";
import { API } from "../config";
import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { fetcher } from "../helpers/fetcher";

const usePharmacy = () => {
  const { data, isLoading, mutate } = useSWR<IPharmacy | null>(
    `${API}/pharmacy`,
    // the body's `data` is the pharmacy, as PharmacyPanelLayout reads it under
    // the same key: `.data.data` (always undefined) emptied the shared cache
    // on the next revalidation and the whole panel fell back to "become a
    // pharmacy"
    (url: string) => fetcher({ url }).then((res) => res.data ?? null)
  );
  return { pharmacy: data, isLoading, mutate };
};

export default usePharmacy;
