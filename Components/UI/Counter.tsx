import classes from "./Counter.module.css";
import { txsMedium } from "./Typography";

const Counter = ({
  value,
  onTick,
  title,
  onChange,
}: {
  value: number;
  onTick?: (tick: number) => unknown;
  onChange?: (value: number) => unknown;
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
        <input
          className={`${classes.value} ${txsMedium}`}
          value={value}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (
              isNaN(val) ||
              e.target.value.includes(".") ||
              e.target.value.includes(" ") ||
              e.target.value.includes("-")
            )
              return;
            onChange?.(val);
          }}
          dir="ltr"
        />
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
