"use client";

import { ReactNode, useEffect, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import classes from "./CartCheckoutPopup.module.css";
import PopupCard from "../UI/PopupCard";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import usePopup from "../Hooks/usePopup";
import useProgress from "../Hooks/useProgress";
import useNotification from "../Hooks/useNotification";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { currencize } from "../helpers/currencize";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import CheckIcon from "../Icons/CheckIcon";
import WalletIcon from "../Icons/WalletIcon";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import { usePaymentConfig } from "../Payment/paymentTypes";
import Act from "../UI/Act";
import { IWallet } from "../Booking/Finalize/FinalizeBookingPage";
import { IUserAddress, localPhone } from "../Dashboard/Address/DashboardManageAddressesPage";
import DashboardMutateAddressPopup from "../Dashboard/Address/DashboardMutateAddressPopup";
import {
  t2xsRegular,
  tbaseDemiBold,
  tsmDemiBold,
  tsmRegular,
} from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "cartCheckoutPopup", "onlinePayment"];

// Mirrors backend Models/Order.ts orderPaymentMethods (CartController.submitCart):
// wallet -> debited immediately; sep -> SEP (Saman) online gateway (2026-09),
// the order stays "pending" until the bank payment is verified.
type OrderPaymentMethod = "wallet" | "sep";

const methodIcons: Record<OrderPaymentMethod, ReactNode> = {
  wallet: <WalletIcon />,
  sep: <ShieldCheckIcon />,
};

// redirectUrl is only present for "sep": the SEP payment page to send the
// browser to (the backend brings it back to /payment/<id> afterwards).
type SubmitCartResponse = { data: { _id: string }; redirectUrl?: string };

// Server-computed cart total, tax included - fetched fresh here rather than
// trusting the `total` prop (which is only the client-side subtotal CartPage
// already had on hand) since tax rates live in admin-only *TaxSettings docs
// this buyer can't read directly (Controllers/cartController.ts
// getCartSummary, 2026-09). Item prices shown elsewhere in the cart never
// change - this popup is specifically the "checkout view" that adds tax on
// top, per the user's request.
type CartSummary = { subtotal: number; tax: number; total: number };

