import useLocale from "@/Components/Hooks/useLocale";
import classes from "./CountGetter.module.css";
import { useContext } from "react";
import PrescriptionContext from "../../../PrescriptionContext";
import { clamp } from "@/Components/helpers/lib";
import { txsMedium } from "@/Components/UI/Typography";
const CountGetter = () => {
  const getContent = useLocale();

  const { working, setWorking } = useContext(PrescriptionContext);

  return (
    <div className={classes.main}>
      <span className={`${classes.title} ${txsMedium}`}>
        {getContent("drugCount")}
      </span>
      <div className={classes.content}>
        <button
          onClick={() =>
            setWorking((prev) => ({ ...prev, qty: (prev.qty || 0) + 1 }))
          }
          type="button"
          className={`${classes.action} ${txsMedium}`}
        >
          +
        </button>
        <span className={`${classes.value} ${txsMedium}`}>
          {working.qty || 0}
        </span>
        <button
          className={`${classes.action} ${txsMedium}`}
          onClick={() =>
            setWorking((prev) => ({
              ...prev,
              qty: clamp(1, (prev.qty || 0) - 1, Number.MAX_SAFE_INTEGER),
            }))
          }
          type="button"
        >
          -
        </button>
      </div>
    </div>
  );
};

export default CountGetter;
