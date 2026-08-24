"use client";
import useLocale from "../Hooks/useLocale";
import Button from "../UI/Button";
import HeadphoneIcon from "../Icons/HeadphoneIcon";
import HomeIcon from "../Icons/HomeIcon";
import NotFoundRobotIllustration from "./NotFoundRobotIllustration";
import { t3xlBold, tbaseRegular } from "../UI/Typography";
import classes from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.illustration}>
        <NotFoundRobotIllustration />
      </div>
      <div className={classes.textGroup}>
        <h1 className={`${classes.title} ${t3xlBold}`}>
          {getContent("pageNotFoundTitle")}
        </h1>
        <p className={`${classes.legend} ${tbaseRegular}`}>
          {getContent("pageNotFoundLegend")}
        </p>
      </div>
      <div className={classes.actions}>
        <Button
          mode="Outline"
          variant="Primary"
          href="/contact"
          tailIcon={<HeadphoneIcon />}
          radius="Medium"
        >
          {getContent("contactSupport")}
        </Button>
        <Button
          radius="Medium"
          mode="Fill"
          variant="Primary"
          href="/"
          tailIcon={<HomeIcon />}
        >
          {getContent("goToHomePage")}
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
