"use client";

import { useState } from "react";
import classes from "./WalletChargePopup.module.css";
import PopupCard from "../UI/PopupCard";
import Form from "../UI/Form";
import Input from "../UI/Input";
import Button from "../UI/Button";
import useScopedLocale from "../Hooks/useScopedLocale";
import useNotification from "../Hooks/useNotification";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { currencize } from "../helpers/currencize";
import { t2xsRegular } from "../UI/Typography";
import { parseAmountInput, usePaymentConfig } from "./paymentTypes";
import WalletChargeAct from "./WalletChargeAct";

const NS: ContentNamespace[] = ["common", "onlinePayment"];

// "Charge wallet" popup (dashboard transactions page): asks for an amount
// in Toman and sends the user to the SEP gateway to pay it.
const WalletChargePopup = ({
  defaultAmount,
  returnPath,
}: {
  defaultAmount?: number;
  returnPath?: string;
}) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const { data: config } = usePaymentConfig();

  const [amount, setAmount] = useState<number>(defaultAmount || 0);
  const [payload, setPayload] = useState<{
    amount: number;
    returnPath?: string;
  } | null>(null);

  const minAmount = config?.minAmount || 1;

  const submit = () => {
    if (payload) return;
    if (!amount || amount < minAmount) {
      pushNotification(
        `${getContent("minimumChargeAmount")}: ${currencize(minAmount)} ${getContent("toman")}`,
        "Warn",
      );
      return;
    }
    setPayload({ amount, returnPath });
  };

  return (
    <PopupCard title={getContent("chargeWallet")}>
      <Form className={classes.main} onSubmit={submit}>
        <Input
          title={getContent("chargeAmount")}
          inputMode="numeric"
          defaultValue={defaultAmount ? String(defaultAmount) : undefined}
          onChange={(e) => setAmount(parseAmountInput(e.target.value))}
        />
        <div className={`${classes.hints} ${t2xsRegular}`}>
          {amount > 0 && (
            <span>{`${currencize(amount)} ${getContent("toman")}`}</span>
          )}
          <span className={classes.min}>
            {`${getContent("minimumChargeAmount")}: ${currencize(minAmount)} ${getContent("toman")}`}
          </span>
        </div>
        <Button
          type="submit"
          variant="Primary"
          mode="Fill"
          size="M"
          radius="Medium"
          isLoading={!!payload}
        >
          {getContent("payOnline")}
        </Button>
      </Form>
      <WalletChargeAct payload={payload} onFailed={() => setPayload(null)} />
    </PopupCard>
  );
};

export default WalletChargePopup;
