import Link from "@/Components/i18n/Link";
import { ITest } from "../Admin/Test/AdminManageTestsPage";
import FlaskIcon from "../Icons/FlaskIcon";
import Badge from "../UI/Badge";
import Ixon from "../UI/Ixon";
import classes from "./TestCard.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { tsmMedium, txsRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "testCard"];

const TestCard = ({
  node,
}: {
  node: ITest<{ Category: Record<never, never> }>;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <li className={classes.main}>
      <div className={classes.icon}>
        <Ixon width="1.5rem">
          <FlaskIcon />
        </Ixon>
      </div>
      <div className={classes.content}>
        <h3 className={`${classes.name} ${tsmMedium}`}>{node.name}</h3>
        <div className={classes.footer}>
          {!!node.summary && (
            <p className={`${classes.summary} ${txsRegular}`}>{node.summary}</p>
          )}
          {!!node.category && (
            <Badge color="Black" radius="High" mode="Fill" size="XL">
              {node.category.name}
            </Badge>
          )}
        </div>
      </div>
      <Link href={`/test/${node.slug || node._id}`} className={classes.link}>
        {getContent("seeDetails")}
      </Link>
    </li>
  );
};

export default TestCard;
