import { CustomDateProps } from "ag-grid-react";
import classes from "./TableDateInput.module.css";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import { memo } from "react";
import Ixon from "@/Components/UI/Ixon";
import CloseIcon from "@/Components/Icons/CloseIcon";

const TableDateInput = ({ date, onDateChange }: CustomDateProps) => {
  return (
    <div className={`ag-input-wrapper ${classes.container}`}>
      <DatePicker
        value={date}
        onChange={(e) => {
          if (!e) {
            onDateChange(null);
            return;
          }
          // the device-local midnight of the picked day, as ag-grid expects;
          // TableGrid's comparator reads it as that day against each cell's
          // Tehran day
          const then = e.toDate();
          then.setHours(0, 0, 0, 0);
          onDateChange(then);
        }}
        inputClass={`ag-custom-component-popup ${classes.input}`}
        fixMainPosition
        portal
        portalTarget={
          process.env.NODE_ENV === "development"
            ? document.body
            : document.documentElement
        }
        calendar={persian}
        locale={persian_fa}
      />
      {!!date && (
        <button onClick={() => onDateChange(null)} className={classes.clear}>
          <Ixon>
            <CloseIcon />
          </Ixon>
        </button>
      )}
    </div>
  );
};
export default memo(TableDateInput);
