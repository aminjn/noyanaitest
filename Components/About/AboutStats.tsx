import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
import { t4xlBold, tmdMedium } from "../UI/Typography";
import classes from "./AboutStats.module.css";

const Segment = ({
  title,
  value,
}: {
  title: ContentKey;
  value: ContentKey;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.segment}>
      <span className={`${t4xlBold}`}>{getContent(title)}</span>
      <legend className={tmdMedium}>{getContent(value)}</legend>
    </div>
  );
};

const AboutStats = () => {
  return (
    <div className={classes.main}>
      <div className={classes.content}>
        <Segment value="aboutConsultValue" title="aboutConsult" />
        <Segment value="usersSatisfactionValue" title="usersSatisfaction" />
        <Segment value="aboutClinicCountValue" title="aboutClinicCountTitle" />
        <Segment
          value="aboutSoctorsCountValue"
          title="aboutDoctorsCountTitle"
        />
        <Segment value="aboutUsersValue" title="aboutUsersTitle" />
      </div>
      <div className={classes.circles}>
        <div className={classes.circleLeft} />
        <div className={classes.circleRight} />
      </div>
    </div>
  );
};

export default AboutStats;
