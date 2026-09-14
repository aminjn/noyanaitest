import Image from "next/image";
import useLocale from "../Hooks/useLocale";
import classes from "./OnboardingClinic.module.css";
import { ContentKey } from "../Enums/contentKeys";
import {
  t3xlDemiBold,
  txlDemiBold,
  txlBold,
  tbaseRegular,
  tlgBold,
} from "../UI/Typography";
import banner from "./onboardingClinic.png";

const items: { title: ContentKey; description: ContentKey }[] = [
  {
    title: "onboardingClinicItem0Title",
    description: "onboardingClinicItem0Description",
  },
  {
    title: "onboardingClinicItem1Title",
    description: "onboardingClinicItem1Description",
  },
];

const OnboardingClinic = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main} id="Clinic">
      <div className={classes.head}>
        <h2 className={`${classes.title} ${txlDemiBold}`}>
          {getContent("onboardingClinicTitle")}
        </h2>
        <p className={`${classes.description} ${tbaseRegular}`}>
          {getContent("onboardingClinicDescription")}
        </p>
      </div>
      <div className={classes.content}>
        <ul className={classes.list}>
          {items.map((item) => (
            <li key={item.title} className={classes.item}>
              <h3 className={`${classes.itemTitle} ${tlgBold}`}>
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
            src={banner}
            alt={getContent("onboardingClinicTitle")}
            width={532}
            height={364}
            unoptimized
            className={classes.image}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingClinic;
