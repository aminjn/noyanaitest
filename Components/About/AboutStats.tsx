import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { WithStyleProps } from "../Layout/Layout";
import { t4xlBold, tmdMedium } from "../UI/Typography";
import classes from "./AboutStats.module.css";
import { SiteStats, useStatFormat } from "../helpers/siteStats";

const NS: ContentNamespace[] = ["common", "aboutPage"];

const Segment = ({
  title,
  value,
  className = "",
  style,
}: WithStyleProps<{
  title: ContentKey;
  value: string;
}>) => {
  const getContent = useScopedLocale(NS);
  // nothing counted yet: say nothing rather than a made-up number
  if (!value) return null;
  return (
    <div className={`${classes.segment} ${className}`} style={style}>
      <span className={`${t4xlBold}`}>{value}</span>
      <legend className={tmdMedium}>{getContent(title)}</legend>
    </div>
  );
};

const MIN_STAT = 50;

// Every number here is counted from the site (getAbout's stats).
const AboutStats = ({ stats }: { stats?: SiteStats }) => {
  const format = useStatFormat();
  // a count says something only from MIN_STAT up ("2 doctors" reads as a
  // joke on an about page), the same rule as the home join band
  const count = (value?: number) =>
    typeof value === "number" && value >= MIN_STAT ? format.count(value) : "";
  if (!stats) return null;
  const consult = count(stats.consultations);
  const percent = format.percent(stats.satisfactionPercent);
  const any = [
    consult,
    percent,
    count(stats.centers),
    count(stats.doctors),
    count(stats.users),
  ].some(Boolean);
  if (!any) return null;
  return (
    <div className={classes.main}>
      <div className={classes.contentBox}>
        <Segment
          value={consult}
          title="aboutConsult"
          className={classes.mobileOnly}
        />
        <div className={classes.content}>
          <Segment
            value={consult}
            title="aboutConsult"
            className={classes.desktopOnly}
          />
          {/* the share of reviews that recommend the doctor, once there are
              enough reviews for it to mean something */}
          <Segment
            value={percent}
            title="usersSatisfaction"
          />
          <Segment value={count(stats.centers)} title="aboutClinicCountTitle" />
          <Segment
            value={count(stats.doctors)}
            title="aboutDoctorsCountTitle"
          />
          <Segment value={count(stats.users)} title="aboutUsersTitle" />
        </div>
      </div>
      <div className={classes.circles}>
        <div className={classes.circleLeft} />
        <div className={classes.circleRight} />
      </div>
    </div>
  );
};

export default AboutStats;
