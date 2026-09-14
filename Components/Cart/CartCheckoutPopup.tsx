"use client";

import { useState } from "react";
import useSWR from "swr";
import classes from "./CartCheckoutPopup.module.css";
import PopupCard from "../UI/PopupCard";
import useLocale from "../Hooks/useLocale";
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
import Act from "../UI/Act";
import { IWallet } from "../Booking/Finalize/FinalizeBookingPage";
import { IUserAddress } from "../Dashboard/Address/DashboardManageAddressesPage";
import DashboardMutateAddressPopup from "../Dashboard/Address/DashboardMutateAddressPopup";
import {
  t2xsRegular,
  tbaseDemiBold,
  tsmDemiBold,
  tsmRegular,
} from "../UI/Typography";

// only "wallet" is wired up on the backend today (CartController.submitCart)
type OrderPaymentMethod = "wallet";

const checkoutMethods: OrderPaymentMethod[] = ["wallet"];

type SubmitCartResponse = { data: { _id: string } };

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
  const getContent = useLocale();

  const { closePopup, setPopup } = usePopup();

  const push = useProgress();

  const pushNotification = useNotification();

  const { data: addresses, mutate: mutateAddresses } = useSWR<IUserAddress[]>(
    `${API}/user/address`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { data: wallet } = useSWR<IWallet>(`${API}/user/wallet`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const { data: summary } = useSWR<CartSummary>(
    `${API}/cart/summary`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const [address, setAddress] = useState<string | null>(null);
  const [method] = useState<OrderPaymentMethod>("wallet");
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
                    <span
                      className={`${classes.addressValue} ${t2xsRegular}`}
                    >
                      {node.address}
                    </span>
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
              >
                <div className={classes.methodIcon}>
                  <Ixon width="1.5rem">
                    <WalletIcon />
                  </Ixon>
                </div>
                <span className={`${classes.methodName} ${tsmRegular}`}>
                  {getContent(m)}
                </span>
                <div className={classes.methodTail}>
                  {!!wallet && (
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
        <div className={classes.totalRow}>
          <span className={tsmRegular}>{getContent("tax")}</span>
          <span className={tsmRegular}>
            {summary && summary.tax > 0
              ? `${currencize(summary.tax)} ${getContent("toman")}`
              : getContent("freeOfCharge")}
          </span>
        </div>
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
              pushNotification(getContent("checkInput"), "Warn");
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
        successMessage={getContent("orderSubmittedMessage")}
        onDone={(status, result) => {
          setIsSubmitting(false);
          if (status && result?.data?._id) {
            closePopup();
            push(`/order/${result.data._id}`);
          }
        }}
      />
    </PopupCard>
  );
};

export default CartCheckoutPopup;
