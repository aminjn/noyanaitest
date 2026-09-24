import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./AboutMissions.module.css";
import { ContentKey } from "../Enums/contentKeys";
import TargetIcon from "../Icons/TargetIcon";
import EyeIcon from "../Icons/EyeIcon";
import Ixon from "../UI/Ixon";
import CheckIcon from "../Icons/CheckIcon";
import TitleLegend from "./TitleLegend";
import { tmdBold, tsmRegular } from "../UI/Typography";
import SwiperSlider from "../UI/SwiperSlider";
import { SwiperSlide } from "swiper/react";

const NS: ContentNamespace[] = ["common", "aboutPage"];

const Card = ({
  icon,
  items,
  title,
  alt,
}: {
  icon: ReactNode;
  title: ContentKey;
  items: ContentKey[];
  alt?: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  return (
    <li className={`${classes.card} ${alt ? classes.alt : ""}`}>
      <div className={classes.icon}>
        <Ixon width="2.25rem">{icon}</Ixon>
      </div>
      <h3 className={`${classes.cardTitle} ${tmdBold}`}>{getContent(title)}</h3>
      <ul className={classes.items}>
        {items.map((item) => (
          <li key={item} className={classes.item}>
            <div className={classes.itemIcon}>
              <Ixon width=".875rem">
                <CheckIcon />
              </Ixon>
            </div>
            <p className={`${classes.itemContent} ${tsmRegular}`}>
              {getContent(item)}
            </p>
          </li>
        ))}
      </ul>
    </li>
  );
};

const AboutMissions = () => {
  return (
    <div className={classes.main}>
      <TitleLegend title="ourMissionAndPrespective" />
      <div className={classes.cardsMobile}>
        <SwiperSlider>
          <SwiperSlide>
            <Card
              icon={<TargetIcon />}
              title="ourMission"
              items={["ourMission0", "ourMission1", "ourMission2"]}
            />
          </SwiperSlide>
          <SwiperSlide>
            <Card
              icon={<EyeIcon />}
              title="ourPrespective"
              items={["ourPrespective0", "ourPrespective1", "ourPrespective2"]}
              alt
            />
          </SwiperSlide>
        </SwiperSlider>
      </div>
      <ul className={classes.cards}>
        <Card
          icon={<TargetIcon />}
          title="ourMission"
          items={["ourMission0", "ourMission1", "ourMission2"]}
        />
        <Card
          icon={<EyeIcon />}
          title="ourPrespective"
          items={["ourPrespective0", "ourPrespective1", "ourPrespective2"]}
          alt
        />
      </ul>
    </div>
  );
};

export default AboutMissions;
