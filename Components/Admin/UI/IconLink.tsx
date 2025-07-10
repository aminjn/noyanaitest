import classes from "./IconLink.module.css";
import { ReactNode } from "react";
import { IconButtonVariant } from "./IconButton";
import { WithStyleProps } from "./Loading";
import Link from "next/link";
import Ixon from "@/Components/UI/Ixon";

const IconLink = ({
  children,
  className,
  style,
  title,
  href,
  variant = "Info",
}: WithStyleProps<{
  children: ReactNode;
  title?: string;
  href: string;
  variant?: IconButtonVariant;
}>) => {
  return (
    <Link
      href={href}
      className={`${classes.main} ${classes[variant]} ${className || ""}`}
      title={title}
      style={style}
    >
      <Ixon width="1.25rem">{children}</Ixon>
    </Link>
  );
};

export default IconLink;
