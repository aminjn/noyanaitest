import useSWR from "swr";
import { useState } from "react";
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
};

type NewOption = { label: string; value: string; __isNew__: true };
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
}>) => {
  const { data, error, mutate } = useSWR(path, (url: string) =>
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
      if (!saved?._id) throw new Error(ta("ایجاد ممکن نشد"));
      const node = { ...saved, [field]: saved[field] ?? label };
      await mutate((prev) => [...(Array.isArray(prev) ? prev : []), node], {
        revalidate: false,
      });
      if (multi)
        emit([...(Array.isArray(value) ? value : []), node]);
      else emit(node);
    } catch (err) {
      setCreateError(
        err instanceof Error && err.message ? err.message : ta("ایجاد ممکن نشد"),
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
  };

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {!!title && <span className={classes.title}>{title}</span>}
      {creatable ? (
        <CreatableSelect
          {...commonProps}
          onCreateOption={create}
          formatCreateLabel={(input: string) =>
            `+ ${ta("ایجاد «${1}»", [input])}`
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
