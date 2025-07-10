import { ReactNode } from "react";
import classes from "./InlineLink.module.css";
import { WithStyleProps } from "./Loading";
import Link from "next/link";

const InlineLink = ({
  children,
  href,
  className = "",
  style,
}: WithStyleProps<{
  children: ReactNode;
  href: string;
}>) => {
  return (
    <Link href={href} className={`${classes.main} ${className}`} style={style}>
      {children}
    </Link>
  );
};

export default InlineLink;
