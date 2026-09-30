import Link from "@/Components/i18n/Link";
import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./HomeHero.module.css";
import HostedImage from "../UI/HostedImage";
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
import Badge from "../UI/Badge";
import StarsLineIcon from "../Icons/StarsLineIcon";
import Button from "../UI/Button";
import BrainIcon from "../Icons/BrainIcon";

const NS: ContentNamespace[] = ["common", "home"];

// Redesigned hero (Figma "Home Page" frame, Aug 2026): a framed AI-branded
// image with two floating stat badges on the right, and on the left a
// badge pill + two-tone headline + AI search bar + two CTAs, followed by a
// row of four quick-link cards. Note: the previous "AI example prompts"
// strip isn't part of the new design and has been dropped — `examples`
// stays a prop for now (data fetching in app/page.tsx is unchanged) but is
// no longer rendered here.
const HomeHero = ({ homeMain }: { homeMain?: string }) => {
  // Reference usage of the scoped hook: this component only needs the
  // "home" namespace, so it declares that directly instead of relying on
  // an ancestor already having fetched everything.
  const getContent = useScopedLocale(NS);

  const quickLinks: {
    key:
      | "homeHeroQuickLinkLab"
      | "homeHeroQuickLinkPharmacy"
      | "aiDetection"
      | "doctors";
    href: string;
    icon: ReactNode;
  }[] = [
    { key: "doctors", href: "/book", icon: <StetoscopeIcon /> },
    { key: "aiDetection", href: "/wizard", icon: <BrainIcon /> },
    { key: "homeHeroQuickLinkPharmacy", href: "/product", icon: <PillIcon /> },
    { key: "homeHeroQuickLinkLab", href: "/paraClinic", icon: <FlaskIcon /> },
  ];

  return (
    <div className={classes.hero}>
      {/* Decorative background. This used to be an inline SVG (HomeHeroBg,
          ~176KB of JSX with 122px feGaussianBlur filters, an 11000px
          foreignObject and mix-blend-mode) that iOS WebKit rendered very
          slowly and re-rasterized on every viewport change. It is now two
          pre-rendered static layers set in HomeHero.module.css (.heroBg). */}
      <div className={classes.heroBg} aria-hidden="true" />
      <div className={classes.top}>
        <div className={classes.content}>
          <Badge leadIcon={<StarsLineIcon />} color="SecondaryLight">
            {getContent("homeHeroBadge")}
          </Badge>
          <div className={classes.textBox}>
            <h1 className={`${classes.title} ${t3xlBold}`}>
              <span className={classes.highlightPrimary}>
                {getContent("homeHeroTitleHighlight1")}
              </span>{" "}
              <span className={classes.highlightSecondary}>
                {getContent("homeHeroTitleHighlight2")}
              </span>{" "}
              <br className={classes.br} />
              <span>{getContent("homeHeroTitle")}</span>
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
            <Button
              href="/wizard"
              variant="Primary"
              mode="Fill"
              radius="High"
              size="S"
              tailIcon={<ArrowLeftIcon />}
            >
              {getContent("chatWithAi")}
            </Button>
            <Button
              href="/book"
              variant="Primary"
              mode="Inline"
              radius="High"
              size="S"
              tailIcon={<ArrowLeftIcon />}
            >
              {getContent("reserveABooking")}
            </Button>
          </div>
        </div>
        <div className={classes.imageCard}>
          <div className={classes.imageTilt} />
          <div className={classes.imageFrame}>
            <div className={classes.image}>
              <HostedImage
                src={homeMain}
                alt="Noyan AI"
                fill
                priority
                sizes="(max-width: 800px) 100vw, 32rem"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div
              className={`${classes.floatBadge} ${classes.floatBadgeBottom}`}
            >
              <div className={classes.floatText}>
                <span className={`${classes.floatLabel} ${t2xsRegular}`}>
                  {getContent("homeHeroLiveVisitLabel")}
                </span>
                <span className={`${classes.floatValue} ${txsDemiBold}`}>
                  {getContent("homeHeroLiveVisitValue")}
                </span>
              </div>
              <span className={`${classes.floatIcon} ${classes.floatIconInfo}`}>
                <Ixon width="1rem">
                  <VideoIcon />
                </Ixon>
              </span>
            </div>
            <div className={`${classes.floatBadge} ${classes.floatBadgeTop}`}>
              <div className={classes.floatText}>
                <span className={`${classes.floatLabel} ${t2xsRegular}`}>
                  {getContent("aiDetection")}
                </span>
                <span className={`${classes.floatValue} ${txsDemiBold}`}>
                  {getContent("homeHeroAiFreeValue")}
                </span>
              </div>
              <span
                className={`${classes.floatIcon} ${classes.floatIconSecondary}`}
              >
                <Ixon width="1rem">
                  <BrainIcon />
                </Ixon>
              </span>
            </div>
          </div>
        </div>
      </div>
      <ul className={classes.quickLinks}>
        {quickLinks.map((link) => (
          <li key={link.key} className={classes.quickLinkWrap}>
            <Link href={link.href} className={classes.quickLink}>
              <span className={classes.quickLinkIcon}>
                <Ixon width="1.5rem">{link.icon}</Ixon>
              </span>
              <span className={`${classes.quickLinkLabel} ${tmdDemiBold}`}>
                {getContent(link.key)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomeHero;
