import { useCallback, useEffect, useRef, useState } from "react";
import classes from "./TimePicker.module.css";
import useLocale from "../Hooks/useLocale";
import ChevronIcon from "../Icons/ChevronIcon";
import Ixon from "./Ixon";
import { clamp } from "../helpers/lib";
import { WithStyleProps } from "../Layout/Layout";
import { numberToTime } from "../DoctorPanel/Calendar/AddSessionsAgent";
import { t2xsRegular } from "./Typography";
import XMarkIcon from "../Icons/XMarkIcon";

const TimePicker = ({
  onChange,
  value,
  className = "",
  style,
  prefix,
  clearable,
  fontSize,
}: WithStyleProps<{
  value: number | null;
  onChange: (newVal: number | null) => unknown;
  prefix?: string;
  clearable?: boolean;
  fontSize?: string;
}>) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const [inner, setInner] = useState<number>(
    typeof value === "number" ? value : 12 * 60,
  );

  useEffect(() => {
    if (isOpen && !value) onChange(720);
  }, [isOpen, onChange, value]);

  const getContent = useLocale();

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

  const tick = useCallback(
    (tick: number) => {
      const newVal = clamp(0, inner + tick, 24 * 60);
      setInner(newVal);
      onChange(newVal);
    },
    [inner, onChange],
  );

  return (
    <div
      className={`${classes.main} ${fontSize || t2xsRegular} ${className}`}
      style={style}
      ref={containerRef}
    >
      <div className={`${classes.label}`}>
        {!!prefix && <span>{prefix}</span>}
        <span onClick={() => setIsOpen(true)}>
          {typeof value === "number"
            ? numberToTime(value)
            : getContent("selectTime")}
        </span>
        {clearable && typeof value === "number" && (
          <button
            className={classes.clear}
            type="button"
            onClick={() => onChange(null)}
          >
            <Ixon width="1rem">
              <XMarkIcon />
            </Ixon>
          </button>
        )}
      </div>
      {!!isOpen && (
        <div className={classes.picker}>
          <div className={classes.segment}>
            <button type="button" onClick={() => tick(60)}>
              <Ixon width="1rem" style={{ transform: "rotateZ(180deg)" }}>
                <ChevronIcon />
              </Ixon>
            </button>
            <span>{String(Math.floor(inner / 60)).padStart(2, "0")}</span>
            <button type="button" onClick={() => tick(-60)}>
              <Ixon width="1rem">
                <ChevronIcon />
              </Ixon>
            </button>
          </div>
          <span>:</span>
          <div className={classes.segment}>
            <button type="button" onClick={() => tick(5)}>
              <Ixon width="1rem" style={{ transform: "rotateZ(180deg)" }}>
                <ChevronIcon />
              </Ixon>
            </button>
            <span>{String(Math.floor(inner % 60)).padStart(2, "0")}</span>
            <button type="button" onClick={() => tick(-5)}>
              <Ixon width="1rem">
                <ChevronIcon />
              </Ixon>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
