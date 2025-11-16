import useLocale from "../Hooks/useLocale";
import useProgress from "../Hooks/useProgress";
import CloseIcon from "../Icons/CloseIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import classes from "./FailPayment.module.css";
const FailPayment = () => {
  const getContent = useLocale();

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
        variant="NeutralStroke"
        onClick={() => push("/dashboard")}
      >
        {getContent("dashboard")}
      </Button>
    </div>
  );
};

export default FailPayment;
