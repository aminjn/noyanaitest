import Image from "next/image";
import { IDrug } from "../Admin/Disease/AdminManageDiseasesPage";
import classes from "./DrugCard.module.css";
import { imagePath } from "../helpers/imagepath";
import Link from "next/link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import PillIcon from "../Icons/PillIcon";
import Ixon from "../UI/Ixon";
import Button from "../UI/Button";
import { tsmMedium, tsmRegular, txsMedium, txsRegular } from "../UI/Typography";
import Badge from "../UI/Badge";

const NS: ContentNamespace[] = ["common", "drugCard"];
const DrugCard = ({ node }: { node: IDrug<{ Tag: Record<never, never> }> }) => {
  const getContent = useScopedLocale(NS);

  return (
    <li className={classes.main}>
      <div className={classes.header}>
        <div className={classes.icon}>
          <Ixon width="1.5rem">
            <PillIcon />
          </Ixon>
        </div>
        <div className={classes.details}>
          <h3 className={`${classes.name} ${txsMedium}`}>{node.name}</h3>
          {!!node.brand && (
            <span className={`${classes.brand} ${txsRegular}`}>
              {node.brand}
            </span>
          )}
          {node.tag && (
            <Badge color="Primarylight" mode="Fill" radius="High" size="S">
              {node.tag.name}
            </Badge>
          )}
        </div>
      </div>
      {!!node.dosage && (
        <span className={classes.dosage}>
          <span className={`${classes.dosageTitle} ${tsmMedium}`}>
            {getContent("dosage")}
          </span>
          <span className={`${classes.dosageValue} ${tsmRegular}`}>
            {node.dosage}
          </span>
        </span>
      )}
      <Button
        className={classes.action}
        variant="Primary"
        mode="Fill"
        size="S"
        radius="High"
        href={`/drug/${node.slug || node._id}`}
      >
        {getContent("seeDetails")}
      </Button>
    </li>
  );
};

export default DrugCard;
