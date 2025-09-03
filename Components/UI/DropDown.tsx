import { Fragment, useEffect, useState } from "react";
import classes from "./DropDown.module.css";
import { WithStyleProps } from "../Layout/Layout";
import FlatChevron from "../Icons/FlatChevron";

const DropDown = ({
  onChange,
  options,
  value,
  optionsSpanLength = 3,
  className = "",
  style = {},
}: WithStyleProps<{
  options: Record<string, string>;
  value: string;
  onChange: (e: string) => void;
  optionsSpanLength?: number;
}>) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [middle, setMiddle] = useState<number>(() => {
    const index = Object.keys(options).findIndex((e) => e === value);
    if (index < 0) return Math.floor(Object.keys(options).length / 2);
    return index;
  });

  useEffect(() => {
    if (isOpen) {
      const listener = () => setIsOpen(false);
      document.addEventListener("click", listener, false);
      return () => document.removeEventListener("click", listener, false);
    }
  }, [isOpen]);

  return (
    <div style={style} className={`${className} ${classes.main}`}>
      {isOpen && (
        <div className={classes.options}>
          {middle > optionsSpanLength && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                setMiddle((prev) => prev - 1);
              }}
              className={`${classes.option} ${classes.move}`}
              style={{ transform: "rotateZ(180deg)" }}
            >
              <FlatChevron />
            </button>
          )}
          {Object.entries(options).map(([val, title], i) => (
            <Fragment key={val}>
              {Math.abs(i - middle) > optionsSpanLength ? null : (
                <button
                  className={`${classes.option} ${
                    value === val ? classes.active : ""
                  }`}
                  onClick={() => {
                    onChange(val);
                    setMiddle(() => {
                      const index = Object.keys(options).findIndex(
                        (e) => e === val
                      );
                      if (index < 0)
                        return Math.floor(Object.keys(options).length / 2);
                      return index;
                    });
                  }}
                >
                  {title}
                </button>
              )}
            </Fragment>
          ))}
          {Object.keys(options).length - middle > optionsSpanLength && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                setMiddle((prev) => prev + 1);
              }}
              className={`${classes.option} ${classes.move}`}
            >
              <FlatChevron />
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        className={classes.value}
        onClick={() => setIsOpen(true)}
      >
        {options[value]}
      </button>
    </div>
  );
};

export default DropDown;
