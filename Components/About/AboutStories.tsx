import { ReactNode } from "react";
import useLocale from "../Hooks/useLocale";
import classes from "./AboutStories.module.css";
import { ContentKey } from "../Enums/contentKeys";
import PuzzleIcon from "../Icons/PuzzleIcon";
import LightBulbIcon from "../Icons/LightBulbIcon";
import RocketIcon from "../Icons/RocketIcon";
import Ixon from "../UI/Ixon";
import TitleLegend from "./TitleLegend";
import { tlgBold, tsmBold, tsmRegular } from "../UI/Typography";

const stories: {
  icon: ReactNode;
  title: ContentKey;
  description: ContentKey;
}[] = [
  {
    icon: <PuzzleIcon />,
    title: "aboutStory0Title",
    description: "aboutStory0Description",
  },
  {
    icon: <LightBulbIcon />,
    title: "aboutStory1Title",
    description: "aboutStory1Description",
  },
  {
    icon: <RocketIcon />,
    title: "aboutStory2Title",
    description: "aboutStory2Description",
  },
];

const AboutStories = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <TitleLegend title="ourStory" />
      <ul className={classes.list}>
        {stories.map((story, i) => (
          <li key={story.title} className={classes.item}>
            <div className={classes.icon}>
              <Ixon width="2.5rem">{story.icon}</Ixon>
            </div>
            <span className={`${classes.index} ${tsmBold}`}>{i + 1}</span>
            <h3 className={`${classes.storyTitle} ${tlgBold}`}>
              {getContent(story.title)}
            </h3>
            <p className={`${classes.storyDescription} ${tsmRegular}`}>
              {getContent(story.description)}
            </p>
          </li>
        ))}
      </ul>
      <p className={`${classes.description} ${tsmBold}`}>
        {getContent("aboutStoriesDescription")}
      </p>
    </div>
  );
};

export default AboutStories;
