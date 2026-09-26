"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import classes from "./PaymentResultPage.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import Loading from "../Admin/UI/Loading";
import LoginRequired from "../UI/LoginRequired";
import useUser from "../Hooks/useUser";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import SuccessPayment from "./SuccessPayment";
import FailPayment from "./FailPayment";
import { IGatewayPayment, isPendingPaymentStatus } from "./paymentTypes";

const NS: ContentNamespace[] = ["common", "onlinePayment"];

// Where the backend's SEP callback (Controllers/paymentController.ts
// sepCallback) lands the browser after payment: /payment/<GatewayPayment id>.
// The payment may still be verifying when the page loads, so it polls until
// the status is final.
const PaymentResultPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { user, isUserLoading } = useUser();
  const getContent = useScopedLocale(NS);

  const { data, error } = useSWR<IGatewayPayment>(
    nodeId && user ? `${API}/payment/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    {
      refreshInterval: (latest) =>
        latest && !isPendingPaymentStatus(latest.status) ? 0 : 3000,
    },
  );

  if (!isUserLoading && !user) return <LoginRequired />;

  return (
    <div className={classes.main}>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (isPendingPaymentStatus(data.status) ? (
            <div className={classes.pending}>
              <Loading />
              <legend className={classes.legend}>
                {getContent("paymentPendingMessage")}
              </legend>
              <p className={classes.message}>
                {getContent("paymentPendingText")}
              </p>
            </div>
          ) : data.status === "paid" ? (
            <SuccessPayment payment={data} />
          ) : (
            <FailPayment payment={data} />
          ))}
      </HandleLoading>
    </div>
  );
};

export default PaymentResultPage;
