import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./OnboardingMap.module.css";
import {
  t2xlDemiBold,
  tlgMedium,
  t3xlBold,
  tmdRegular,
  txlBold,
  tbaseRegular,
} from "../UI/Typography";
import Ixon from "../UI/Ixon";
import LocationAltIcon from "../Icons/LocationAltIcon";

const NS: ContentNamespace[] = ["common", "onboardingPage"];

const OnboardingMap = () => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main} id="Location">
      <div className={classes.inner}>
        <div className={classes.head}>
          <h2 className={`${classes.title} ${txlBold}`}>
            {getContent("onboardingMapTitle")}
          </h2>
          <p className={`${classes.description} ${tbaseRegular}`}>
            {getContent("onboardingMapDescription")}
          </p>
        </div>
        <div className={classes.card}>
          <Ixon width="6.5rem" className={classes.icon}>
            <LocationAltIcon />
          </Ixon>
          <h3 className={`${classes.cardTitle} ${txlBold}`}>
            {getContent("onboardingMapCardTitle")}
          </h3>
          <p className={`${classes.cardDescription} ${tbaseRegular}`}>
            {getContent("onboardingMapCardDescription")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingMap;
