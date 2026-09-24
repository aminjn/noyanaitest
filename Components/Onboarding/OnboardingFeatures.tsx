import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./OnboardingFeatures.module.css";
import { txlDemiBold, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "onboardingPage"];

const items: { title: ContentKey; description: ContentKey }[] = [
  {
    title: "onboardingFeaturesItem0Title",
    description: "onboardingFeaturesItem0Description",
  },
  {
    title: "onboardingFeaturesItem1Title",
    description: "onboardingFeaturesItem1Description",
  },
  {
    title: "onboardingFeaturesItem2Title",
    description: "onboardingFeaturesItem2Description",
  },
];

const OnboardingFeatures = () => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      <ul className={classes.grid}>
        {items.map((item) => (
          <li key={item.title} className={classes.item}>
            <h3 className={`${classes.itemTitle} ${txlDemiBold}`}>
              {getContent(item.title)}
            </h3>
            <p className={`${classes.itemDescription} ${tsmRegular}`}>
              {getContent(item.description)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnboardingFeatures;
