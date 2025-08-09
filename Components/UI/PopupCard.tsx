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
}: WithStyleProps<{ children: ReactNode }>) => {
  const { closePopup } = usePopup();
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <button
        className={classes.close}
        type="button"
        onClick={() => closePopup()}
      >
        <Ixon width="1.5rem">
          <CloseIcon />
        </Ixon>
      </button>
      <div className={classes.content}>{children}</div>
    </div>
  );
};

export default PopupCard;
