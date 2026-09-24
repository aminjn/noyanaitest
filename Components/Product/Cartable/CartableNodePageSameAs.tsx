import { ContentKey } from "@/Components/Enums/contentKeys";
import classes from "./CartableNodePageSameAs.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { Fragment, ReactNode } from "react";
import Ixon from "@/Components/UI/Ixon";
import { tlgMedium } from "@/Components/UI/Typography";

const NS: ContentNamespace[] = ["common", "productCartable"];
const CartbaleNodePageSameAs = ({
  sameAs,
  sameAsTitle,
  sameAsIcon,
}: {
  sameAsTitle: ContentKey;
  sameAs: ReactNode[];
  sameAsIcon: ReactNode;
}) => {
  const getContent = useScopedLocale(NS);

  if (!sameAs.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <Ixon className={classes.icon} width="1rem">
          {sameAsIcon}
        </Ixon>
        <span className={tlgMedium}>{getContent("othersAlsoBoughtThese")}</span>
      </div>
      <div className={classes.list}>
        {sameAs.map((el, i) => (
          <Fragment key={i}>{el}</Fragment>
        ))}
      </div>
    </div>
  );
};

export default CartbaleNodePageSameAs;
