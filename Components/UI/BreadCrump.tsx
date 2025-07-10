import { Fragment } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./BreadCrump.module.css";
import Link from "next/link";
import Ixon from "./Ixon";
import ChevronIcon from "../Icons/ChevronIcon";

const BreadCrump = ({
  trail,
  className = "",
  style,
}: WithStyleProps<{
  trail: { title: string; target: string }[];
}>) => {
  return (
    <nav className={`${classes.main} ${className}`} style={style}>
      {trail.map((segment, i, arr) => (
        <Fragment key={segment.target}>
          <Link href={segment.target} className={classes.link}>
            {segment.title}
          </Link>
          {arr.length - 1 !== i && (
            <Ixon width="1.125rem" style={{ transform: "rotateZ(90deg)" }}>
              <ChevronIcon />
            </Ixon>
          )}
        </Fragment>
      ))}
    </nav>
  );
};

export default BreadCrump;
