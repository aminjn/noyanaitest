import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";

// Shared by every /become/[org] "name only" page (clinic/hospital/insurance/
// pharmacy/paraClinic) - fetches the user's own become-request for that org
// (GET `${API}${requestPath}`, e.g. "/clinic/request"), which is `null` if
// they haven't submitted one yet. Generic over T so each page can pass its
// own IBecome{Org}Request type.
export const useBecomeRequestStatus = <T>(requestPath: string) => {
  const { data, error, isLoading, mutate } = useSWR<T | null>(
    `${API}${requestPath}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  return { request: data, error, isLoading, mutate };
};
