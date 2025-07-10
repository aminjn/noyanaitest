import useSWR from "swr";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./NodesSelector.module.css";
import { fetcher } from "../helpers/fetcher";

import dynamic from "next/dynamic";

const Select = dynamic(() => import("react-select"), { ssr: false });

const NodesSelector = <TMulti extends boolean>({
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
}: WithStyleProps<{
  title?: string;
  path: string;
  getOptionValue: (node: unknown) => string;
  getOptionLabel: (node: unknown) => string;
  defaultValue?: unknown;
  multi?: TMulti;
  onChange?: (e: TMulti extends true ? string[] : string) => unknown;
  readOnly?: boolean;
}>) => {
  const { data } = useSWR(path, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {!!title && <span className={classes.title}>{title}</span>}
      <Select
        isDisabled={readOnly}
        isLoading={!data}
        options={data}
        isMulti={multi}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        defaultValue={
          multi
            ? data?.filter((el: unknown) =>
                (defaultValue as unknown[])?.includes(getOptionValue(el))
              )
            : data?.find((el: unknown) => getOptionValue(el) === defaultValue)
        }
        onChange={(e) => {
          if (!e) return;
          if (multi) {
            if (!Array.isArray(e)) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange?.(e.map((el) => getOptionValue(el)) as any);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange?.(getOptionValue(e) as any);
          }
        }}
        menuPlacement="top"
      />
    </div>
  );
};

export default NodesSelector;
