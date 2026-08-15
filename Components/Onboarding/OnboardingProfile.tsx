import Image from "next/image";
import useLocale from "../Hooks/useLocale";
import classes from "./OnboardingProfile.module.css";
import { ContentKey } from "../Enums/contentKeys";
import {
  t3xlDemiBold,
  t2xlDemiBold,
  t2xlBold,
  tlgMedium,
  tbaseRegular,
} from "../UI/Typography";

const items: { title: ContentKey; description: ContentKey }[] = [
  {
    title: "onboardingProfileItem0Title",
    description: "onboardingProfileItem0Description",
  },
  {
    title: "onboardingProfileItem1Title",
    description: "onboardingProfileItem1Description",
  },
  {
    title: "onboardingProfileItem2Title",
    description: "onboardingProfileItem2Description",
  },
  {
    title: "onboardingProfileItem3Title",
    description: "onboardingProfileItem3Description",
  },
];

const OnboardingProfile = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <h2 className={`${classes.title} ${t3xlDemiBold}`}>
          {getContent("onboardingProfileTitle")}
        </h2>
        <span className={`${classes.subtitle} ${t2xlDemiBold}`}>
          {getContent("onboardingProfileSubtitle")}
        </span>
        <p className={`${classes.description} ${tlgMedium}`}>
          {getContent("onboardingProfileDescription")}
        </p>
      </div>
      <ul className={classes.grid}>
        {items.map((item) => (
          <li key={item.title} className={classes.item}>
            <h3 className={`${classes.itemTitle} ${t2xlBold}`}>
              {getContent(item.title)}
            </h3>
            <p className={`${classes.itemDescription} ${tbaseRegular}`}>
              {getContent(item.description)}
            </p>
          </li>
        ))}
      </ul>
      <div className={classes.imageBox}>
        <Image
          src="https://www.figma.com/api/mcp/asset/0190e096-05f8-4beb-a748-3ef5c0472001.png"
          alt={getContent("onboardingProfileTitle")}
          width={564}
          height={380}
          unoptimized
          className={classes.image}
        />
      </div>
    </div>
  );
};

export default OnboardingProfile;
