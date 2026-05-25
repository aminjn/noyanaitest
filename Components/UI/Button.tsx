import { Fragment, MouseEventHandler, ReactNode } from "react";
import classes from "./Button.module.css";
import { WithStyleProps } from "../Layout/Layout";
import Ixon from "./Ixon";
import LoadingIcon from "../Icons/LoadingIcon";
import { tbaseMedium, tmdMedium, tsmMedium, txsMedium } from "./Typography";

export const buttonVariants = [
  "Primary",
  "Secondary",
  "Error",
  "Success",
  "Disable",
  "Warning",
  "Info",
  "Neutral",
] as const;

export type ButtonVariant = (typeof buttonVariants)[number];

export const buttonModes = ["Fill", "Outline", "Black", "Inline"] as const;

export type ButtonMode = (typeof buttonModes)[number];

export const buttonSizes = ["XL", "L", "M", "S"] as const;

export type ButtonSize = (typeof buttonSizes)[number];

export const buttonRadiuses = ["Normal", "Medium", "High"] as const;

export type ButtonRadius = (typeof buttonRadiuses)[number];

const buttonTypegraphies: Record<ButtonSize, string> = {
  XL: tmdMedium,
  L: tbaseMedium,
  M: tsmMedium,
  S: txsMedium,
};

const Button = ({
  tailIcon,
  children,
  className = "",
  leadIcon,
  onClick,
  style = {},
  type = "button",
  variant = "Primary",
  mode = "Fill",
  radius = "Normal",
  size = "L",
  iconWidth,
  isLoading,
}: WithStyleProps<{
  children?: ReactNode;
  leadIcon?: ReactNode;
  tailIcon?: ReactNode;
  variant?: ButtonVariant;
  mode?: ButtonMode;
  size?: ButtonSize;
  radius?: ButtonRadius;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isLoading?: boolean;
  iconWidth?: string;
}>) => {
  return (
    <button
      className={`${classes.main} ${classes[variant]} ${classes[mode]} ${classes[size]} ${classes[radius]} ${buttonTypegraphies[size]} ${className}`}
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
          {!!leadIcon && (
            <Ixon width={iconWidth || size === "S" ? "1.25rem" : "1.5rem"}>
              {leadIcon}
            </Ixon>
          )}
          {!!children && <span>{children}</span>}
          {!!tailIcon && (
            <Ixon width={iconWidth || size === "S" ? "1.25rem" : "1.5rem"}>
              {tailIcon}
            </Ixon>
          )}
        </Fragment>
      )}
    </button>
  );
};

export default Button;
