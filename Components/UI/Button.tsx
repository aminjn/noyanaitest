import {
  Fragment,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useMemo,
} from "react";
import classes from "./Button.module.css";
import { WithStyleProps } from "../Layout/Layout";
import Ixon from "./Ixon";
import LoadingIcon from "../Icons/LoadingIcon";
import { tbaseMedium, tmdMedium, tsmMedium, txsMedium } from "./Typography";
import Link from "@/Components/i18n/Link";

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
  href,
  ariaLabel,
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
  href?: string;
  // for a button whose text alone doesn't say what it does (e.g. an x chip)
  ariaLabel?: string;
}>) => {
  const content = useMemo(
    () => (
      <Fragment>
        {isLoading ? (
          <Ixon width="1.5rem">
            <LoadingIcon />
          </Ixon>
        ) : (
          <Fragment>
            {!!leadIcon && (
              <Ixon width={iconWidth || (size === "S" ? "1.25rem" : "1.5rem")}>
                {leadIcon}
              </Ixon>
            )}
            {!!children && (
              <span style={{ flex: "1", overflow: "hidden" }}>{children}</span>
            )}
            {!!tailIcon && (
              <Ixon width={iconWidth || (size === "S" ? "1.25rem" : "1.5rem")}>
                {tailIcon}
              </Ixon>
            )}
          </Fragment>
        )}
      </Fragment>
    ),
    [isLoading, leadIcon, size, iconWidth, tailIcon, children],
  );

  const classNames = useMemo(
    () =>
      `${classes.main} ${classes[variant]} ${classes[mode]} ${classes[size]} ${classes[radius]} ${buttonTypegraphies[size]} ${className}`,
    [className, variant, mode, size, radius],
  );

  const styles = useMemo(
    () => ({ ...style, cursor: isLoading ? "progress" : undefined }),
    [style, isLoading],
  );

  if (href)
    return (
      <Link
        className={classNames}
        style={styles}
        href={href}
        aria-label={ariaLabel}
        onClick={(e) => {
          if (isLoading) {
            e.preventDefault();
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick?.(e as any);
        }}
      >
        {content}
      </Link>
    );
  return (
    <button
      aria-label={ariaLabel}
      className={classNames}
      style={styles}
      onClick={(e) => {
        if (isLoading) return;
        onClick?.(e);
      }}
      type={type}
    >
      {content}
    </button>
  );
};

export default Button;
