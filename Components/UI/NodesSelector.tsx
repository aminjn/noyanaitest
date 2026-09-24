import useSWR from "swr";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./NodesSelector.module.css";
import { fetcher } from "../helpers/fetcher";

import dynamic from "next/dynamic";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "uiForm"];

const Select = dynamic(() => import("react-select"), { ssr: false });

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
}>) => {
  const { data } = useSWR(path, (url: string) =>
    fetcher({ url }).then(
      !!dataParser
        ? dataParser
        : (res) =>
            res.data.data.sort(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (a: any, b: any) => (a.order || 0) - (b.order || 0),
            ),
    ),
  );

  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {!!title && <span className={classes.title}>{title}</span>}
      <Select
        isClearable={clearable}
        isDisabled={readOnly}
        isLoading={!data}
        options={data}
        isMulti={multi}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        defaultValue={
          multi
            ? data?.filter((el: unknown) =>
                (defaultValue as unknown[])?.includes(getOptionValue(el)),
              )
            : data?.find((el: unknown) => getOptionValue(el) === defaultValue)
        }
        onChange={(e) => {
          if (!e) {
            if (!clearable) return;
            onChange?.(null);
            return;
          }
          if (multi) {
            if (!Array.isArray(e)) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange?.(e.map((el) => getOptionValue(el)) as any);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange?.(getOptionValue(e) as any);
          }
        }}
        placeholder={getContent("selectPlaceholder")}
        // menuPlacement="top"
      />
    </div>
  );
};

export default NodesSelector;
