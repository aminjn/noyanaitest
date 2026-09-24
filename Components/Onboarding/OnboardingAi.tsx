import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./OnboardingAi.module.css";
import { ContentKey } from "../Enums/contentKeys";
import StarsLineIcon from "../Icons/StarsLineIcon";
import Ixon from "../UI/Ixon";
import {
  t2xlDemiBold,
  t3xlDemiBold,
  tbaseMedium,
  tbaseRegular,
  tlgBold,
  tlgMedium,
  tmdMedium,
  txlBold,
} from "../UI/Typography";
import SwiperSlider from "../UI/SwiperSlider";
import { SwiperSlide } from "swiper/react";

const NS: ContentNamespace[] = ["common", "onboardingPage"];

type CardProps = {
  icon: ReactNode;
  title: ContentKey;
  description: ContentKey;
};

const cards: CardProps[] = [
  {
    icon: <StarsLineIcon />,
    title: "onbordingAiCard0Title",
    description: "onbordingAiCard0Description",
  },
  {
    icon: <StarsLineIcon />,
    title: "onbordingAiCard1Title",
    description: "onbordingAiCard1Description",
  },
  {
    icon: <StarsLineIcon />,
    title: "onbordingAiCard2Title",
    description: "onbordingAiCard2Description",
  },
];

const Card = ({ description, icon, title }: CardProps) => {
  const getContent = useScopedLocale(NS);

  return (
    <li key={title} className={classes.card}>
      <Ixon width="2rem" className={classes.cardIcon}>
        {icon}
      </Ixon>
      <h3 className={`${classes.cardTitle} ${tlgBold}`}>{getContent(title)}</h3>
      <p className={`${classes.cardDescription} ${tbaseRegular}`}>
        {getContent(description)}
      </p>
    </li>
  );
};

const OnboardingAi = () => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.main} id="AI">
      <h2 className={`${classes.title} ${txlBold}`}>
        {getContent("onboardingAiTitle")}
      </h2>
      <legend className={`${classes.legend} ${tmdMedium}`}>
        {getContent("onboardingAiLegend")}
      </legend>
      <p className={`${classes.description} ${tbaseMedium}`}>
        {getContent("onboardingAiDescription")}
      </p>
      <div className={classes.cardsMobile}>
        <SwiperSlider>
          {cards.map((card) => (
            <SwiperSlide key={card.title}>
              <Card {...card} />
            </SwiperSlide>
          ))}
        </SwiperSlider>
      </div>
      <ul className={classes.cards}>
        {cards.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </ul>
    </div>
  );
};

export default OnboardingAi;
