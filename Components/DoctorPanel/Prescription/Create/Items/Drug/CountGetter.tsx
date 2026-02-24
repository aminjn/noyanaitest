import useLocale from "@/Components/Hooks/useLocale";
import classes from "./CountGetter.module.css";
import { useContext } from "react";
import PrescriptionContext from "../../../PrescriptionContext";
import { clamp } from "@/Components/helpers/lib";
import { txsMedium } from "@/Components/UI/Typography";
import Counter from "@/Components/UI/Counter";
const CountGetter = () => {
  const getContent = useLocale();

  const { working, setWorking } = useContext(PrescriptionContext);

  return (
    <Counter
      value={working.qty || 0}
      title={getContent("drugCount")}
      onTick={(tick) =>
        setWorking((prev) => ({
          ...prev,
          qty: clamp(1, (prev.qty || 0) + tick, Number.MAX_SAFE_INTEGER),
        }))
      }
    />
  );
};

export default CountGetter;
