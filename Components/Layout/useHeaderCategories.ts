import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { HeaderCategories } from "./headerCategories";

// The header's category lists (GET /public/header), shared by the mega menu
// and the mobile drawer (one request, SWR-cached). A response that isn't an
// object is treated as "no categories".
const useHeaderCategories = (): HeaderCategories | undefined => {
  const { data } = useSWR<HeaderCategories | undefined>(
    `${API}/public/header`,
    (url: string) =>
      fetcher({ url }).then((res) =>
        res?.data && typeof res.data === "object" ? res.data : undefined,
      ),
    { revalidateOnFocus: false },
  );
  return data;
};

export default useHeaderCategories;
