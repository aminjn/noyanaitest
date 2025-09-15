import { MouseEventHandler, ReactNode } from "react";
import { WithStyleProps } from "../Layout/Layout";
import useLocale from "../Hooks/useLocale";
import classes from "./SelectNoResult.module.css";

const SelectNoResult = ({
  children,
  className = "",
  style,
  onClick,
}: WithStyleProps<{
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>) => {
  const getContent = useLocale();
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <span>{getContent("nothingFound")}</span>
      <button type="button" className={classes.link} onClick={onClick}>
        {children}
      </button>
    </div>
  );
};

export default SelectNoResult;
