import useLocale from "../Hooks/useLocale";
import Button from "../UI/Button";
import classes from "./AboutIntro.module.css";

import HostedImage from "../UI/HostedImage";
import Ixon from "../UI/Ixon";
import VideoIcon from "../Icons/VideoIcon";
import { t5xlExtraBold, tlgMedium } from "../UI/Typography";

const AboutIntro = ({ aboutMain }: { aboutMain?: string }) => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.content}>
        <h1 className={`${classes.h1} ${t5xlExtraBold}`}>
          <span className={classes.noyan}>{getContent("aboutTitleNoyan")}</span>{" "}
          <span className={classes.ai}>{getContent("aboutTitleAi")}</span>{" "}
          <span className={classes.post}>{getContent("aboutTitlePost")}</span>
        </h1>
        <p className={`${classes.legend} ${tlgMedium}`}>
          {getContent("aboutLegend")}
        </p>
        <div className={classes.actions}>
          <Button
            href="/onboarding"
            variant="Primary"
            mode="Fill"
            size="XL"
            radius="High"
          >
            {getContent("learnMore")}
          </Button>
          <Button
            variant="Primary"
            mode="Outline"
            size="XL"
            radius="High"
            href="/contact"
          >
            {getContent("contactUs")}
          </Button>
        </div>
      </div>
      <div className={classes.image}>
        <HostedImage
          alt={getContent("aboutIntroImageAlt")}
          src={aboutMain}
          fill
          sizes="29rem"
          style={{ objectFit: "cover" }}
        />
        <div className={classes.badge}>
          <div className={classes.icon}>
            <Ixon width="1.5rem">
              <VideoIcon />
            </Ixon>
          </div>
          <div className={classes.badgeContent}>
            <legend className={classes.badgeTitle}>
              {getContent("aboutBadgeTitle")}
            </legend>
            <span className={classes.badgeDescription}>
              {getContent("badgeDescription")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutIntro;
