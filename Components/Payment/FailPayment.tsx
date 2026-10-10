import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useProgress from "../Hooks/useProgress";
import CloseIcon from "../Icons/CloseIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import classes from "./FailPayment.module.css";
import { IGatewayPayment } from "./paymentTypes";

const NS: ContentNamespace[] = ["common", "paymentResult", "onlinePayment"];

// Failed / cancelled / expired / reversed SEP payment. Nothing was kept:
// SEP refunds any unverified card debit on its own, and a reversed payment
// was refunded explicitly - hence the refund note. "Try again" goes back to
// where the payment started (cart for an order, else its returnPath).
const FailPayment = ({ payment }: { payment: IGatewayPayment }) => {
  const getContent = useScopedLocale(NS);
  const push = useProgress();

  // the checkout it came from, without its "came back topped up" flag
  // (a booking's ?resume=1 said «the top-up is in your wallet» after a
  // failed payment)
  const withoutResume = (path: string) => {
    const [base, query = ""] = path.split("?");
    const q = new URLSearchParams(query);
    q.delete("resume");
    const rest = q.toString();
    return rest ? `${base}?${rest}` : base;
  };
  const retryHref =
    payment.purpose === "order"
      ? "/cart"
      : payment.returnPath
        ? withoutResume(payment.returnPath)
        : "/dashboard/transaction";

  return (
    <div className={classes.main}>
      <Ixon width="3.875rem" className={`${classes.icon} glassIcon tone-rose`}>
        <CloseIcon />
      </Ixon>
      <legend className={classes.legend}>
        {getContent("paymentFailedMessage")}
      </legend>
      <p className={classes.message}>
        {payment.failureReason === "CanceledByUser"
          ? getContent("paymentCanceledByUser")
          : getContent("paymentFailedText")}
      </p>
      {/* the refund note is already in the headline (paymentFailedMessage) */}
      <Button className={classes.action} onClick={() => push(retryHref)}>
        {getContent("tryAgain")}
      </Button>
      <Button
        className={classes.action}
        mode="Outline"
        onClick={() => push("/dashboard")}
      >
        {getContent("dashboard")}
      </Button>
    </div>
  );
};

export default FailPayment;
