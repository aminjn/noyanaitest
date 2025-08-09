import { HTMLAttributeAnchorTarget, ReactNode } from "react";
import classes from "./InlineLink.module.css";
import { WithStyleProps } from "./Loading";
import Link from "next/link";

const InlineLink = ({
  children,
  href,
  className = "",
  style,
  target,
}: WithStyleProps<{
  children: ReactNode;
  href: string;
  target?: HTMLAttributeAnchorTarget;
}>) => {
  return (
    <Link
      target={target}
      href={href}
      className={`${classes.main} ${className}`}
      style={style}
    >
      {children}
    </Link>
  );
};

export default InlineLink;
