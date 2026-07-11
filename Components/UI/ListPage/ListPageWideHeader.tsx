import { ReactNode } from "react";
import classes from "./ListPageWideHeader.module.css";
import Ixon from "../Ixon";
import ShieldCheckIcon from "@/Components/Icons/ShieldCheckIcon";
import InfoCircleIcon from "@/Components/Icons/InfoiCircleIcon";
import Button from "../Button";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import { tsmMedium, tsmRegular, txlMedium } from "../Typography";
const ListPageWideHeader = ({
  icon,
  name,
  category,
  summary,
  primaryAction,
  secondaryAction,
}: {
  icon: ReactNode;
  name: string;
  category?: { title: string; value: string };
  summary?: string;
  primaryAction: { title: string };
  secondaryAction: { title: string };
}) => {
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <div className={classes.icon}>
          <Ixon width="2.25rem">{icon}</Ixon>
        </div>
        <div className={classes.content}>
          <div className={classes.titleBox}>
            <h1 className={`${classes.h1} ${txlMedium}`}>{name}</h1>
            <Ixon width="1.5rem" className={classes.shield}>
              <ShieldCheckIcon />
            </Ixon>
          </div>
          {!!category && (
            <legend
              className={`${classes.category} ${tsmMedium}`}
            >{`${category.title} : ${category.value}`}</legend>
          )}
        </div>
        <Ixon className={classes.info} width="1.5rem">
          <InfoCircleIcon />
        </Ixon>
      </div>
      {!!summary && (
        <p className={`${classes.summary} ${tsmRegular}`}>{summary}</p>
      )}
      <div className={classes.actions}>
        <Button variant="Primary" mode="Outline" size="L" radius="Medium">
          {secondaryAction.title}
        </Button>
        <Button
          variant="Primary"
          mode="Fill"
          size="L"
          radius="Medium"
          tailIcon={<ArrowLeftIcon />}
        >
          {primaryAction.title}
        </Button>
      </div>
    </div>
  );
};

export default ListPageWideHeader;
