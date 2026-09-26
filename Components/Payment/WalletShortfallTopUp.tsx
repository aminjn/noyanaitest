"use client";

import { useState } from "react";
import classes from "./WalletShortfallTopUp.module.css";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import AlertCircleIcon from "../Icons/AlertCircleIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { currencize } from "../helpers/currencize";
import { t2xsRegular, tsmDemiBold } from "../UI/Typography";
import { usePaymentConfig } from "./paymentTypes";
import WalletChargeAct from "./WalletChargeAct";

const NS: ContentNamespace[] = ["common", "onlinePayment"];

// Shown on wallet-only checkouts (doctor booking, license purchase) when
// the wallet can't cover `total`: offers to pay the shortfall through the
// SEP gateway as a wallet top-up, then returns the user to this same page
// (returnPath) to confirm the purchase. Renders nothing when the balance is
// enough or online payment is switched off.
const WalletShortfallTopUp = ({
  balance,
  total,
}: {
  balance: number;
  total: number;
}) => {
  const getContent = useScopedLocale(NS);
  const { data: config } = usePaymentConfig();
  const [payload, setPayload] = useState<{
    amount: number;
    returnPath?: string;
  } | null>(null);

  if (!config?.sepEnabled || total <= 0 || balance >= total) return null;

  const shortfall = total - balance;
  // SEP / AppConfig may impose a minimum larger than the shortfall itself -
  // the extra simply stays in the wallet.
  const amount = Math.max(shortfall, config.minAmount || 1);

  return (
    <div className={classes.main}>
      <div className={classes.info}>
        <Ixon width="1.25rem" className={classes.icon}>
          <AlertCircleIcon />
        </Ixon>
        <span className={tsmDemiBold}>
          {`${getContent("walletShortfall")}: ${currencize(shortfall)} ${getContent("toman")}`}
        </span>
      </div>
      <Button
        variant="Primary"
        mode="Outline"
        size="S"
        radius="Medium"
        isLoading={!!payload}
        onClick={() => {
          if (payload) return;
          setPayload({
            amount,
            returnPath: `${window.location.pathname}${window.location.search}`,
          });
        }}
      >
        <span className={t2xsRegular}>
          {`${getContent("topUpShortfall")} (${currencize(amount)} ${getContent("toman")})`}
        </span>
      </Button>
      <WalletChargeAct payload={payload} onFailed={() => setPayload(null)} />
    </div>
  );
};

export default WalletShortfallTopUp;
