import { useCallback, useMemo, useState } from "react";
import classes from "./CheckboxGroupInput.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { useIntlLocale } from "../i18n/navigation";
import Ixon from "./Ixon";
import CheckIcon from "../Icons/CheckIcon";

const LOCALE_NS: ContentNamespace[] = ["common"];

// A set of choices shown as selectable chips (2026-09 redesign: the plain
// checkbox row wrapped into an unreadable wall on long lists like a plan's
// panel menus), with "select all" / "clear" and a live count.
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
  const getContent = useScopedLocale(LOCALE_NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const keys = Object.keys(options);
  const [input, setInput] = useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : [],
  );

  const set = useCallback(
    (next: string[]) => {
      if (readOnly) return;
      setInput(next);
      onChange?.(next);
    },
    [onChange, readOnly],
  );
  const toggle = (key: string) =>
    set(input.includes(key) ? input.filter((el) => el !== key) : [...input, key]);

  const selected = keys.filter((key) => input.includes(key)).length;

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        {!!title && <legend className={classes.title}>{title}</legend>}
        <span className={classes.count}>
          {getContent("nSelectedOfTotal", [num.format(selected), num.format(keys.length)])}
        </span>
        {!readOnly && keys.length > 3 && (
          <span className={classes.bulk}>
            <button type="button" onClick={() => set(keys)}>
              {getContent("selectAll")}
            </button>
            <button type="button" onClick={() => set([])} disabled={!selected}>
              {getContent("clearSelection")}
            </button>
          </span>
        )}
      </div>
      <div className={classes.options}>
        {keys.map((key) => {
          const on = input.includes(key);
          return (
            <label key={key} className={`${classes.option} ${on ? classes.on : ""}`}>
              <input
                type="checkbox"
                className={classes.native}
                disabled={readOnly}
                checked={on}
                onChange={() => toggle(key)}
              />
              <span className={classes.box} aria-hidden>
                {on && (
                  <Ixon width=".75rem">
                    <CheckIcon />
                  </Ixon>
                )}
              </span>
              <span className={classes.text}>{options[key]}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default CheckboxGroupInput;
