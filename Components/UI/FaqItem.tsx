import { useId, useState } from "react";
import classes from "./FaqItem.module.css";
import Ixon from "./Ixon";
import HelpCircleIcon from "../Icons/HelpCircleIcon";
import ChevronIcon from "../Icons/ChevronIcon";
import Link from "../i18n/Link";
import { FaqLink } from "../Seo/autoFaq";

// One question of a FAQ block (the doctor / centre pages' accordion). The
// whole question row is the button (aria-expanded / aria-controls); the
// answer stays in the page while closed - the FAQPage structured data
// repeats exactly this text, and search engines read accordion content.
const FaqItem = ({
  node,
}: {
  node: { question: string; answer: string; link?: FaqLink };
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const id = useId();
  const href = node.link?.href;

  return (
    <div className={classes.main}>
      <h3 className={classes.heading}>
        <button
          type="button"
          className={classes.question}
          aria-expanded={isOpen}
          aria-controls={`${id}-answer`}
          id={`${id}-question`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Ixon width="1.5rem">
            <HelpCircleIcon />
          </Ixon>
          <span className={classes.questionText}>{node.question}</span>
          <Ixon
            width="1.5rem"
            className={`${classes.chevron} ${isOpen ? classes.chevronOpen : ""}`}
          >
            <ChevronIcon />
          </Ixon>
        </button>
      </h3>
      <div
        id={`${id}-answer`}
        role="region"
        aria-labelledby={`${id}-question`}
        className={`${classes.answerWrap} ${isOpen ? classes.answerOpen : ""}`}
      >
        <div className={classes.answer}>
          <p className={classes.answerText}>{node.answer}</p>
          {!!href && !!node.link?.label &&
            (href.startsWith("#") ? (
              <a href={href} className={classes.link}>
                {node.link.label}
              </a>
            ) : (
              <Link href={href} className={classes.link}>
                {node.link.label}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FaqItem;
