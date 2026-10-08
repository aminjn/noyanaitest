import { MouseEventHandler, ReactNode } from "react";
import classes from "./IconLink.module.css";
import { WithStyleProps } from "./Loading";
import Ixon from "@/Components/UI/Ixon";

const iconButtonVariants = ["Info", "Danger", "Success", "Neutral"] as const;

export type IconButtonVariant = (typeof iconButtonVariants)[number];

const IconButton = ({
  children,
  onClick,
  className,
  style,
  title,
  type,
  variant = "Info",
  disabled,
}: WithStyleProps<{
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  type?: "button" | "submit";
  variant?: IconButtonVariant;
  // an action not possible yet (its title says why)
  disabled?: boolean;
}>) => {
  return (
    <button
      className={`${classes.main} ${classes[variant]} ${className || ""}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      title={title}
      aria-label={title}
      style={style}
    >
      <Ixon width="1.25rem">{children}</Ixon>
    </button>
  );
};
export default IconButton;
