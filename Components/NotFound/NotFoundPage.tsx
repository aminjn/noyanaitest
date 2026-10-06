"use client";
import Button from "../UI/Button";
import HeadphoneIcon from "../Icons/HeadphoneIcon";
import HomeIcon from "../Icons/HomeIcon";
import NotFoundRobotIllustration from "./NotFoundRobotIllustration";
import { t3xlBold, tbaseRegular } from "../UI/Typography";
import classes from "./NotFoundPage.module.css";
import Link from "@/Components/i18n/Link";
import Ixon from "../UI/Ixon";
import { popularLinks } from "../Layout/MegaMenu";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "notFound"];

const NotFoundPage = () => {
  const getContent = useScopedLocale(LOCALE_NS);

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
      {/* somewhere useful to go instead of a dead end */}
      <div className={classes.popular}>
        <span className={classes.popularTitle}>{getContent("megaPopular")}</span>
        <ul className={classes.popularList}>
          {popularLinks.map((link) => (
            <li key={link.title}>
              <Link href={link.target} className={classes.popularLink}>
                <span className={`${classes.popularIcon} tone-${link.tone}`}>
                  <Ixon width="1.125rem">{link.icon}</Ixon>
                </span>
                <span>{getContent(link.title)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotFoundPage;
