import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import StarsLineIcon from "../Icons/StarsLineIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import { txsMedium, txsRegular } from "../UI/Typography";
import classes from "./UpgradeProBox.module.css";

const NS: ContentNamespace[] = ["common", "productCartable"];

const Item = ({ children }: { children?: ReactNode }) => {
  return (
    <div className={`${classes.item} ${txsRegular}`}>
      <span className={classes.dot} />
      <span>{children}</span>
    </div>
  );
};

const UpgradeProBox = () => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      <div className={`${classes.header} ${txsMedium}`}>
        <Ixon width="1.5rem">
          <StarsLineIcon />
        </Ixon>
        <span>{getContent("productProBoxTitle")}</span>
      </div>
      <div className={classes.list}>
        <Item>{getContent("productProItem0")}</Item>
        <Item>{getContent("productProItem1")}</Item>
        <Item>{getContent("productProItem2")}</Item>
      </div>
      <div className={classes.action}>
        <Button variant="Secondary" mode="Outline" size="S" radius="Medium">
          {getContent("upgradeAccount")}
        </Button>
      </div>
    </div>
  );
};

export default UpgradeProBox;
