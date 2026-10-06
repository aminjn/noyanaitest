import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import CheckIcon from "../Icons/CheckIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import { txlBold, txsRegular } from "../UI/Typography";
import classes from "./BecomeDoneView.module.css";

const NS: ContentNamespace[] = ["common", "becomeSomething"];
const BecomeDoneView = ({
  title,
  target,
}: {
  title: ContentKey;
  target: string;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      <div className={`${classes.icon} glassIcon tone-teal`}>
        <Ixon width="1.5rem">
          <CheckIcon />
        </Ixon>
      </div>
      <h2 className={`${classes.title} ${txlBold}`}>{getContent(title)}</h2>
      <p className={`${classes.description} ${txsRegular}`}>
        {getContent("becomeSuccessLegend")}
      </p>
      <div className={classes.actions}>
        <Button
          href={target}
          variant="Primary"
          mode="Fill"
          radius="High"
          size="L"
        >
          {getContent("enterDashboard")}
        </Button>
        <Button
          href="/"
          variant="Primary"
          mode="Outline"
          radius="High"
          size="L"
        >
          {getContent("goHomePage")}
        </Button>
      </div>
    </div>
  );
};

export default BecomeDoneView;
