import { useEffect, useState } from "react";
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
  // Mirrors `value` locally so the switch flips immediately even when this
  // component sits inside a popup snapshot (Components/Popup/Popup.tsx) that
  // won't re-receive fresh props from its parent after the popup opens -
  // onChange is still called so the real state upstream stays correct.
  const [innerValue, setInnerValue] = useState<boolean>(!!value);

  useEffect(() => {
    setInnerValue(!!value);
  }, [value]);

  const toggle = () => {
    if (readOnly) return;
    setInnerValue((prev) => !prev);
    onChange?.();
  };

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <button
        type="button"
        role="switch"
        aria-checked={innerValue}
        aria-label={title}
        onClick={toggle}
        className={`${classes.track} ${innerValue ? classes.active : ""}`}
      >
        <span className={classes.thumb} />
      </button>
      {!!title && (
        <span className={classes.label} onClick={toggle}>
          {title}
        </span>
      )}
    </div>
  );
};

export default ToggleInput;
