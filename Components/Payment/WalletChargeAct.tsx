"use client";

import Act from "../UI/Act";
import { API } from "../config";
import useNotification from "../Hooks/useNotification";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { WalletChargeResponse } from "./paymentTypes";

const NS: ContentNamespace[] = ["onlinePayment"];

// Fires POST /payment/wallet/charge whenever `payload` is set and sends the
// browser to the SEP payment page on success. The backend brings the user
// back to /payment/<id> afterwards (Components/Payment/PaymentResultPage).
// Errors (e.g. online payment disabled, below minimum) are toasted by Act.
const WalletChargeAct = ({
  payload,
  onFailed,
}: {
  payload: { amount: number; returnPath?: string } | null;
  onFailed: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  return (
    <Act<WalletChargeResponse>
      path={payload ? `${API}/payment/wallet/charge` : null}
      method="POST"
      payload={payload || undefined}
      onDone={(status, result) => {
        const url = result?.data?.redirectUrl;
        if (!status || !url) return onFailed();
        pushNotification(getContent("redirectingToGateway"));
        window.location.assign(url);
      }}
    />
  );
};

export default WalletChargeAct;
