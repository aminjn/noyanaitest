import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import classes from "./MultiSelectInput.module.css";
import useSWR from "swr";
import { fetcher } from "../helpers/fetcher";
import { MultiSelectOption } from "./MultiSelectInput";
import { WithStyleProps } from "../Layout/Layout";
import { t2xsRegular, tsmMedium, txsRegular } from "./Typography";
import Ixon from "./Ixon";
import XMarkIcon from "../Icons/XMarkIcon";
import ChevronIcon from "../Icons/ChevronIcon";
import useDebounce from "../Hooks/useDebounce";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "uiForm"];

const MultiSelectInputServer = function <T = unknown>({
  path,
  getOption,
  value,
  onChange,
  className = "",
  style,
  placeholder,
  multi = true,
}: WithStyleProps<{
  path: string;
  getOption: (node: T) => MultiSelectOption;
  value: T[];
  onChange: (newValue: T[]) => unknown;
  placeholder: string;
  multi?: boolean;
}>) {
  const [query, setQuery] = useDebounce<string>({ initialValue: "" });

  const getContent = useScopedLocale(LOCALE_NS);

  const { data, isLoading } = useSWR<T[]>(
    query ? `${path}${path.includes("?") ? "&" : "?"}query=${query}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { keepPreviousData: true },
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Mirrors `value` locally so selections render immediately even when this
  // component sits inside a popup snapshot (Components/Popup/Popup.tsx) that
  // won't re-receive fresh props from its parent after the popup opens -
  // clicking still calls onChange so the real state upstream stays correct.
  const [innerValue, setInnerValue] = useState<T[]>(value);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const isReallyOpen = useMemo<boolean>(
    () => isOpen && !!query.trim(),
    [isOpen, query],
  );

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

  const selected = useMemo<(MultiSelectOption & { node: T })[]>(
    () => innerValue.map((val) => ({ ...getOption(val), node: val })),
    [getOption, innerValue],
  );

  const options = useMemo<(MultiSelectOption & { node: T })[] | null>(() => {
    if (!data) return null;
    return data.map((el) => ({ ...getOption(el), node: el }));
  }, [data, getOption]);

  return (
    <div
      ref={containerRef}
      className={`${classes.main} ${className}`}
      style={style}
      onClick={() => setIsOpen(true)}
    >
      <div
        className={`${classes.select} ${isReallyOpen ? classes.openSelect : ""}`}
      >
        <div className={classes.content}>
          {selected.map((option) => (
            <span
              className={`${classes.value} ${txsRegular}`}
              key={option.value}
              onClick={() => {
                const newValue = [...innerValue];
                const index = newValue.findIndex(
                  (el) => getOption(el).value === option.value,
                );
                if (index === -1) return;
                newValue.splice(index, 1);
                setInnerValue(newValue);
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
      {isReallyOpen && (
        <div className={classes.dropDown}>
          {isLoading && (
            <div className={classes.loadingTrack}>
              <div className={classes.loadingBar} />
            </div>
          )}
          {!!options ? (
            !!options.length ? (
              options.map((option) => (
                <div
                  className={`${classes.option} ${selected.some((opt) => opt.value === option.value) ? classes.activeOption : ""}`}
                  key={option.value}
                  onClick={() => {
                    if (!multi) {
                      setInnerValue([option.node]);
                      return onChange([option.node]);
                    }
                    const newValue = [...innerValue];
                    const index = newValue.findIndex(
                      (el) => getOption(el).value === option.value,
                    );
                    if (index === -1) {
                      newValue.push(option.node);
                    } else {
                      newValue.splice(index, 1);
                    }
                    setInnerValue(newValue);
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
            )
          ) : (
            <span className={`${classes.loading} ${tsmMedium}`}>
              {getContent("loading")}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectInputServer;
