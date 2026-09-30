import { useIntlLocale } from "@/Components/i18n/navigation";
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
import { ta } from "@/Components/Admin/i18n/adminText";

const LOCALE_NS: ContentNamespace[] = ["common"];

const BreadCrump = ({
  trail,
  className = "",
  style,
}: WithStyleProps<{
  trail: BreadCrumpTrail;
}>) => {
  const intlTag = useIntlLocale();
  const getContent = useScopedLocale(LOCALE_NS);

  const { hours, minutes } = useTime();
  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <nav className={classes.nav}>
        {trail.map((segment, i, arr) => (
          <Fragment key={segment.target}>
            <Link href={segment.target} className={classes.link}>
              {typeof segment.title === "string" ? ta(segment.title) : segment.title}
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
        <span className={classes.time}>
          {/* Isolated LTR so hours:minutes reads the same in RTL locales. */}
          <bdi dir="ltr">{`${hours} : ${minutes}`}</bdi>
          {` - ${new Date().toLocaleDateString(intlTag, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}`}
        </span>
        <span className={classes.online}>
          <span className={classes.flash}></span>
          <span>{getContent("online")}</span>
        </span>
      </div>
    </div>
  );
};

export default BreadCrump;
