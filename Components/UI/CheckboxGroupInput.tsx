import { useCallback, useState } from "react";
import classes from "./CheckboxGroupInput.module.css";

const CheckboxGroupInput = ({
  onChange,
  defaultValue,
  readOnly,
  title,
  options,
}: {
  title?: string;
  options: Record<string, string>;
  defaultValue?: string[];
  readOnly?: boolean;
  onChange?: (e: string[]) => unknown;
}) => {
  const [input, setInput] = useState<string[]>(defaultValue || []);

  const toggle = useCallback(
    (key: string) => {
      if (readOnly) return;
      setInput((prev) => {
        const next = prev.includes(key)
          ? prev.filter((el) => el !== key)
          : [...prev, key];
        onChange?.(next);
        return next;
      });
    },
    [onChange, readOnly],
  );

  return (
    <div className={classes.main}>
      {!!title && <legend className={classes.title}>{title}</legend>}
      <div className={classes.options}>
        {Object.keys(options).map((key) => (
          <label key={key} className={classes.option}>
            <input
              type="checkbox"
              disabled={readOnly}
              checked={input.includes(key)}
              onChange={() => toggle(key)}
            />
            <span>{options[key]}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroupInput;
