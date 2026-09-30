import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import classes from "./ClientTabSystem.module.css";
import { WithStyleProps } from "../Layout/Layout";
import Ixon from "./Ixon";

export type ClientTabSystemItems = {
  title: ReactNode;
  id: string;
  content: ReactNode;
  icon?: ReactNode;
  exclude?: boolean;
}[];

const ClientTabSystem = ({
  items,
  className,
  style,
  viewState,
  keepMounted,
}: WithStyleProps<{
  items: ClientTabSystemItems;
  viewState?: [string, (v: string) => unknown];
  // keep every tab's content rendered (only the current one shown) - for a
  // form split into tabs, so what was typed in a hidden tab isn't lost
  keepMounted?: boolean;
}>) => {
  const innerState = useState<string>(
    items.filter((el) => !el.exclude)[0]?.id || "",
  );

  const [current, setCurrent] = viewState || innerState;

  useEffect(() => {
    if (!current && items[0])
      setCurrent(items.filter((el) => !el.exclude)[0]?.id || "");
  }, [current, items, setCurrent]);

  return (
    <div className={`${classes.main} ${className}`} style={style} data-tabs>
      <nav className={classes.nav} role="tablist">
        {items
          .filter((el) => !el.exclude)
          .map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={current === item.id}
              key={item.id}
              onClick={() => setCurrent(item.id)}
              className={`${classes.navItem} ${
                current === item.id ? classes.activeItem : ""
              }`}
            >
              {!!item.icon && <Ixon width="1.125rem">{item.icon}</Ixon>}
              <span>{item.title}</span>
            </button>
          ))}
      </nav>
      {keepMounted
        ? items
            .filter((el) => !el.exclude)
            .map((item) => (
              <div
                key={item.id}
                role="tabpanel"
                hidden={item.id !== current}
                className={classes.panel}
              >
                {item.content}
              </div>
            ))
        : items.find((item) => item.id === current)?.content}
    </div>
  );
};

export default ClientTabSystem;
