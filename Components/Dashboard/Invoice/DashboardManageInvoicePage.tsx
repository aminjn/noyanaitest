"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { IInvoice } from "@/Components/Booking/SelectSessionToReservePopup";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useLocale from "@/Components/Hooks/useLocale";
import { currencize } from "@/Components/helpers/currencize";
import FormatDate from "@/Components/UI/FormatDate";
import DataPair from "@/Components/Admin/UI/DataPair";
import List from "@/Components/Admin/UI/List";
import WithTitle from "@/Components/Admin/UI/WithTitle";

// Read-only per F-01: this page's "pay" action opened CheckoutPalPopup,
// which submitted to /checkout/invoice/:id (settleInvoice) - System A's
// payment step, removed along with the rest of the old /doctors and /dr
// booking flow (see AUDIT/FIXES_TODO.md F-01, F-18). Existing invoices are
// still viewable here for history; none can be paid anymore.
const DashboardManageInvoicePage = () => {
  const params = useParams<{ nodeId: string }>();

  const { data, error } = useSWR<IInvoice>(
    `${API}/user/invoice/${params.nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("invoiceDetails")}>
          <List>
            <DataPair
              title={getContent("status")}
              value={getContent(!!data.checkout ? "paid" : "notPaid")}
            />
            <DataPair
              title={getContent("total")}
              value={`${currencize(data.total)} ${getContent("toman")}`}
            />
            <DataPair
              title={getContent("createdAt")}
              value={<FormatDate value={data.submittedAt} />}
            />
          </List>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default DashboardManageInvoicePage;
