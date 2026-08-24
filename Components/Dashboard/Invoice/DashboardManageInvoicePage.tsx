"use client";

import { useParams } from "next/navigation";
import classes from "./DashboardManageInvoicePage.module.css";
import useSWR from "swr";
import { API } from "@/Components/config";
import { IInvoice } from "@/Components/Booking/SelectSessionToReservePopup";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useLocale from "@/Components/Hooks/useLocale";
import { currencize } from "@/Components/helpers/currencize";
import FormatDate from "@/Components/UI/FormatDate";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import CheckoutPalPopup from "./CheckoutPopup";
import DataPair from "@/Components/Admin/UI/DataPair";
import List from "@/Components/Admin/UI/List";
import WithTitle from "@/Components/Admin/UI/WithTitle";

const DashboardManageInvoicePage = () => {
  const params = useParams<{ nodeId: string }>();

  const { data, error, mutate } = useSWR<IInvoice>(
    `${API}/user/invoice/${params.nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

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
            {!data.checkout && data.payable && (
              <Button
                onClick={() =>
                  setPopup(
                    "Checkout",
                    <CheckoutPalPopup invoice={data} mutate={mutate} />,
                  )
                }
              >
                {getContent("pay")}
              </Button>
            )}
          </List>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default DashboardManageInvoicePage;
