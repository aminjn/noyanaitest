import { ReactNode } from "react";
import useLocale from "../Hooks/useLocale";
import classes from "./OnboardingAi.module.css";
import { ContentKey } from "../Enums/contentKeys";
import StarsLineIcon from "../Icons/StarsLineIcon";
import Ixon from "../UI/Ixon";

const cards: { icon: ReactNode; title: ContentKey; description: ContentKey }[] =
  [
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

const OnboardingAi = () => {
  const getContent = useLocale();
  return (
    <div className={classes.main}>
      <h2 className={classes.title}>{getContent("onboardingAiTitle")}</h2>
      <legend className={classes.legend}>
        {getContent("onboardingAiLegend")}
      </legend>
      <p className={classes.description}>
        {getContent("onboardingAiDescription")}
      </p>
      <ul className={classes.cards}>
        {cards.map((card) => (
          <li key={card.title}>
            <Ixon width="2rem" className={classes.cardIcon}>
              {card.icon}
            </Ixon>
            <h3 className={classes.cardTitle}>{getContent(card.title)}</h3>
            <p className={classes.cardDescription}>
              {getContent(card.description)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnboardingAi;
