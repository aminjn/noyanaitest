import useLocale from "../Hooks/useLocale";
import classes from "./OnboardingDoctor.module.css";
import { ContentKey } from "../Enums/contentKeys";
import {
  t3xlDemiBold,
  tlgMedium,
  t2xlBold,
  tbaseRegular,
  txlBold,
  tlgDemiBold,
} from "../UI/Typography";

const items: { title: ContentKey; description: ContentKey }[] = [
  {
    title: "onboardingDoctorItem0Title",
    description: "onboardingDoctorItem0Description",
  },
  {
    title: "onboardingDoctorItem1Title",
    description: "onboardingDoctorItem1Description",
  },
];

const OnboardingDoctor = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main} id="Panel">
      <div className={classes.head}>
        <h2 className={`${classes.title} ${txlBold}`}>
          {getContent("onboardingDoctorTitle")}
        </h2>
        <p className={`${classes.description} ${tbaseRegular}`}>
          {getContent("onboardingDoctorDescription")}
        </p>
      </div>
      <ul className={classes.grid}>
        {items.map((item) => (
          <li key={item.title} className={classes.item}>
            <h3 className={`${classes.itemTitle} ${tlgDemiBold}`}>
              {getContent(item.title)}
            </h3>
            <p className={`${classes.itemDescription} ${tbaseRegular}`}>
              {getContent(item.description)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnboardingDoctor;
