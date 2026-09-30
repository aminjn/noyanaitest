import { ReactNode } from "react";
import classes from "./PopupCard.module.css";
import { WithStyleProps } from "../Layout/Layout";
import usePopup from "../Hooks/usePopup";
import Ixon from "./Ixon";
import CloseIcon from "../Icons/CloseIcon";

const PopupCard = ({
  children,
  className,
  style,
  icon,
  title,
  size = "normal",
}: WithStyleProps<{
  children?: ReactNode;
  title?: string;
  icon?: ReactNode;
  // "wide" for a long form (tabs, a pricing editor) - room for two columns
  size?: "normal" | "wide";
}>) => {
  const { closePopup } = usePopup();
  return (
    <div
      className={`${classes.main} ${size === "wide" ? classes.wide : ""} ${className || ""}`}
      style={style}
    >
      <div className={classes.header}>
        {!!title && (
          <div className={classes.titleBox}>
            {!!icon && (
              <Ixon className={classes.icon} width="1.5rem">
                {icon}
              </Ixon>
            )}
            <span className={classes.title}>{title}</span>
          </div>
        )}
        <button
          className={classes.close}
          type="button"
          onClick={() => closePopup()}
        >
          <Ixon width=".875rem">
            <CloseIcon />
          </Ixon>
        </button>
      </div>
      <div className={classes.content}>{children}</div>
    </div>
  );
};

export default PopupCard;
