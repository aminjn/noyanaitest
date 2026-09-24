import { useCallback, useEffect, useRef, useState } from "react";
import classes from "./TimePicker.module.css";
import ChevronIcon from "../Icons/ChevronIcon";
import Ixon from "./Ixon";
import { clamp } from "../helpers/lib";
import { WithStyleProps } from "../Layout/Layout";
import { numberToTime } from "../DoctorPanel/Calendar/AddSessionsAgent";
import { t2xsRegular } from "./Typography";
import XMarkIcon from "../Icons/XMarkIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "uiForm"];

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

  // Mirrors `value` locally so the displayed time updates immediately even
  // when this component sits inside a popup snapshot (Components/Popup/
  // Popup.tsx) that won't re-receive fresh props from its parent after the
  // popup opens - onChange is still called so the real state upstream stays
  // correct.
  const [inner, setInner] = useState<number | null>(
    typeof value === "number" ? value : null,
  );

  useEffect(() => {
    setInner(typeof value === "number" ? value : null);
  }, [value]);

  useEffect(() => {
    if (isOpen && inner === null) {
      setInner(720);
      onChange(720);
    }
  }, [isOpen, inner, onChange]);

  const getContent = useScopedLocale(LOCALE_NS);

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
    (tickBy: number) => {
      const base = typeof inner === "number" ? inner : 12 * 60;
      const newVal = clamp(0, base + tickBy, 24 * 60);
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
          {typeof inner === "number"
            ? numberToTime(inner)
            : getContent("selectTime")}
        </span>
        {clearable && typeof inner === "number" && (
          <button
            className={classes.clear}
            type="button"
            onClick={() => {
              setInner(null);
              onChange(null);
            }}
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
            <span>{String(Math.floor((inner ?? 720) / 60)).padStart(2, "0")}</span>
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
            <span>{String(Math.floor((inner ?? 720) % 60)).padStart(2, "0")}</span>
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
