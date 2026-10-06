import Link from "@/Components/i18n/Link";
import { FormEvent, ReactNode, useState } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import useProgress from "../Hooks/useProgress";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import classes from "./HomeHero.module.css";
import Ixon from "../UI/Ixon";
import SparkIcon from "../Icons/SparkIcon";
import FlaskIcon from "../Icons/FlaskIcon";
import PillIcon from "../Icons/PillIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import Button from "../UI/Button";
import HomeHeroVisual from "./HomeHeroVisual";

const NS: ContentNamespace[] = ["common", "home"];

const chips: ContentKey[] = ["heroChip1", "heroChip2", "heroChip3"];

const tiles: {
  key: ContentKey;
  description: ContentKey;
  href: string;
  icon: ReactNode;
  tone: string;
}[] = [
  { key: "doctors", description: "tileDoctorsDesc", href: "/book", icon: <StetoscopeIcon />, tone: "tone-indigo" },
  { key: "aiDetection", description: "tileAiDesc", href: "/wizard", icon: <SparkIcon />, tone: "tone-violet" },
  { key: "homeHeroQuickLinkPharmacy", description: "tilePharmacyDesc", href: "/product", icon: <PillIcon />, tone: "tone-teal" },
  { key: "homeHeroQuickLinkLab", description: "tileLabDesc", href: "/paraClinic", icon: <FlaskIcon />, tone: "tone-amber" },
];

// Home hero (2026-10 redesign). Like K Health and Ada, the AI assistant's
// input is the centrepiece: what the visitor types opens /wizard with the
// question filled in (/wizard?q=...), for them to review and send. Next to
// it, a composed product mock (HomeHeroVisual, pure CSS) instead of a photo,
// and under it the four services as tiles. The headline is text, so it is
// the LCP element and paints without waiting for any image.
const HomeHero = () => {
  const getContent = useScopedLocale(NS);
  const push = useProgress();
  const [question, setQuestion] = useState<string>("");

  const ask = (text: string) => {
    const q = text.trim();
    push(q ? `/wizard?q=${encodeURIComponent(q)}` : "/wizard");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <section className={classes.hero}>
      <div className={classes.bg} aria-hidden="true" />
      <div className={classes.top}>
        <div className={classes.content}>
          <span className={classes.badge}>
            <Ixon width="0.875rem">
              <SparkIcon />
            </Ixon>
            {getContent("homeHeroBadge")}
          </span>
          <h1 className={classes.title}>
            <span className="gradText">
              {getContent("homeHeroTitleHighlight1")}
            </span>{" "}
            <span>{getContent("homeHeroTitle")}</span>
          </h1>
          <p className={classes.legend}>{getContent("homeHeroLegend")}</p>

          <form className={classes.ask} onSubmit={onSubmit} role="search">
            <label className={classes.askLabel} htmlFor="hero-ask">
              <Ixon width="0.875rem">
                <SparkIcon />
              </Ixon>
              {getContent("heroAiLabel")}
            </label>
            <div className={classes.askBar}>
              <input
                id="hero-ask"
                className={classes.askInput}
                placeholder={getContent("aiInputPlaceholder")}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                autoComplete="off"
                enterKeyHint="send"
              />
              <button type="submit" className={classes.askSend}>
                <span>{getContent("heroAsk")}</span>
                <Ixon width="1.125rem">
                  <ArrowLeftIcon />
                </Ixon>
              </button>
            </div>
            <div className={classes.chips}>
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={classes.chip}
                  onClick={() => ask(getContent(chip))}
                >
                  {getContent(chip)}
                </button>
              ))}
            </div>
            <p className={classes.note}>
              <Ixon width="0.875rem">
                <ShieldCheckIcon />
              </Ixon>
              {getContent("heroAiNote")}
            </p>
          </form>

          <div className={classes.actions}>
            <Button
              href="/book"
              variant="Primary"
              mode="Fill"
              radius="High"
              size="L"
              leadIcon={<Calendar02Icon />}
            >
              {getContent("reserveABooking")}
            </Button>
            <Button
              href="/wizard"
              variant="Secondary"
              mode="Inline"
              radius="High"
              size="L"
              tailIcon={
                <span style={{ display: "flex" }}>
                  <ArrowLeftIcon />
                </span>
              }
              className={classes.secondaryAction}
            >
              {getContent("chatWithAi")}
            </Button>
          </div>
        </div>
        <div className={classes.visual}>
          <HomeHeroVisual />
        </div>
      </div>

      <ul className={classes.tiles}>
        {tiles.map((tile) => (
          <li key={tile.key}>
            <Link href={tile.href} className={classes.tile}>
              <span className={`${classes.tileIcon} ${tile.tone}`}>
                <Ixon width="1.5rem">{tile.icon}</Ixon>
              </span>
              <span className={classes.tileText}>
                <span className={classes.tileTitle}>{getContent(tile.key)}</span>
                <span className={classes.tileDesc}>
                  {getContent(tile.description)}
                </span>
              </span>
              <Ixon width="1.125rem" className={classes.tileArrow}>
                <ArrowLeftIcon />
              </Ixon>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HomeHero;
