import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import StarsSolidIcon from "../Icons/StarsSolidIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { tmdBold, tsmRegular } from "../UI/Typography";
import classes from "./BlogsCta.module.css";

const NS: ContentNamespace[] = ["common", "mag", "magPost"];

// The magazine's way to care (2026-10): a reader with a health question
// goes from the article to the smart diagnosis or to a doctor's booking,
// as Healthline's "find a doctor" and Paziresh24's magazine booking box do.
const BlogsCta = ({ className = "" }: { className?: string }) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={`${classes.main} ${className}`}>
      <span className={classes.icon} aria-hidden>
        <Ixon width="1.25rem">
          <StarsSolidIcon />
        </Ixon>
      </span>
      <h4 className={`${classes.title} ${tmdBold}`}>{getContent("magCtaTitle")}</h4>
      <p className={`${classes.legend} ${tsmRegular}`}>{getContent("magCtaLegend")}</p>
      <div className={classes.actions}>
        <Button href="/wizard" size="M" variant="Primary" mode="Fill" radius="High">
          {getContent("magCtaAi")}
        </Button>
        <Button href="/book" size="M" variant="Primary" mode="Outline" radius="High">
          {getContent("magCtaBook")}
        </Button>
      </div>
    </div>
  );
};

export default BlogsCta;
