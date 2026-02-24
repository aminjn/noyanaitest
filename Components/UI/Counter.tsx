import classes from "./Counter.module.css";
import { txsMedium } from "./Typography";

const Counter = ({
  value,
  onTick,
  title,
}: {
  value: number;
  onTick?: (tick: number) => unknown;
  title: string;
}) => {
  return (
    <div className={classes.main}>
      <span className={`${classes.title} ${txsMedium}`}>{title}</span>
      <div className={classes.content}>
        <button
          onClick={() => onTick?.(+1)}
          type="button"
          className={`${classes.action} ${txsMedium}`}
        >
          +
        </button>
        <span className={`${classes.value} ${txsMedium}`}>{value}</span>
        <button
          className={`${classes.action} ${txsMedium}`}
          onClick={() => onTick?.(-1)}
          type="button"
        >
          -
        </button>
      </div>
    </div>
  );
};

export default Counter;
