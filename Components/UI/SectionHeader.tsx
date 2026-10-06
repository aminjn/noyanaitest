import { ReactNode } from "react";
import Link from "@/Components/i18n/Link";
import classes from "./SectionHeader.module.css";
import Ixon from "./Ixon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";

// One heading style for public-site sections: an optional eyebrow (icon +
// short label), the title, an optional line under it, and an optional
// "see all" link at the inline end. Use it instead of a per-section
// header with its own sizes.
const SectionHeader = ({
  title,
  eyebrow,
  eyebrowIcon,
  description,
  action,
  as: Tag = "h2",
  className = "",
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  eyebrowIcon?: ReactNode;
  description?: ReactNode;
  action?: { href: string; label: ReactNode };
  as?: "h1" | "h2" | "h3";
  className?: string;
}) => (
  <div className={`${classes.main} ${className}`}>
    <div className={classes.text}>
      {!!eyebrow && (
        <span className={classes.eyebrow}>
          {!!eyebrowIcon && <Ixon width="0.875rem">{eyebrowIcon}</Ixon>}
          {eyebrow}
        </span>
      )}
      <Tag className={classes.title}>{title}</Tag>
      {!!description && <p className={classes.description}>{description}</p>}
    </div>
    {!!action && (
      <Link href={action.href} className={classes.action}>
        <span>{action.label}</span>
        <Ixon width="1rem">
          <ArrowLeftIcon />
        </Ixon>
      </Link>
    )}
  </div>
);

export default SectionHeader;
