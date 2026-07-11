import classes from "./SortButton.module.css";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { DoctorBookingOptions } from "../Booking/BookingPage2";
import { WithStyleProps } from "../Layout/Layout";
import Ixon from "./Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import { t2xsRegular, txsMedium } from "./Typography";

const SortButton = ({
  onChange,
  options,
  title,
  value,
  className = "",
  style,
}: WithStyleProps<{
  value: string;
  options: { title: string; value: string }[];
  onChange: (newValue: string) => unknown;
  title: string;
}>) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (
        !containerRef.current ||
        !e.target ||
        !containerRef.current.contains(e.target as Node)
      )
        return setIsOpen(false);
    };
    window.addEventListener("click", listener, false);
    return () => window.removeEventListener("click", listener, false);
  }, []);

  return (
    <div
      className={`${classes.main} ${className}`}
      style={style}
      ref={containerRef}
      onClick={() => setIsOpen(true)}
    >
      <span className={`${classes.title} ${txsMedium}`}>{title}</span>
      <span className={`${classes.value} ${t2xsRegular}`}>
        {options.find((el) => el.value === value)?.title}
      </span>
      <Ixon width="1rem" className={classes.chevron}>
        <ChevronIcon />
      </Ixon>
      {isOpen && (
        <div className={`${classes.options}`}>
          {options.map((opt) => (
            <button
              type="button"
              className={classes.option}
              key={opt.value}
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                e.nativeEvent.stopPropagation();
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortButton;
