import { ReactNode } from "react";
import classes from "./Badge.module.css";
import { WithStyleProps } from "../Layout/Layout";
import Ixon from "./Ixon";
import { t2xsMedium } from "./Typography";

export const badgeColors = [
  "Warning",
  "Info",
  "Success",
  "Error",
  "Primarylight",
  "Primary",
  "Secondary",
  "SecondaryLight",
  "Black",
  "Disabled",
] as const;
export type BadgeColor = (typeof badgeColors)[number];

export const badgeSizes = ["XXL", "XL", "L", "S"] as const;
export type BadgeSize = (typeof badgeSizes)[number];

export const badgeRadiuses = ["High", "Low"] as const;
export type BadgeRadius = (typeof badgeRadiuses)[number];

export const badgeModes = ["Fill", "Outline"] as const;
export type BadgeMode = (typeof badgeModes)[number];

const Badge = ({
  children,
  className = "",
  color = "Primary",
  leadIcon,
  mode = "Fill",
  radius = "High",
  size = "XXL",
  style,
  tailIcon,
}: WithStyleProps<{
  children?: ReactNode;
  leadIcon?: ReactNode;
  tailIcon?: ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  radius?: BadgeRadius;
  mode?: BadgeMode;
}>) => {
  return (
    <div
      className={`${classes.main} ${classes[color]} ${classes[mode]} ${classes[radius]} ${classes[size]} ${className} ${t2xsMedium}`}
      style={style}
    >
      {!!leadIcon && (
        <Ixon className={classes.content} width=".75rem">
          {leadIcon}
        </Ixon>
      )}
      {!!children && <span className={classes.content}>{children}</span>}
      {!!tailIcon && (
        <Ixon className={classes.content} width=".75rem">
          {tailIcon}
        </Ixon>
      )}
    </div>
  );
};

export default Badge;
