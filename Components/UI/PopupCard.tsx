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
}: WithStyleProps<{
  children?: ReactNode;
  title?: string;
  icon?: ReactNode;
}>) => {
  const { closePopup } = usePopup();
  return (
    <div className={`${classes.main} ${className}`} style={style}>
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
