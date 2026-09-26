import { Fragment } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./BreadCrump.module.css";
import Link from "@/Components/i18n/Link";
import Ixon from "./Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import { BreadCrumpTrail } from "../Store/BreadCrumpStore";
import { useTime } from "react-timer-hook";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const BreadCrump = ({
  trail,
  className = "",
  style,
}: WithStyleProps<{
  trail: BreadCrumpTrail;
}>) => {
  const getContent = useScopedLocale(LOCALE_NS);

  const { hours, minutes } = useTime();
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <nav className={classes.nav}>
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
      <div className={classes.rest}>
        <span
          className={classes.time}
        >{`${minutes} : ${hours} - ${new Date().toLocaleDateString("fa-IR", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`}</span>
        <span className={classes.online}>
          <span className={classes.flash}></span>
          <span>{getContent("online")}</span>
        </span>
      </div>
    </div>
  );
};

export default BreadCrump;
