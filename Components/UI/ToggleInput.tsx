import { WithStyleProps } from "../Layout/Layout";
import classes from "./ToggleInput.module.css";

const ToggleInput = ({
  onChange,
  className = "",
  readOnly,
  style,
  title,
  value,
}: WithStyleProps<{
  title?: string;
  value?: boolean;
  onChange?: () => unknown;
  readOnly?: boolean;
}>) => {
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <button
        type="button"
        onClick={() => {
          if (readOnly) return;
          onChange?.();
        }}
        className={`${classes.track} ${!!value ? classes.active : ""}`}
      >
        <span className={classes.thumb} />
      </button>
      {!!title && <span className={classes.label}>{title}</span>}
    </div>
  );
};

export default ToggleInput;
