import useLocale from "../Hooks/useLocale";
import classes from "./OnboardingProfile.module.css";
import { ContentKey } from "../Enums/contentKeys";
import {
  t3xlDemiBold,
  t2xlDemiBold,
  t2xlBold,
  tlgMedium,
  tbaseRegular,
  txlBold,
  tmdMedium,
  tlgDemiBold,
} from "../UI/Typography";
import HostedImage from "../UI/HostedImage";
import useScopedLocale from "../Hooks/useScopedLocale";
import SwiperSlider from "../UI/SwiperSlider";
import { SwiperSlide } from "swiper/react";

type ItemProps = { title: ContentKey; description: ContentKey };

const items: ItemProps[] = [
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

const Item = ({ description, title }: ItemProps) => {
  const getContent = useScopedLocale(["common"]);

  return (
    <li className={classes.item}>
      <h3 className={`${classes.itemTitle} ${tlgDemiBold}`}>
        {getContent(title)}
      </h3>
      <p className={`${classes.itemDescription} ${tbaseRegular}`}>
        {getContent(description)}
      </p>
    </li>
  );
};

const OnboardingProfile = ({
  onboadingProfile,
}: {
  onboadingProfile?: string;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.main} id="Profile">
      <div className={classes.head}>
        <h2 className={`${classes.title} ${txlBold}`}>
          {getContent("onboardingProfileTitle")}
        </h2>
        <span className={`${classes.subtitle} ${tmdMedium}`}>
          {getContent("onboardingProfileSubtitle")}
        </span>
        <p className={`${classes.description} ${tbaseRegular}`}>
          {getContent("onboardingProfileDescription")}
        </p>
      </div>
      <div className={classes.mobileGrid}>
        <SwiperSlider>
          {items.map((item) => (
            <SwiperSlide key={item.title}>
              <Item {...item} />
            </SwiperSlide>
          ))}
        </SwiperSlider>
      </div>
      <ul className={classes.grid}>
        {items.map((item) => (
          <Item key={item.title} {...item} />
        ))}
      </ul>
      <div className={classes.imageBox}>
        <HostedImage
          src={onboadingProfile}
          alt={getContent("onboardingProfileTitle")}
          width={564}
          height={380}
          className={classes.image}
        />
      </div>
    </div>
  );
};

export default OnboardingProfile;
