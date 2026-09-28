import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";

type Line = { status?: string };
type IncomingOrder = {
  status?: string;
  products?: Line[];
  productPackages?: Line[];
  tests?: Line[];
};

const list = <T>(value: unknown): T[] => (Array.isArray(value) ? value : []);

// Paid incoming orders with at least one of this provider's lines still
// pending (the backend already scopes each order to the caller's own lines).
// Same SWR key as the orders page, so the sidebar badge, the home page and
// the orders list share one request.
const useOrdersTodo = (kind: "pharmacy" | "paraClinic", enabled: boolean) => {
  const { data } = useSWR<IncomingOrder[]>(
    enabled ? `${API}/${kind}/order` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const count = list<IncomingOrder>(data).filter(
    (order) =>
      order?.status === "paid" &&
      [
        ...list<Line>(order.products),
        ...list<Line>(order.productPackages),
        ...list<Line>(order.tests),
      ].some((line) => line?.status === "pending"),
  ).length;
  return { loaded: data !== undefined, count };
};

export default useOrdersTodo;
