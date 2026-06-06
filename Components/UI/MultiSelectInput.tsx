import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./MultiSelectInput.module.css";
import Ixon from "./Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import { t2xsRegular, tsmMedium, txsRegular } from "./Typography";
import XMarkIcon from "../Icons/XMarkIcon";
import useLocale from "../Hooks/useLocale";

export type MultiSelectOption = { title: string; value: string };

const MultiSelectInput = function <TMulti extends boolean = true>({
  onChange,
  options,
  placeholder,
  className = "",
  style,
  value,
  multi = false,
  title,
}: WithStyleProps<{
  placeholder: string;
  options: MultiSelectOption[];
  onChange: (selected: string[]) => unknown;
  value: TMulti extends true ? string[] : string;
  multi?: boolean;
  title?: string;
}>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [query, setQuery] = useState<string>("");

  const containerRef = useRef<HTMLDivElement>(null);

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

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [options, query],
  );

  return (
    <div className={classes.container}>
      {!!title && <span>{title}</span>}
      <div
        ref={containerRef}
        className={`${classes.main} ${className}`}
        style={style}
        onClick={() => setIsOpen(true)}
      >
        <div
          className={`${classes.select} ${isOpen ? classes.openSelect : ""}`}
        >
          <div className={classes.content}>
            {(Array.isArray(value) ? value : [value])
              .map((v) => options.find((el) => el.value === v))
              .filter((el) => !!el)
              .map((option) => (
                <span
                  className={`${classes.value} ${txsRegular}`}
                  key={option.value}
                  onClick={() => {
                    if (!multi) return onChange([]);
                    const newValue = [...(value as string[])];
                    const index = newValue.findIndex(
                      (el) => el === option.value,
                    );
                    if (index === -1) return;
                    newValue.splice(index, 1);
                    onChange(newValue);
                  }}
                >
                  <span>{option.title}</span>
                  <Ixon width="1rem" className={classes.remove}>
                    <XMarkIcon />
                  </Ixon>
                </span>
              ))}
            <input
              placeholder={placeholder}
              className={`${classes.input} ${t2xsRegular}`}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Ixon className={classes.chevron} width="1rem">
            <ChevronIcon />
          </Ixon>
        </div>
        {!!isOpen && (
          <div className={classes.dropDown}>
            {!!filteredOptions.length ? (
              filteredOptions.map((option) => (
                <div
                  className={`${classes.option} ${value.includes(option.value) ? classes.activeOption : ""}`}
                  key={option.value}
                  onClick={() => {
                    if (!multi) return onChange([option.value]);
                    const newValue = [...(value as string[])];
                    const index = newValue.findIndex(
                      (el) => el === option.value,
                    );
                    if (index === -1) {
                      newValue.push(option.value);
                    } else {
                      newValue.splice(index, 1);
                    }
                    onChange(newValue);
                  }}
                >
                  {option.title}
                </div>
              ))
            ) : (
              <div className={`${classes.nothing} ${tsmMedium}`}>
                {getContent("noResultFound")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectInput;
