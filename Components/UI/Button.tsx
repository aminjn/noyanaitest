import { Fragment, MouseEventHandler, ReactNode } from "react";
import classes from "./Button.module.css";
import { WithStyleProps } from "../Layout/Layout";
import Ixon from "./Ixon";
import LoadingIcon from "../Icons/LoadingIcon";

export const buttonVariants = [
  "Primary",
  "Neutral",
  "NeutralStroke",
  "PrimaryStroke",
  "Naked",
  "Black",
  "Danger",
  "Neutral3",
  "Primary3",
  "Secondary3",
] as const;

type ButtonVariant = (typeof buttonVariants)[number];

const Button = ({
  tailIcon,
  children,
  className = "",
  leadIcon,
  onClick,
  style = {},
  type = "button",
  variant = "Primary",
  iconWidth,
  isLoading,
}: WithStyleProps<{
  children?: ReactNode;
  leadIcon?: ReactNode;
  tailIcon?: ReactNode;
  variant?: ButtonVariant;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isLoading?: boolean;
  iconWidth?: string;
}>) => {
  return (
    <button
      className={`${classes.main} ${classes[variant]} ${className}`}
      style={{ ...style, cursor: isLoading ? "progress" : undefined }}
      type={type}
      onClick={(e) => {
        if (isLoading) return;
        onClick?.(e);
      }}
    >
      {isLoading ? (
        <Ixon width="1.5rem">
          <LoadingIcon />
        </Ixon>
      ) : (
        <Fragment>
          {!!leadIcon && <Ixon width={iconWidth || "1rem"}>{leadIcon}</Ixon>}
          {!!children && <span>{children}</span>}
          {!!tailIcon && <Ixon width={iconWidth || "1rem"}>{tailIcon}</Ixon>}
        </Fragment>
      )}
    </button>
  );
};

export default Button;
