import { ReactNode } from "react";
import useLocale from "../Hooks/useLocale";
import classes from "./AboutPrivacy.module.css";
import { ContentKey } from "../Enums/contentKeys";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import LockIcon from "../Icons/LockIcon";
import LinkIcon from "../Icons/LinkIcon";
import BadgeCheckIcon from "../Icons/BadgeCheckIcon";
import Ixon from "../UI/Ixon";
import Image from "next/image";
import img from "./aboutPrivacy.png";
import { t4xlBold, tmdBold, tsmRegular } from "../UI/Typography";

const items: { icon: ReactNode; title: ContentKey; description: ContentKey }[] =
  [
    {
      icon: <ShieldCheckIcon />,
      title: "aboutprivacyItem0Title",
      description: "aboutprivacyItem0Description",
    },
    {
      icon: <LockIcon />,
      title: "aboutprivacyItem1Title",
      description: "aboutprivacyItem1Description",
    },
    {
      icon: <LinkIcon />,
      title: "aboutprivacyItem2Title",
      description: "aboutprivacyItem2Description",
    },
    {
      icon: <BadgeCheckIcon />,
      title: "aboutprivacyItem3Title",
      description: "aboutprivacyItem3Description",
    },
  ];

const AboutPrivacy = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.content}>
        <h2 className={`${classes.title} ${t4xlBold}`}>
          {getContent("aboutPrivacyTitle")}
        </h2>
        <p className={classes.description}>
          {getContent("aboutPrivacyDescription")}
        </p>
        <div className={classes.items}>
          {items.map((item) => (
            <div key={item.title} className={classes.item}>
              <div className={classes.itemIcon}>
                <Ixon width="1.5rem">{item.icon}</Ixon>
              </div>
              <div className={classes.itemContent}>
                <h3 className={`${classes.itemTitle} ${tmdBold}`}>
                  {getContent(item.title)}
                </h3>
                <p className={`${classes.itemDescription} ${tsmRegular}`}>
                  {getContent(item.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={classes.image}>
        <Image
          src={img}
          alt={getContent("aboutPrivacyImageAlt")}
          fill
          sizes="25rem"
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
};

export default AboutPrivacy;
