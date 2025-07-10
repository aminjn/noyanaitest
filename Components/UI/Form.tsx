import { ReactNode } from "react";
import classes from "./Form.module.css";
import { WithStyleProps } from "../Layout/Layout";

const Form = ({
  children,
  onSubmit,
  className,
  style,
}: WithStyleProps<{
  onSubmit?: () => unknown;
  children?: ReactNode;
}>) => {
  return (
    <form
      className={className}
      style={style}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {children}
    </form>
  );
};

export default Form;