const CartCheckoutPopup = ({
  total,
  requiresAddress,
}: {
  total: number;
  requiresAddress: boolean;
}) => {
  const getContent = useScopedLocale(NS);

  const { closePopup, setPopup } = usePopup();

  const push = useProgress();

  const pushNotification = useNotification();

  const { data: addresses, mutate: mutateAddresses } = useSWR<IUserAddress[]>(
    `${API}/user/address`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { data: wallet } = useSWR<IWallet>(
    `${API}/user/wallet`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { data: summary } = useSWR<CartSummary>(
    `${API}/cart/summary`,
    // fetcher already returns the response body, so `.data` is the summary
    // itself - this used to read `.data.data` (always undefined), which
    // silently fell back to the pre-tax subtotal as the "total".
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  // "sep" is only offered while online payment is enabled + configured in
  // the admin AppConfig (GET /payment/config).
  const { data: paymentConfig } = usePaymentConfig();
  const checkoutMethods: OrderPaymentMethod[] = paymentConfig?.sepEnabled
    ? ["wallet", "sep"]
    : ["wallet"];

  const [address, setAddress] = useState<string | null>(null);
  // preselect the newest saved address (usually the only one) so the buyer
  // does not have to tap it every time
  useEffect(() => {
    if (!Array.isArray(addresses) || !addresses.length) return;
    if (!address || !addresses.some((a) => a._id === address))
      setAddress(addresses[addresses.length - 1]._id);
  }, [addresses, address]);
  const [method, setMethod] = useState<OrderPaymentMethod>("wallet");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <PopupCard title={getContent("confirmAndPayOrder")}>
      <div className={classes.main}>
        <div className={classes.section}>
          <span className={`${classes.sectionTitle} ${tsmDemiBold}`}>
            {getContent("selectDeliveryAddress")}
          </span>
          {!!addresses && (
            <div className={classes.addressList}>
              {addresses.map((node) => (
                <div
                  key={node._id}
                  className={`${classes.address} ${address === node._id ? classes.activeAddress : ""}`}
                  onClick={() => setAddress(node._id)}
                >
                  <div className={classes.addressCheck}>
                    <Ixon width=".75rem">
                      <CheckIcon />
                    </Ixon>
                  </div>
                  <div className={classes.addressDetails}>
                    <span className={`${classes.addressName} ${tsmRegular}`}>
                      {node.displayName}
                    </span>
                    <span className={`${classes.addressValue} ${t2xsRegular}`}>
                      {node.address}
                    </span>
                    {!!node.receiverPhone && (
                      <span className={`${classes.addressValue} ${t2xsRegular}`}>
                        {`${getContent("receiverPhone")}: ${localPhone(node.receiverPhone)}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {addresses.length === 0 && (
                <span className={`${classes.empty} ${t2xsRegular}`}>
                  {getContent("noAddressesRegisteredYet")}
                </span>
              )}
            </div>
          )}
          <Button
            variant="Primary"
            mode="Outline"
            radius="Medium"
            size="S"
            onClick={() =>
              setPopup(
                "CartAddAddress",
                <DashboardMutateAddressPopup
                  mutate={() => mutateAddresses()}
                />,
              )
            }
          >
            {getContent("addNewAddress")}
          </Button>
        </div>
        <div className={classes.section}>
          <span className={`${classes.sectionTitle} ${tsmDemiBold}`}>
            {getContent("paymentMethod")}
          </span>
          <div className={classes.methods}>
            {checkoutMethods.map((m) => (
              <div
                key={m}
                className={`${classes.method} ${method === m ? classes.activeMethod : ""}`}
                onClick={() => setMethod(m)}
              >
                <div className={classes.methodIcon}>
                  <Ixon width="1.5rem">{methodIcons[m]}</Ixon>
                </div>
                <span className={`${classes.methodName} ${tsmRegular}`}>
                  {getContent(m)}
                </span>
                <div className={classes.methodTail}>
                  {m === "wallet" && !!wallet && (
                    <span className={`${classes.balance} ${t2xsRegular}`}>
                      {`${getContent("balance")}: ${currencize(wallet.balance)} ${getContent("toman")}`}
                    </span>
                  )}
                  <div className={classes.methodCheck}>
                    <Ixon width="1rem">
                      <CheckIcon />
                    </Ixon>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={classes.totalRow}>
          <span className={tsmRegular}>{getContent("subtotal")}</span>
          <span className={tsmRegular}>
            {`${currencize(summary ? summary.subtotal : total)} ${getContent("toman")}`}
          </span>
        </div>
        {/* a zero tax is not "free of charge"; the row only shows when
            the seller actually charges tax */}
        {!!summary && summary.tax > 0 && (
          <div className={classes.totalRow}>
            <span className={tsmRegular}>{getContent("tax")}</span>
            <span className={tsmRegular}>
              {`${currencize(summary.tax)} ${getContent("toman")}`}
            </span>
          </div>
        )}
        <div className={classes.totalRow}>
          <span className={tsmRegular}>{getContent("totalPrice")}</span>
          <span className={`${classes.totalPrice} ${tbaseDemiBold}`}>
            {`${currencize(summary ? summary.total : total)} ${getContent("toman")}`}
          </span>
        </div>
        <Button
          variant="Primary"
          mode="Fill"
          size="M"
          radius="Medium"
          isLoading={isSubmitting}
          onClick={() => {
            if (isSubmitting) return;
            if (requiresAddress && !address) {
              pushNotification(getContent("selectAddressFirst"), "Warn");
              return;
            }
            setIsSubmitting(true);
          }}
        >
          {getContent("confirmAndPayOrder")}
        </Button>
      </div>
      <Act<SubmitCartResponse>
        path={isSubmitting ? `${API}/cart/submit` : null}
        method="POST"
        payload={{ method, address: address || undefined }}
        successMessage={
          method === "wallet" ? getContent("orderSubmittedMessage") : undefined
        }
        onDone={(status, result) => {
          if (status && result?.redirectUrl) {
            // keep the loading state on while the browser leaves for the bank
            pushNotification(getContent("redirectingToGateway"));
            window.location.assign(result.redirectUrl);
            return;
          }
          setIsSubmitting(false);
          if (!status) return;
          // the server emptied the cart and debited the wallet: drop the
          // stale copies (cart page, header badge, balance)
          globalMutate(`${API}/cart`);
          globalMutate(`${API}/cart/size`);
          globalMutate(`${API}/cart/summary`);
          globalMutate(`${API}/user/wallet`);
          closePopup();
          if (result?.data?._id) push(`/order/${result.data._id}`);
        }}
      />
    </PopupCard>
  );
};

export default CartCheckoutPopup;
