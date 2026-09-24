import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classes from "./FancySelect.module.css";
import Ixon from "./Ixon";
import { t2xsMedium, txsMedium } from "./Typography";
import SearchIcon from "../Icons/SearchIcon";
import InlineLoading from "./InlineLoading";
import ChevronIcon from "../Icons/ChevronIcon";
import XMarkIcon from "../Icons/XMarkIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "uiForm"];

type Options = { title: string; value: string }[];

const findRanges = (text: string, terms: string[]) => {
  const lower = text.toLowerCase();
  const ranges: { start: number; end: number }[] = [];
  for (const term of terms) {
    if (!term) continue;
    const t = term.toLowerCase();
    let index = 0;
    while ((index = lower.indexOf(t, index)) !== -1) {
      ranges.push({ start: index, end: index + t.length });
      index++;
    }
  }
  return ranges;
};

const mergeRanges = (ranges: { start: number; end: number }[]) => {
  if (ranges.length === 0) return [];
  ranges.sort((a, b) => a.start - b.start);
  const merged = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    const curr = ranges[i];
    if (curr.start <= last.end) {
      last.end = Math.max(last.end, curr.end);
    } else {
      merged.push(curr);
    }
  }
  return merged;
};

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  if (!query) return text;
  const terms = query.toLowerCase().split(/\s+/);
  const ranges = mergeRanges(findRanges(text, terms));
  const result = [];
  let lastIndex = 0;
  ranges.forEach((r, i) => {
    if (r.start > lastIndex) {
      result.push(<span key={`t-${i}`}>{text.slice(lastIndex, r.start)}</span>);
    }
    result.push(
      <span key={`h-${i}`} className={classes.query}>
        {text.slice(r.start, r.end)}
      </span>,
    );
    lastIndex = r.end;
  });
  if (lastIndex < text.length) {
    result.push(<span key={"tail"}>{text.slice(lastIndex)}</span>);
  }
  return <>{result}</>;
};

const FancySelect = ({
  options,
  onInputChange,
  placeholder,
  title,
  onChange,
  isLoading,
  defaultValue,
}: {
  options?: Options;
  onChange?: (e: string | null) => unknown;
  title: string;
  placeholder: string;
  onInputChange?: (s: string) => unknown;
  isLoading?: boolean;
  defaultValue?: string;
}) => {
  const [query, setQuery] = useState<string>(defaultValue || "");

  const [isFocuesd, setIsFocused] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFocuesd) return;
    const listener = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("click", listener, false);
    return () => document.removeEventListener("click", listener, false);
  }, [isFocuesd]);

  const filteredOptions = useMemo<Options>(() => {
    if (!options) return [];
    if (!query) return options;
    const segments = query.toLowerCase().trim().split(/\s+/);
    return options.filter(
      (option) => mergeRanges(findRanges(option.title, segments)).length > 0,
    );
  }, [query, options]);

  const getContent = useScopedLocale(LOCALE_NS);

  const showLoading = useMemo<boolean>(() => {
    if (isLoading === false) return false;
    if (isLoading) return true;
    if (!options) return true;
    return false;
  }, [isLoading, options]);

  const noResult = useMemo<boolean>(() => {
    if (!options || !query || isLoading) return false;
    return !filteredOptions.length;
  }, [filteredOptions.length, isLoading, options, query]);

  const onClear = useCallback(() => {
    onChange?.(null);
    setQuery("");
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange]);

  const isOptionsOpen = useMemo<boolean>(
    () => isFocuesd && !!filteredOptions.length,
    [isFocuesd, filteredOptions.length],
  );

  return (
    <div
      ref={rootRef}
      className={classes.main}
      onClick={() => {
        setIsFocused(true);
      }}
    >
      <span className={`${classes.title} ${txsMedium}`}>{title}</span>
      <Ixon className={classes.icon} width="1.125rem">
        <SearchIcon />
      </Ixon>
      <input
        ref={inputRef}
        placeholder={placeholder}
        className={`${classes.input} ${t2xsMedium}`}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange?.(null);
          onInputChange?.(e.target.value);
        }}
        defaultValue={defaultValue}
      />
      <Ixon
        style={{
          transform: `translateY(-50%) rotateZ(${isOptionsOpen ? 180 : 0}deg)`,
        }}
        className={classes.chevron}
        width="1.125rem"
      >
        <ChevronIcon />
      </Ixon>
      {!!query && (
        <button type="button" onClick={onClear}>
          <Ixon width="1.125rem" className={classes.clear}>
            <XMarkIcon />
          </Ixon>
        </button>
      )}
      {isOptionsOpen && (
        <div className={classes.options}>
          {filteredOptions.map((option) => (
            <button
              className={`${classes.option} ${txsMedium}`}
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                e.nativeEvent.stopPropagation();
                e.preventDefault();
                setIsFocused(false);
                onChange?.(option.value);
                setQuery(option.title);
                if (inputRef.current) inputRef.current.value = option.title;
                onInputChange?.(option.title);
              }}
            >
              {!!query ? (
                <HighlightedText text={option.title} query={query} />
              ) : (
                option.title
              )}
            </button>
          ))}
        </div>
      )}
      {showLoading && <InlineLoading className={classes.loading} />}
      {noResult && (
        <span className={classes.nothing}>{getContent("noResultFound")}</span>
      )}
    </div>
  );
};

export default FancySelect;
