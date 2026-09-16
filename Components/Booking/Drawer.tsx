import { ReactNode } from "react";
import classes from "./Drawer.module.css";
import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import Ixon from "../UI/Ixon";
import XMarkIcon from "../Icons/XMarkIcon";
const Drawer = ({
  close,
  title,
  content,
}: {
  content?: (close: () => unknown) => ReactNode;
  title: ContentKey;
  close: () => unknown;
}) => {
  const getContent = useScopedLocale(["booking"]);

  return (
    <div className={classes.container}>
      <div className={classes.backdrop} onClick={() => close()} />
      <div className={classes.main}>
        <div className={classes.header}>
          <span className={classes.title}>{getContent(title)}</span>
          <button
            className={classes.close}
            type="button"
            onClick={() => close()}
          >
            <Ixon width="1rem">
              <XMarkIcon />
            </Ixon>
          </button>
        </div>
        <div className={classes.content}>{content?.(close)}</div>
      </div>
    </div>
  );
};

export default Drawer;
