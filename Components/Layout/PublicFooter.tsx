import Link from "next/link";
import useLocale from "../Hooks/useLocale";
import Ixon from "../UI/Ixon";
import LogoLong from "../UI/LogoLong";
import classes from "./PublicFooter.module.css";
import { ContentKey } from "../Enums/contentKeys";
import YoutubeIcon from "../Icons/YoutubeIcon";
import TelegramIcon from "../Icons/TelegramIcon";
import InstagramIcon from "../Icons/InstagramIcon";
import LocationIcon from "../Icons/LocationIcon";
import CallingIcon from "../Icons/CallingIcon";
import EnvelopeIcon from "../Icons/EnvelopeIcon";
import CallingIconStroke from "../Icons/CallingIconStroke";

const linkMap: {
  title: ContentKey;
  items: { title: ContentKey; target: string }[];
}[] = [
  {
    title: "links",
    items: [
      { title: "home", target: "/" },
      { title: "forDoctors", target: "/doctorpanel" },
      { title: "aiDetection", target: "/wizard" },
      { title: "blog", target: "/mag" },
      { title: "privacy", target: "/privacy" },
      { title: "policy", target: "/policy" },
    ],
  },
  {
    title: "contactUs",
    items: [
      { title: "support", target: "/support" },
      { title: "aboutUs", target: "/anout" },
      { title: "contactUs", target: "/contact" },
    ],
  },
  {
    title: "lists",
    items: [
      { title: "doctorsList", target: "/doctors" },
      { title: "specialitiesList", target: "/speciality" },
      { title: "symptomsList", target: "/symptom" },
      { title: "diseasesList", target: "/disease" },
      { title: "drugsList", target: "/drug" },
    ],
  },
];

const PublicFooter = () => {
  const getContent = useLocale();

  return (
    <footer className={classes.main}>
      <div className={classes.indent}>
        <div className={classes.logo}>
          <LogoLong inheritColors />
        </div>
        <p>{getContent("footerText")}</p>
      </div>
      <div className={classes.content}>
        <div className={classes.contactCol}>
          <div className={classes.contactItem}>
            <span className={classes.contactIcon}>
              <Ixon width="1.5rem">
                <LocationIcon />
              </Ixon>
            </span>
            <p className={classes.address}>
              <span className={classes.addressTop}>
                {getContent("addressTop")}
              </span>
              <span className={classes.addressBot}>
                {getContent("addressBot")}
              </span>
            </p>
          </div>
          <div className={classes.contactItem}>
            <span className={classes.contactIcon}>
              <Ixon width="1.5rem">
                <CallingIconStroke />
              </Ixon>
            </span>
            <div className={classes.telContent}>
              <span className={classes.telTitle}>{getContent("telTitle")}</span>
              <a
                href={`tel:${getContent("landLineValue")}`}
                className={classes.tel}
              >
                {getContent("landLineLabel")}
              </a>
              <a
                className={classes.tel}
                href={`tel:${getContent("mobileValue")}`}
              >
                {getContent("mobileLabel")}
              </a>
            </div>
          </div>
          <div className={classes.contactItem}>
            <span className={classes.contactIcon}>
              <Ixon width="1.5rem">
                <EnvelopeIcon />
              </Ixon>
            </span>
            <div className={classes.emailContent}>
              <span className={classes.telTitle}>
                {getContent("emailAddress")}
              </span>
              <a
                className={classes.tel}
                href={`mailto:${getContent("mailValue")}`}
              >
                {getContent("mailLabel")}
              </a>
            </div>
          </div>
        </div>
        <ul className={classes.linksCol}>
          {linkMap.map((group) => (
            <li className={classes.linksBox} key={group.title}>
              <span className={classes.linkTitle}>
                {getContent(group.title)}
              </span>
              <ul className={classes.links}>
                {group.items.map((item) => (
                  <li className={classes.link} key={item.title}>
                    <Link className={classes.linkInner} href={item.target}>
                      {getContent(item.title)}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className={classes.certsCol}>
          <ul className={classes.socials}>
            <li className={classes.social}>
              <a
                className={classes.socialLink}
                href={getContent("youtubeValue")}
                target="_blank"
                rel="noreferrer"
              >
                <Ixon width="1.875rem">
                  <YoutubeIcon />
                </Ixon>
              </a>
            </li>
            <li className={classes.social}>
              <a
                className={classes.socialLink}
                href={getContent("telegramValue")}
                target="_blank"
                rel="noreferrer"
              >
                <Ixon width="1.875rem">
                  <TelegramIcon />
                </Ixon>
              </a>
            </li>
            <li className={classes.social}>
              <a
                className={classes.socialLink}
                href={getContent("instagramValue")}
                target="_blank"
                rel="noreferrer"
              >
                <Ixon width="1.875rem">
                  <InstagramIcon />
                </Ixon>
              </a>
            </li>
          </ul>
          <div className={classes.enamad}></div>
        </div>
      </div>
      <p className={classes.note}>{getContent("legalNote")}</p>
    </footer>
  );
};

export default PublicFooter;
