import { Fragment, ReactNode, useState } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./SearchServer.module.css";
import { fetcher, FetchMethod } from "../helpers/fetcher";
import useSWR from "swr";
import Input from "./Input";
import { MongoDoc } from "../Hooks/useUser";
import Ixon from "./Ixon";
import CloseIcon from "../Icons/CloseIcon";
import useLocale from "../Hooks/useLocale";
import LoadingIcon from "../Icons/LoadingIcon";

const MINIMUM_QUERY_LENGTH = 3;

const SearchServer = <T extends MongoDoc>({
  method,
  path,
  title,
  noResult,
  getLabel,
  onChange,
  className,
  style,
  readOnly,
  defaultValue,
}: WithStyleProps<{
  title: string;
  method: FetchMethod;
  path: string;
  getLabel: (node: T) => ReactNode;
  noResult: ReactNode;
  onChange: (node: T | null) => unknown;
  readOnly?: boolean;
  defaultValue?: T;
}>) => {
  const [query, setQuery] = useState<string>("");
  const { data, isLoading } = useSWR<T[]>(
    query.length >= MINIMUM_QUERY_LENGTH ? { path, method, query } : null,
    ({
      path,
      method,
      query,
    }: {
      path: string;
      method: FetchMethod;
      query: string;
    }) =>
      fetcher({ url: path, method, payload: { query } }).then(
        (res) => res.data
      ),
    { keepPreviousData: true }
  );

  const [selected, setSeleted] = useState<T | null>(defaultValue || null);

  const getContent = useLocale();

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {!!selected ? (
        <div className={classes.selected}>
          <div>{getLabel(selected)}</div>
          <button
            onClick={() => {
              if (readOnly) return;
              setSeleted(null);
              onChange(null);
            }}
            className={classes.clear}
          >
            <Ixon width="1.5rem">
              <CloseIcon />
            </Ixon>
          </button>
        </div>
      ) : (
        <Fragment>
          <Input
            className={classes.input}
            title={title}
            onChange={(e) => setQuery(e.target.value.trim())}
            readOnly={readOnly}
          />
          <div
            className={`${classes.results} ${
              !!data || isLoading ? classes.open : ""
            }`}
          >
            {isLoading && (
              <span className={classes.loading}>
                <Ixon width="1.5rem" className={classes.spinner}>
                  <LoadingIcon />
                </Ixon>
                <span>{getContent("loading")}</span>
              </span>
            )}
            {data && (
              <Fragment>
                {data.length
                  ? data.map((node) => (
                      <button
                        key={node._id}
                        onClick={() => {
                          if (readOnly) return;
                          setSeleted(node);
                          onChange(node);
                        }}
                        type="button"
                      >
                        {getLabel(node)}
                      </button>
                    ))
                  : noResult}
              </Fragment>
            )}
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default SearchServer;
