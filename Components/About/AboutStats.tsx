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

// Every number here is counted from the site (getAbout's stats).
const AboutStats = ({ stats }: { stats?: SiteStats }) => {
  const format = useStatFormat();
  const count = (value?: number) => (value ? format.count(value) : "");
  if (!stats) return null;
  const consult = count(stats.consultations);
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
            value={format.percent(stats.satisfactionPercent)}
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
