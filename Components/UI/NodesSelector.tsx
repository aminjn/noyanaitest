import useSWR from "swr";
import { useEffect, useState } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./NodesSelector.module.css";
import { fetcher } from "../helpers/fetcher";

import dynamic from "next/dynamic";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ta } from "../Admin/i18n/adminText";

const LOCALE_NS: ContentNamespace[] = ["common", "uiForm"];

const Select = dynamic(() => import("react-select"), { ssr: false });
const CreatableSelect = dynamic(() => import("react-select/creatable"), {
  ssr: false,
});

// Lets the admin add a missing value (a tag, a category...) right from the
// field instead of leaving the form: the new record is POSTed to `path`
// with `{ [field]: label, isActive: true, ...extra }` and selected.
export type NodesSelectorCreatable = {
  path: string;
  field?: "name" | "title";
  extra?: Record<string, unknown>;
  // outside the admin panel (a provider's own form) the "+ create" row and
  // its error come from the site's texts, not the admin dictionary
  formatLabel?: (input: string) => string;
  errorText?: string;
  // a value that must not become a record (2026-10: a «شبانه‌روزی» tag is
  // the opening hours' switch): the text to show instead of creating it
  refuse?: (input: string) => string | undefined | null | false;
};

// (2026-10) A long list (every doctor's services...) searched on the
// server instead of loaded whole: the typed text goes to `param` (default
// "q") and the current value to `selectedParam` (default "selected"), so
// the list always holds the record already chosen.
export type NodesSelectorSearch = { param?: string; selectedParam?: string };

type NewOption = { label: string; value: string; __isNew__: true };

// Persian and Arabic forms of a name compared as one (ی/ي, ک/ك,
// half-spaces, spaces, case): typing «بوتاكس» finds «بوتاکس» instead of
// offering to create a twin (the server dedupes the same way)
const looseKey = (text: unknown) =>
  String(text ?? "")
    .normalize("NFKC")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u0640\u064b-\u065f\u0670\u200b-\u200f\u2060\ufeff\s]/g, "")
    .toLowerCase();
const isNewOption = (option: unknown): option is NewOption =>
  !!option && typeof option === "object" && "__isNew__" in option;

