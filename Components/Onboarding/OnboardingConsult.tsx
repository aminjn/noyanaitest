import { ReactNode } from "react";
import useLocale from "../Hooks/useLocale";
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

const cards: { icon: ReactNode; title: ContentKey; description: ContentKey }[] =
  [
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

const items: { title: ContentKey; description: ContentKey }[] = [
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

const OnboardingConsult = ({
  onboadrdinConsult,
}: {
  onboadrdinConsult?: string;
}) => {
  const getContent = useLocale();

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
      <ul className={classes.cards}>
        {cards.map((card) => (
          <li key={card.title} className={classes.card}>
            <Ixon width="2.5rem" className={classes.cardIcon}>
              {card.icon}
            </Ixon>
            <h3 className={`${classes.cardTitle} ${tlgBold}`}>
              {getContent(card.title)}
            </h3>
            <p className={`${classes.cardDescription} ${tbaseRegular}`}>
              {getContent(card.description)}
            </p>
          </li>
        ))}
      </ul>
      <div className={classes.content}>
        <ul className={classes.list}>
          {items.map((item) => (
            <li key={item.title} className={classes.item}>
              <h3 className={`${classes.itemTitle} ${txlBold}`}>
                {getContent(item.title)}
              </h3>
              <p className={`${classes.itemDescription} ${tbaseRegular}`}>
                {getContent(item.description)}
              </p>
            </li>
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
