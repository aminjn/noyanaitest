import classes from "./SuccessPayment.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useProgress from "../Hooks/useProgress";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import { currencize } from "../helpers/currencize";
import { IGatewayPayment } from "./paymentTypes";

const NS: ContentNamespace[] = ["common", "paymentResult", "onlinePayment"];

const Pair = ({ title, value }: { title: string; value?: string }) =>
  value ? (
    <div className={classes.pair}>
      <span className={classes.title}>{title}</span>
      <span className={classes.divider} />
      <span dir="ltr">{value}</span>
    </div>
  ) : null;

// Verified SEP payment. An "order" payment has already paid its order out
// of the wallet (Services/paymentService.ts), so the main action is to view
// it; a wallet top-up offers to go back to wherever it was started from
// (returnPath, e.g. the booking/license checkout) or to the transactions
// list.
const SuccessPayment = ({ payment }: { payment: IGatewayPayment }) => {
  const getContent = useScopedLocale(NS);
  const push = useProgress();

  const primary =
    payment.purpose === "order" && payment.order
      ? { label: getContent("viewOrder"), href: `/order/${payment.order}` }
      : payment.returnPath
        ? { label: getContent("continuePurchase"), href: payment.returnPath }
        : { label: getContent("transactions"), href: "/dashboard/transaction" };

  return (
    <div className={classes.main}>
      <Ixon width="3.875rem" className={`${classes.icon} glassIcon tone-teal`}>
        <CheckCircleIcon />
      </Ixon>
      <legend className={classes.legend}>
        {getContent("paymentSucceededMessage")}
      </legend>
      <div className={classes.details}>
        <Pair
          title={
            payment.purpose === "walletCharge"
              ? getContent("walletTopUp")
              : getContent("amount")
          }
          value={`${currencize(payment.amount)} ${getContent("toman")}`}
        />
        <Pair title={getContent("trackingCode")} value={payment.traceNo} />
        <Pair title={getContent("referenceNumber")} value={payment.rrn} />
      </div>
      <div className={classes.actions}>
        <Button onClick={() => push(primary.href)}>{primary.label}</Button>
        <Button
          mode="Outline"
          onClick={() => push("/dashboard")}
          className={classes.dashboard}
        >
          {getContent("dashboard")}
        </Button>
      </div>
    </div>
  );
};

export default SuccessPayment;
