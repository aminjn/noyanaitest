import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useProgress from "../Hooks/useProgress";
import CloseIcon from "../Icons/CloseIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import classes from "./FailPayment.module.css";

const NS: ContentNamespace[] = ["common", "paymentResult"];
const FailPayment = () => {
  const getContent = useScopedLocale(NS);

  const push = useProgress();

  return (
    <div className={classes.main}>
      <Ixon width="3.875rem" className={classes.icon}>
        <CloseIcon />
      </Ixon>
      <legend className={classes.legend}>
        {getContent("paymentFailedMessage")}
      </legend>
      <p className={classes.message}>{getContent("paymentFailedText")}</p>
      <Button
        className={classes.action}
        onClick={() => push("/dashboard")}
      >
        {getContent("dashboard")}
      </Button>
    </div>
  );
};

export default FailPayment;
