import { ReactNode, useState } from "react";
import classes from "./ClientTabSystem.module.css";
import { WithStyleProps } from "../Layout/Layout";
import Ixon from "./Ixon";

const ClientTabSystem = ({
  items,
  className,
  style,
}: WithStyleProps<{
  items: {
    title: ReactNode;
    id: string;
    content: ReactNode;
    icon?: ReactNode;
  }[];
}>) => {
  const [current, setCurrent] = useState<string>(items[0]?.id || "");

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <nav className={classes.nav}>
        {items.map((item) => (
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
