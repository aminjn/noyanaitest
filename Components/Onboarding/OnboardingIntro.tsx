import { ReactNode } from "react";
import useLocale from "../Hooks/useLocale";
import Button from "../UI/Button";
import classes from "./OnboardingIntro.module.css";
import { ContentKey } from "../Enums/contentKeys";
import StarsLineIcon from "../Icons/StarsLineIcon";
import FolderIcon from "../Icons/FolderIcon";
import LocationAltIcon from "../Icons/LocationAltIcon";
import UserLineIcon from "../Icons/UserLineIcon";
import MerchantIcon from "../Icons/MerchantIcon";
import Calendar01Icon from "../Icons/Calendar01Icon";
import { t4xlDemiBold, t5xlDemiBold } from "../UI/Typography";
import Ixon from "../UI/Ixon";

const cards: {
  icon: ReactNode;
  title: ContentKey;
  legend?: ContentKey;
  id: string;
}[] = [
  {
    icon: <StarsLineIcon strokeWidth="1" />,
    title: "onboardingIntroItem0Title",
    id: "AI",
  },
  {
    icon: <FolderIcon strokeWidth="1" />,
    title: "onboardingIntroItem1Title",
    id: "Profile",
  },
  {
    icon: <LocationAltIcon />,
    title: "onboardingIntroItem2Title",
    id: "Location",
  },
  {
    icon: <UserLineIcon />,
    title: "onboardingIntroItem3Title",
    legend: "onboardingIntroItem3Legend",
    id: "Panel",
  },
  {
    icon: <MerchantIcon />,
    title: "onboardingIntroItem4Title",
    legend: "onboardingIntroItem4Legend",
    id: "Clinic",
  },
  {
    icon: <Calendar01Icon />,
    title: "onboardingIntroItem5Title",
    legend: "onboardingIntroItem5Legend",
    id: "Consult",
  },
];

const OnboardingIntro = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.intro}>
        <h1 className={`${classes.h1} ${t4xlDemiBold}`}>
          <span>{getContent("onboardingTitlePre")} </span>
          <br />
          <span className={`${classes.noyan} ${t5xlDemiBold}`}>
            {getContent("aboutTitleNoyan")}
          </span>{" "}
          <span className={`${classes.ai} ${t5xlDemiBold}`}>
            {getContent("aboutTitleAi")}
          </span>
        </h1>
        <div className={classes.actions}>
          <Button
            variant="Primary"
            size="M"
            radius="High"
            mode="Fill"
            href="/become"
          >
            {getContent("doctorsAndClinicsRegisteration")}
          </Button>
          <Button
            variant="Primary"
            mode="Outline"
            radius="High"
            size="M"
            href="/doctorpanel"
          >
            {getContent("enterDashboard")}
          </Button>
        </div>
      </div>
      <ul className={classes.list}>
        {cards.map((card) => (
          <li
            key={card.title}
            className={classes.card}
            onClick={() => {
              const node = document.getElementById(card.id);
              if (node) node.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Ixon width="3rem" className={classes.icon}>
              {card.icon}
            </Ixon>
            <span className={classes.cardTitle}>{getContent(card.title)}</span>
            {!!card.legend && (
              <span className={classes.cardLegend}>
                {getContent(card.legend)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OnboardingIntro;