const NodesSelector = <TMulti extends boolean = false>({
  getOptionLabel,
  getOptionValue,
  path,
  className = "",
  multi,
  style,
  title,
  defaultValue,
  onChange,
  readOnly,
  dataParser,
  clearable,
  creatable,
  search,
}: WithStyleProps<{
  title?: string;
  path: string;
  getOptionValue: (node: unknown) => string;
  getOptionLabel: (node: unknown) => string;
  defaultValue?: unknown;
  multi?: TMulti;
  onChange?: (
    e: TMulti extends true ? string[] | null : string | null,
  ) => unknown;
  readOnly?: boolean;
  dataParser?: (res: unknown) => unknown[];
  clearable?: boolean;
  creatable?: NodesSelectorCreatable;
  search?: NodesSelectorSearch | boolean;
}>) => {
  // the server search: the text typed, debounced
  const [typed, setTyped] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!search) return;
    const t = setTimeout(() => setQuery(typed.trim()), 250);
    return () => clearTimeout(t);
  }, [typed, search]);
  const searchOpts = search && typeof search === "object" ? search : {};
  const selectedNow = Array.isArray(defaultValue) ? defaultValue.join(",") : typeof defaultValue === "string" ? defaultValue : "";
  const url = search
    ? `${path}${path.includes("?") ? "&" : "?"}${new URLSearchParams({
        [searchOpts.param || "q"]: query,
        ...(selectedNow ? { [searchOpts.selectedParam || "selected"]: selectedNow } : {}),
      }).toString()}`
    : path;
  const { data, error, mutate } = useSWR(url, (url: string) =>
    fetcher({ url }).then((res) => {
      const list = dataParser ? dataParser(res) : res?.data?.data;
      if (!Array.isArray(list)) return [];
      return dataParser
        ? list
        : [...list].sort(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (a: any, b: any) => (a?.order || 0) - (b?.order || 0),
          );
    }),
  );

  const getContent = useScopedLocale(LOCALE_NS);

  // undefined until the admin changes the field: the value shown is then
  // the default one, found once the options have loaded
  const [picked, setPicked] = useState<unknown>(undefined);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const options: unknown[] = Array.isArray(data) ? data : [];
  const initialValue = multi
    ? options.filter((el) =>
        Array.isArray(defaultValue)
          ? defaultValue.includes(getOptionValue(el))
          : false,
      )
    : (options.find((el) => getOptionValue(el) === defaultValue) ?? null);
  const value = picked === undefined ? initialValue : picked;

  // the "create" row react-select adds is not a record: read its own label
  const labelOf = (node: unknown) =>
    isNewOption(node) ? node.label : String(getOptionLabel(node) ?? "");
  const valueOf = (node: unknown) =>
    isNewOption(node) ? node.value : String(getOptionValue(node) ?? "");

  const emit = (next: unknown) => {
    setPicked(next);
    if (!next) {
      onChange?.(null);
      return;
    }
    if (multi) {
      if (!Array.isArray(next)) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange?.(next.map((el) => getOptionValue(el)) as any);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange?.(getOptionValue(next) as any);
    }
  };

  const create = async (input: string) => {
    if (!creatable) return;
    const label = input.trim();
    if (!label) return;
    const field = creatable.field || "name";
    const refusal = creatable.refuse?.(label);
    if (refusal) {
      setCreateError(refusal);
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetcher({
        url: creatable.path,
        method: "POST",
        bodyParser: "JSON",
        payload: { [field]: label, isActive: true, ...creatable.extra },
      });
      const saved = res?.data?.data;
      if (!saved?._id) throw new Error(creatable.errorText || ta("ایجاد ممکن نشد"));
      const node = { ...saved, [field]: saved[field] ?? label };
      // the server may answer with a record already listed (the same name
      // written differently): it is selected, not added twice
      const savedId = getOptionValue(node);
      const known = options.find((el) => getOptionValue(el) === savedId);
      if (!known)
        await mutate((prev) => [...(Array.isArray(prev) ? prev : []), node], {
          revalidate: false,
        });
      const picked = known || node;
      if (multi) {
        const current = Array.isArray(value) ? value : [];
        emit(
          current.some((el) => getOptionValue(el) === savedId)
            ? current
            : [...current, picked],
        );
      } else emit(picked);
    } catch (err) {
      setCreateError(
        err instanceof Error && err.message
          ? err.message
          : creatable.errorText || ta("ایجاد ممکن نشد"),
      );
    } finally {
      setCreating(false);
    }
  };

  const commonProps = {
    classNamePrefix: "nsel",
    isClearable: clearable,
    isDisabled: readOnly || creating,
    isLoading: (!data && !error) || creating,
    options,
    isMulti: multi,
    getOptionValue: valueOf,
    getOptionLabel: labelOf,
    value,
    onChange: (e: unknown) => {
      if (!e) {
        if (!clearable) return;
        emit(null);
        return;
      }
      if (multi && !Array.isArray(e)) return;
      emit(e);
    },
    placeholder: getContent("selectPlaceholder"),
    // server search: the server already filtered by the text typed
    ...(search
      ? {
          onInputChange: (v: string) => setTyped(v),
          filterOption: () => true,
          isLoading: !data && !error,
        }
      : {}),
  };

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {!!title && <span className={classes.title}>{title}</span>}
      {creatable ? (
        <CreatableSelect
          {...commonProps}
          onCreateOption={create}
          {...(!search
            ? {
                // the "+ create" row stays even when its label is not the
                // typed text (a refusal hint, creatable.refuse)
                filterOption: (option: { label: string; data: unknown }, input: string) =>
                  !input || isNewOption(option.data) || looseKey(option.label).includes(looseKey(input)),
              }
            : {})}
          isValidNewOption={(input: string) => {
            const key = looseKey(input);
            if (!key) return false;
            const chosen = Array.isArray(value) ? value : value ? [value] : [];
            return ![...options, ...chosen].some((el) => looseKey(labelOf(el)) === key);
          }}
          formatCreateLabel={(input: string) =>
            creatable.refuse?.(input) ||
            (creatable.formatLabel
              ? creatable.formatLabel(input)
              : `+ ${ta("ایجاد «${1}»", [input])}`)
          }
        />
      ) : (
        <Select {...commonProps} />
      )}
      {!!error && (
        <span className={classes.error} role="alert">
          {ta("بارگذاری گزینه‌ها ممکن نشد")}
        </span>
      )}
      {!!createError && (
        <span className={classes.error} role="alert">
          {createError}
        </span>
      )}
    </div>
  );
};

export default NodesSelector;
