import { MouseEventHandler, ReactNode } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./SelectNoResult.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "uiForm"];

const SelectNoResult = ({
  children,
  className = "",
  style,
  onClick,
}: WithStyleProps<{
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}>) => {
  const getContent = useScopedLocale(LOCALE_NS);
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
