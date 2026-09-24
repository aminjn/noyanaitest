import { ReactNode } from "react";
import classes from "./Drawer.module.css";
import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Ixon from "../UI/Ixon";
import XMarkIcon from "../Icons/XMarkIcon";

const NS: ContentNamespace[] = ["common", "booking"];
const Drawer = ({
  close,
  title,
  content,
  fullScreen,
}: {
  content?: (close: () => unknown) => ReactNode;
  title: ContentKey;
  close: () => unknown;
  fullScreen?: boolean;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.container}>
      <div className={classes.backdrop} onClick={() => close()} />
      <div className={`${classes.main} ${fullScreen ? classes.fullScreen : ""}`}>
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
