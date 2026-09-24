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
import useScopedLocale from "../Hooks/useScopedLocale";
import { SwiperSlide } from "swiper/react";
import SwiperSlider from "../UI/SwiperSlider";

type ItemProps = { title: ContentKey; description: ContentKey };

const items: ItemProps[] = [
  {
    title: "onboardingDoctorItem0Title",
    description: "onboardingDoctorItem0Description",
  },
  {
    title: "onboardingDoctorItem1Title",
    description: "onboardingDoctorItem1Description",
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
      <div className={classes.gridMobile}>
        <SwiperSlider>
          {items.map((item) => (
            <SwiperSlide key={item.title}>{<Item {...item} />}</SwiperSlide>
          ))}
        </SwiperSlider>
      </div>
      <ul className={classes.grid}>
        {items.map((item) => (
          <Item key={item.title} {...item} />
        ))}
      </ul>
    </div>
  );
};

export default OnboardingDoctor;
