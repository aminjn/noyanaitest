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
}: WithStyleProps<{
  items: ClientTabSystemItems;
  viewState?: [string, (v: string) => unknown];
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
    <div className={`${classes.main} ${className}`} style={style}>
      <nav className={classes.nav}>
        {items
          .filter((el) => !el.exclude)
          .map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setCurrent(item.id)}
              className={`${classes.navItem} ${
                current === item.id ? classes.activeItem : ""
              }`}
            >
              {!!item.icon && <Ixon width="1.5rem">{item.icon}</Ixon>}
              <span>{item.title}</span>
            </button>
          ))}
      </nav>
      {items.find((item) => item.id === current)?.content}
    </div>
  );
};

export default ClientTabSystem;
