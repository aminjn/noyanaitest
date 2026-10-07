import Link from "@/Components/i18n/Link";
import Ixon from "../UI/Ixon";
import LogoLong from "../UI/LogoLong";
import classes from "./PublicFooter.module.css";
import { ContentKey } from "../Enums/contentKeys";
import YoutubeIcon from "../Icons/YoutubeIcon";
import TelegramIcon from "../Icons/TelegramIcon";
import InstagramIcon from "../Icons/InstagramIcon";
import LocationIcon from "../Icons/LocationIcon";
import EnvelopeIcon from "../Icons/EnvelopeIcon";
import CallingIconStroke from "../Icons/CallingIconStroke";
import useScopedLocale from "../Hooks/useScopedLocale";
import DownloadIcon from "../Icons/DownloadIcon";
import usePwaInstall, { openInstallSheet } from "../Pwa/usePwaInstall";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const linkMap: {
  title: ContentKey;
  items: { title: ContentKey; target: string }[];
}[] = [
  {
    title: "links",
    items: [
      { title: "home", target: "/" },
      { title: "forDoctors", target: "/onboarding" },
      { title: "aiDetection", target: "/wizard" },
      { title: "blog", target: "/mag" },
      { title: "privacy", target: "/privacy" },
      { title: "policy", target: "/policy" },
    ],
  },
  {
    title: "contactUs",
    items: [
      { title: "support", target: "/contact" },
      { title: "aboutUs", target: "/about" },
      { title: "contactUs", target: "/contact" },
    ],
  },
  {
    title: "lists",
    items: [
      { title: "doctorsList", target: "/book" },
      { title: "specialitiesList", target: "/speciality" },
      { title: "symptomsList", target: "/symptom" },
      { title: "diseasesList", target: "/disease" },
      { title: "drugsList", target: "/drug" },
    ],
  },
];

const PublicFooter = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { isStandalone } = usePwaInstall();

  return (
    <footer className={classes.main}>
      <div className={classes.inner}>
        <div className={classes.top}>
          <div className={classes.brand}>
            <Link href="/" className={classes.logo}>
              <LogoLong inheritColors />
            </Link>
            <p className={classes.tagline}>{getContent("footerText")}</p>
            <ul className={classes.socials}>
              {[
                { href: getContent("youtubeValue"), icon: <YoutubeIcon />, label: "YouTube" },
                { href: getContent("telegramValue"), icon: <TelegramIcon />, label: "Telegram" },
                { href: getContent("instagramValue"), icon: <InstagramIcon />, label: "Instagram" },
              ].map((social) => (
                <li key={social.label}>
                  <a
                    className={classes.socialLink}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                  >
                    <Ixon width="1.375rem">{social.icon}</Ixon>
                  </a>
                </li>
              ))}
            </ul>
            {!isStandalone && (
              <button
                type="button"
                className={classes.install}
                onClick={() => openInstallSheet()}
              >
                <Ixon width="1.125rem">
                  <DownloadIcon />
                </Ixon>
                <span>{getContent("installApp")}</span>
              </button>
            )}
          </div>
          <ul className={classes.linksCol}>
            {linkMap.map((group) => (
              <li className={classes.linksBox} key={group.title}>
                <span className={classes.linkTitle}>
                  {getContent(group.title)}
                </span>
                <ul className={classes.links}>
                  {group.items.map((item) => (
                    <li key={item.title}>
                      <Link className={classes.link} href={item.target}>
                        {getContent(item.title)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div className={classes.contacts}>
          <div className={classes.contactItem}>
            <span className={`${classes.contactIcon} glassIcon glassOnBand`}>
              <Ixon width="1.25rem">
                <LocationIcon />
              </Ixon>
            </span>
            <p className={classes.contactText}>
              <span className={classes.contactStrong}>
                {getContent("addressTop")}
              </span>
              <span className={classes.contactSub}>{getContent("addressBot")}</span>
            </p>
          </div>
          <div className={classes.contactItem}>
            <span className={`${classes.contactIcon} glassIcon glassOnBand`}>
              <Ixon width="1.25rem">
                <CallingIconStroke />
              </Ixon>
            </span>
            <p className={classes.contactText}>
              <span className={classes.contactSub}>{getContent("telTitle")}</span>
              <a
                href={`tel:${getContent("landLineValue")}`}
                className={classes.contactStrong}
              >
                {getContent("landLineLabel")}
              </a>
              <a
                className={classes.contactStrong}
                href={`tel:${getContent("mobileValue")}`}
              >
                {getContent("mobileLabel")}
              </a>
            </p>
          </div>
          <div className={classes.contactItem}>
            <span className={`${classes.contactIcon} glassIcon glassOnBand`}>
              <Ixon width="1.25rem">
                <EnvelopeIcon />
              </Ixon>
            </span>
            <p className={classes.contactText}>
              <span className={classes.contactSub}>
                {getContent("emailAddress")}
              </span>
              <a
                className={classes.contactStrong}
                href={`mailto:${getContent("mailValue")}`}
              >
                {getContent("mailLabel")}
              </a>
            </p>
          </div>
        </div>
        <p className={classes.note}>{getContent("legalNote")}</p>
      </div>
    </footer>
  );
};

export default PublicFooter;
