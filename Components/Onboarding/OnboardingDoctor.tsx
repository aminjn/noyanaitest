import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
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
import { SwiperSlide } from "swiper/react";
import SwiperSlider from "../UI/SwiperSlider";

const NS: ContentNamespace[] = ["common", "onboardingPage"];

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
  const getContent = useScopedLocale(NS);
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
  const getContent = useScopedLocale(NS);

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
