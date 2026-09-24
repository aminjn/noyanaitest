import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./OnboardingConsult.module.css";
import { ContentKey } from "../Enums/contentKeys";
import {
  t3xlDemiBold,
  tlgMedium,
  tlgBold,
  tbaseRegular,
  t2xlBold,
  txlBold,
} from "../UI/Typography";
import Ixon from "../UI/Ixon";
import VideoIcon from "../Icons/VideoIcon";
import MicrophoneIcon from "../Icons/MicrophoneIcon";
import ChatBubbleIcon from "../Icons/ChatBubbleIcon";
import HostedImage from "../UI/HostedImage";
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
    icon: <VideoIcon />,
    title: "onboardingConsultCard0Title",
    description: "onboardingConsultCard0Description",
  },
  {
    icon: <MicrophoneIcon />,
    title: "onboardingConsultCard1Title",
    description: "onboardingConsultCard1Description",
  },
  {
    icon: <ChatBubbleIcon />,
    title: "onboardingConsultCard2Title",
    description: "onboardingConsultCard2Description",
  },
];

const Card = ({ description, icon, title }: CardProps) => {
  const getContent = useScopedLocale(NS);

  return (
    <li className={classes.card}>
      <Ixon width="2.5rem" className={classes.cardIcon}>
        {icon}
      </Ixon>
      <h3 className={`${classes.cardTitle} ${tlgBold}`}>{getContent(title)}</h3>
      <p className={`${classes.cardDescription} ${tbaseRegular}`}>
        {getContent(description)}
      </p>
    </li>
  );
};

type ItemProps = { title: ContentKey; description: ContentKey };

const items: ItemProps[] = [
  {
    title: "onboardingConsultItem0Title",
    description: "onboardingConsultItem0Description",
  },
  {
    title: "onboardingConsultItem1Title",
    description: "onboardingConsultItem1Description",
  },
  {
    title: "onboardingConsultItem2Title",
    description: "onboardingConsultItem2Description",
  },
];

const Item = ({ description, title }: ItemProps) => {
  const getContent = useScopedLocale(NS);

  return (
    <li className={classes.item}>
      <h3 className={`${classes.itemTitle} ${txlBold}`}>{getContent(title)}</h3>
      <p className={`${classes.itemDescription} ${tbaseRegular}`}>
        {getContent(description)}
      </p>
    </li>
  );
};

const OnboardingConsult = ({
  onboadrdinConsult,
}: {
  onboadrdinConsult?: string;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main} id="Consult">
      <div className={classes.head}>
        <h2 className={`${classes.title} ${txlBold}`}>
          {getContent("onboardingConsultTitle")}
        </h2>
        <p className={`${classes.description} ${tbaseRegular}`}>
          {getContent("onboardingConsultDescription")}
        </p>
      </div>
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
      <div className={classes.content}>
        <div className={classes.listMobile}>
          <SwiperSlider>
            {items.map((item) => (
              <SwiperSlide key={item.title}>
                <Item {...item} />
              </SwiperSlide>
            ))}
          </SwiperSlider>
        </div>
        <ul className={classes.list}>
          {items.map((item) => (
            <Item key={item.title} {...item} />
          ))}
        </ul>
        <div className={classes.imageBox}>
          <HostedImage
            src={onboadrdinConsult}
            alt={getContent("onboardingConsultTitle")}
            width={564}
            height={480}
            className={classes.image}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingConsult;
