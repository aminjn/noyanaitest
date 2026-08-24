import Link from "next/link";
import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import classes from "./HomeHero.module.css";
import HomeAiImg from "./HomeAi.png";
import Image from "next/image";
import Ixon from "../UI/Ixon";
import PlusIcon from "../Icons/PlusIcon";
import MicrophoneIcon from "../Icons/MicrophoneIcon";
import AirPodsIcon from "../Icons/AirPodsIcon";
import AiIcon from "../Icons/AiIcon";
import VideoIcon from "../Icons/VideoIcon";
import FlaskIcon from "../Icons/FlaskIcon";
import PillIcon from "../Icons/PillIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import {
  t2xsRegular,
  t3xlBold,
  tmdDemiBold,
  tmdMedium,
  tsmRegular,
  txsDemiBold,
  txsMedium,
} from "../UI/Typography";
import HomeHeroBg from "./HomeHeroBg";

// Redesigned hero (Figma "Home Page" frame, Aug 2026): a framed AI-branded
// image with two floating stat badges on the right, and on the left a
// badge pill + two-tone headline + AI search bar + two CTAs, followed by a
// row of four quick-link cards. Note: the previous "AI example prompts"
// strip isn't part of the new design and has been dropped — `examples`
// stays a prop for now (data fetching in app/page.tsx is unchanged) but is
// no longer rendered here.
const HomeHero = () => {
  // Reference usage of the scoped hook: this component only needs the
  // "home" namespace, so it declares that directly instead of relying on
  // an ancestor already having fetched everything.
  const getContent = useScopedLocale(["home"]);

  const quickLinks: {
    key:
      | "homeHeroQuickLinkLab"
      | "homeHeroQuickLinkPharmacy"
      | "aiDetection"
      | "doctors";
    href: string;
    icon: ReactNode;
  }[] = [
    { key: "doctors", href: "/doctors", icon: <StetoscopeIcon /> },
    { key: "aiDetection", href: "/wizard", icon: <AiIcon /> },
    { key: "homeHeroQuickLinkPharmacy", href: "/product", icon: <PillIcon /> },
    { key: "homeHeroQuickLinkLab", href: "/paraClinic", icon: <FlaskIcon /> },
  ];

  return (
    <div className={classes.hero}>
      <div className={classes.heroBg}>
        <HomeHeroBg />
      </div>
      <div className={classes.top}>
        <div className={classes.content}>
          <span className={`${classes.badge} ${t2xsRegular}`}>
            <Ixon width=".75rem">
              <AiIcon />
            </Ixon>
            {getContent("homeHeroBadge")}
          </span>
          <div className={classes.textBox}>
            <h1 className={`${classes.title} ${t3xlBold}`}>
              <span className={classes.highlightPrimary}>
                {getContent("homeHeroTitleHighlight1")}
              </span>
              <span className={classes.highlightSecondary}>
                {getContent("homeHeroTitleHighlight2")}
              </span>
              {getContent("homeHeroTitle")}
            </h1>
            <p className={`${classes.legend} ${tmdMedium}`}>
              {getContent("homeHeroLegend")}
            </p>
          </div>
          <div className={classes.searchBox}>
            <div className={classes.searchRight}>
              <button type="button" className={classes.searchIconButton}>
                <Ixon width="1.25rem">
                  <PlusIcon />
                </Ixon>
              </button>
              <input
                className={`${classes.searchInput} ${tsmRegular}`}
                placeholder={getContent("aiInputPlaceholder")}
              />
            </div>
            <div className={classes.searchLeft}>
              <button
                type="button"
                className={`${classes.searchIconButton} ${classes.searchIconButtonDark}`}
              >
                <Ixon width="1.25rem">
                  <AirPodsIcon />
                </Ixon>
              </button>
              <button type="button" className={classes.searchIconButton}>
                <Ixon width="1.25rem">
                  <MicrophoneIcon />
                </Ixon>
              </button>
            </div>
          </div>
          <div className={classes.actions}>
            <Link
              className={`${classes.action} ${classes.actionPrimary} ${txsMedium}`}
              href={"/ai"}
            >
              <span>{getContent("chatWithAi")}</span>
              <Ixon width="1.25rem">
                <ArrowLeftIcon />
              </Ixon>
            </Link>
            <Link
              className={`${classes.action} ${classes.actionOutline} ${txsMedium}`}
              href={"/book"}
            >
              <span>{getContent("reserveABooking")}</span>
              <Ixon width="1.25rem">
                <ArrowLeftIcon />
              </Ixon>
            </Link>
          </div>
        </div>
        <div className={classes.imageCard}>
          <div className={classes.imageTilt} />
          <div className={classes.imageFrame}>
            {/* Figma has a brain-scan photo here; this sandbox can't reach
                Figma's asset CDN to pull the real export (see PR notes), so
                this reuses the existing AI mascot image as a stand-in —
                swap in the real photo export when available. */}
            <div className={classes.image}>
              <Image
                src={HomeAiImg}
                alt="Noyan AI"
                fill
                sizes="32rem"
                style={{ objectFit: "contain" }}
              />
            </div>
            <div
              className={`${classes.floatBadge} ${classes.floatBadgeBottom}`}
            >
              <span className={`${classes.floatIcon} ${classes.floatIconInfo}`}>
                <Ixon width="1rem">
                  <VideoIcon />
                </Ixon>
              </span>
              <div className={classes.floatText}>
                <span className={`${classes.floatLabel} ${t2xsRegular}`}>
                  {getContent("homeHeroLiveVisitLabel")}
                </span>
                <span className={`${classes.floatValue} ${txsDemiBold}`}>
                  {getContent("homeHeroLiveVisitValue")}
                </span>
              </div>
            </div>
            <div className={`${classes.floatBadge} ${classes.floatBadgeTop}`}>
              <span
                className={`${classes.floatIcon} ${classes.floatIconSecondary}`}
              >
                <Ixon width="1rem">
                  <AiIcon />
                </Ixon>
              </span>
              <div className={classes.floatText}>
                <span className={`${classes.floatLabel} ${t2xsRegular}`}>
                  {getContent("aiDetection")}
                </span>
                <span className={`${classes.floatValue} ${txsDemiBold}`}>
                  {getContent("homeHeroAiAccuracyValue")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul className={classes.quickLinks}>
        {quickLinks.map((link) => (
          <li key={link.key}>
            <Link href={link.href} className={classes.quickLink}>
              <span className={`${classes.quickLinkLabel} ${tmdDemiBold}`}>
                {getContent(link.key)}
              </span>
              <span className={classes.quickLinkIcon}>
                <Ixon width="1.5rem">{link.icon}</Ixon>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomeHero;
