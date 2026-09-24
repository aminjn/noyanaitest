import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
import { WithStyleProps } from "../Layout/Layout";
import { t4xlBold, tmdMedium } from "../UI/Typography";
import classes from "./AboutStats.module.css";

const Segment = ({
  title,
  value,
  className = "",
  style,
}: WithStyleProps<{
  title: ContentKey;
  value: ContentKey;
}>) => {
  const getContent = useLocale();

  return (
    <div className={`${classes.segment} ${className}`} style={style}>
      <span className={`${t4xlBold}`}>{getContent(title)}</span>
      <legend className={tmdMedium}>{getContent(value)}</legend>
    </div>
  );
};

const AboutStats = () => {
  return (
    <div className={classes.main}>
      <div className={classes.contentBox}>
        <Segment
          value="aboutConsultValue"
          title="aboutConsult"
          className={classes.mobileOnly}
        />
        <div className={classes.content}>
          <Segment
            value="aboutConsultValue"
            title="aboutConsult"
            className={classes.desktopOnly}
          />
          <Segment value="usersSatisfactionValue" title="usersSatisfaction" />
          <Segment
            value="aboutClinicCountValue"
            title="aboutClinicCountTitle"
          />
          <Segment
            value="aboutSoctorsCountValue"
            title="aboutDoctorsCountTitle"
          />
          <Segment value="aboutUsersValue" title="aboutUsersTitle" />
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
