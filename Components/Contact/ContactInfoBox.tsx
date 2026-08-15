import { ReactNode } from "react";
import useLocale from "../Hooks/useLocale";
import CallCallingIcon from "../Icons/CallCallingIcon";
import EnvelopeIcon from "../Icons/EnvelopeIcon";
import HelpCircleIcon from "../Icons/HelpCircleIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import classes from "./ContactInfoBox.module.css";
import LinkedinIcon from "../Icons/LinkedinIcon";
import InstagramIcon from "../Icons/InstagramIcon";
import TelegramIcon from "../Icons/TelegramIcon";
import { tbaseMedium, tbaseRegular } from "../UI/Typography";

const SocialItem = ({ href, icon }: { href: string; icon: ReactNode }) => {
  return (
    <a className={classes.social} href={href} target="_blank">
      <Ixon width="1.25rem">{icon}</Ixon>
    </a>
  );
};

const ContactInfoBox = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <h2 className={classes.title}>{getContent("contactInfo")}</h2>
        <Button
          href="/faq"
          leadIcon={<HelpCircleIcon />}
          variant="Primary"
          mode="Outline"
          radius="Medium"
          size="S"
        >
          {getContent("frequentlyAskedQuestions")}
        </Button>
      </div>
      <div className={classes.content}>
        <div className={classes.details}>
          <div className={`${classes.detailsTop} ${tbaseRegular}`}>
            <div className={classes.detail}>
              <Ixon width="1.5rem">
                <CallCallingIcon />
              </Ixon>
              <span>{getContent("phoneValue")}</span>
            </div>
            <div className={classes.detail}>
              <Ixon width="1.5rem">
                <EnvelopeIcon />
              </Ixon>
              <span>{getContent("mailValue")}</span>
            </div>
          </div>
          <p className={tbaseMedium}>{getContent("addressValue")}</p>
        </div>
        <div className={classes.socials}>
          <SocialItem
            href={getContent("LinkedinTarget")}
            icon={<LinkedinIcon />}
          />
          <SocialItem
            href={getContent("instagramValue")}
            icon={<InstagramIcon />}
          />
          <SocialItem
            href={getContent("telegramValue")}
            icon={<TelegramIcon />}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfoBox;
