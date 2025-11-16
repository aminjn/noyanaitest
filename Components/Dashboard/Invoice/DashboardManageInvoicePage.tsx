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

const DashboardManageInvoicePage = () => {
  const params = useParams<{ nodeId: string }>();

  const { data, error, mutate } = useSWR<IInvoice>(
    `${API}/user/invoice/${params.nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div>
          <p>
            {getContent("status")} :{" "}
            {getContent(!!data.checkout ? "paid" : "notPaid")}
          </p>
          <p>
            {getContent("total")} : {currencize(data.total)}{" "}
            {getContent("toman")}
          </p>
          <p>
            {getContent("createdAt")} : <FormatDate value={data.submittedAt} />
          </p>
          {!data.checkout && data.payable && (
            <Button
              onClick={() =>
                setPopup(
                  "Checkout",
                  <CheckoutPalPopup invoice={data} mutate={mutate} />
                )
              }
            >
              {getContent("pay")}
            </Button>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default DashboardManageInvoicePage;
