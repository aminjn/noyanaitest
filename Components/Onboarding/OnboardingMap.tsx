import useLocale from "../Hooks/useLocale";
import classes from "./OnboardingMap.module.css";
import {
  t2xlDemiBold,
  tlgMedium,
  t3xlBold,
  tmdRegular,
} from "../UI/Typography";
import Ixon from "../UI/Ixon";
import LocationAltIcon from "../Icons/LocationAltIcon";

const OnboardingMap = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.inner}>
        <div className={classes.head}>
          <h2 className={`${classes.title} ${t2xlDemiBold}`}>
            {getContent("onboardingMapTitle")}
          </h2>
          <p className={`${classes.description} ${tlgMedium}`}>
            {getContent("onboardingMapDescription")}
          </p>
        </div>
        <div className={classes.card}>
          <Ixon width="6.5rem" className={classes.icon}>
            <LocationAltIcon />
          </Ixon>
          <h3 className={`${classes.cardTitle} ${t3xlBold}`}>
            {getContent("onboardingMapCardTitle")}
          </h3>
          <p className={`${classes.cardDescription} ${tmdRegular}`}>
            {getContent("onboardingMapCardDescription")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingMap;
