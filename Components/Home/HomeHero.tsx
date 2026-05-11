import Link from "next/link";
import useLocale from "../Hooks/useLocale";
import Button from "../UI/Button";
import classes from "./HomeHero.module.css";
import HomeHeroBg from "./HomeHeroBg";
import HomeAiImg from "./HomeAi.png";
import Image from "next/image";
import Ixon from "../UI/Ixon";
import PlusIcon from "../Icons/PlusIcon";
import SendIcon from "../Icons/SendIcon";
import { IAiExample } from "../Admin/AiExample/AdminManageAiExamplesPage";
import FileDuplicateIcon from "../Icons/FileDuplicateIcon";
import {
  t4xlBold,
  tlgRegular,
  tmdMedium,
  tsmRegular,
  txlDemiBold,
  txsRegular,
} from "../UI/Typography";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import SendLineIcon from "../Icons/SendLineIcon";

const HomeHero = ({ examples }: { examples?: IAiExample[] }) => {
  const getContent = useLocale();
  return (
    <div className={classes.hero}>
      <div className={classes.heroBg}>
        <HomeHeroBg />
      </div>
      <div className={classes.content}>
        <div className={classes.intro}>
          <h1 className={`${classes.title} ${t4xlBold}`}>
            {getContent("homeHeroTitle")}
          </h1>
          <p className={`${classes.legend} ${txlDemiBold}`}>
            {getContent("homeHeroLegend")}
          </p>
        </div>
        <div className={classes.actions}>
          <Link
            className={`${classes.action} ${classes.primaryAction} ${tmdMedium}`}
            href={"/ai"}
          >
            <span>{getContent("chatWithAi")}</span>
            <Ixon width="1.5rem">
              <ArrowLeftIcon />
            </Ixon>
          </Link>
          <Link className={`${classes.action} ${tmdMedium}`} href="/book">
            <span>{getContent("reserveABooking")}</span>
            <Ixon width="1.5rem">
              <ArrowLeftIcon />
            </Ixon>
          </Link>
        </div>
        <div className={classes.convoBox}>
          <div className={classes.convoLegend}>
            <span className={classes.aiImage}>
              <Image
                src={HomeAiImg}
                alt="AI"
                fill
                sizes="2rem"
                style={{ objectFit: "contain" }}
              />
            </span>
            <span className={`${classes.aiLegend} ${tlgRegular}`}>
              {getContent("homeChatLegend")}
            </span>
          </div>
          <div className={classes.aiBox}>
            <input
              className={classes.aiInput}
              placeholder={getContent("aiInputPlaceholder")}
            />
            <Ixon width="2.5rem" className={classes.plusIcon}>
              <PlusIcon />
            </Ixon>
            <button className={classes.aiSend}>
              <Ixon width="1.5rem">
                <SendLineIcon />
              </Ixon>
            </button>
          </div>
        </div>
        {!!examples?.length && (
          <div className={classes.examplesBox}>
            <legend className={`${classes.examplesLegend} ${tsmRegular}`}>
              {getContent("homeAiExamplesLegend")}
            </legend>
            <ul className={classes.exampleList}>
              {examples.map((el) => (
                <div key={el._id} className={classes.example}>
                  <p className={`${classes.examplePrompt} ${txsRegular}`}>
                    {el.prompt}
                  </p>
                  <div className={classes.exampleFooter}>
                    <legend
                      className={`${classes.exampleCategory} ${txsRegular}`}
                    >
                      {el.category}
                    </legend>
                    <Link
                      href={`/ai?prompt=${el.prompt}`}
                      className={classes.exampleAction}
                    >
                      <Ixon width="1.5rem">
                        <FileDuplicateIcon />
                      </Ixon>
                    </Link>
                  </div>
                </div>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeHero;
