import classes from "./InlineDateInput.module.css";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import { t2xsRegular } from "./Typography";
import useLocale from "../Hooks/useLocale";
import Ixon from "./Ixon";
import XMarkIcon from "../Icons/XMarkIcon";

const InlineDateInput = ({
  onChange,
  value,
  max,
  min,
  placeholder,
  prefix,
}: {
  value: Date | null;
  onChange: (e: Date | null) => unknown;
  min?: Date;
  max?: Date;
  placeholder?: string;
  prefix?: string;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      {!!prefix && <span className={t2xsRegular}>{prefix}</span>}
      <DatePicker
        containerClassName={classes.container}
        placeholder={placeholder || getContent("selectDate")}
        inputClass={`${classes.input} ${t2xsRegular}`}
        calendar={persian}
        locale={persian_fa}
        multiple={false}
        value={value}
        onChange={(e) => {
          onChange(e?.toDate() || null);
        }}
        minDate={min}
        maxDate={max}
      />
      {!!value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={classes.clear}
        >
          <Ixon width="1rem">
            <XMarkIcon />
          </Ixon>
        </button>
      )}
    </div>
  );
};

export default InlineDateInput;
