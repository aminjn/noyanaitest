import { WithStyleProps } from "../Layout/Layout";
import classes from "./OptionsInput.module.css";
import ToggleInput from "./ToggleInput";

function OptionsInput<T = Record<string, string>>({
  onChange,
  options,
  className = "",
  style,
  title,
  value,
  readOnly,
}: WithStyleProps<{
  options: Record<keyof T, string>;
  value?: Partial<Record<keyof T, boolean>>;
  title?: string;
  onChange?: (key: keyof T) => void;
  readOnly?: boolean;
}>) {
  return (
    <div style={style} className={`${classes.main} ${className}`}>
      {!!title && <legend className={classes.title}>{title}</legend>}
      <div className={classes.options}>
        {Object.entries(options).map(([key, title]) => (
          <ToggleInput
            key={key}
            title={title as string}
            onChange={() => onChange?.(key as keyof T)}
            value={!!value?.[key as keyof T]}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

export default OptionsInput;
