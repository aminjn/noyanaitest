import { ContentKey } from "@/Components/Enums/contentKeys";
import classes from "./CartableNodePageSameAs.module.css";
import useLocale from "@/Components/Hooks/useLocale";
import { Fragment, ReactNode } from "react";
import Ixon from "@/Components/UI/Ixon";
import { tlgMedium } from "@/Components/UI/Typography";
const CartbaleNodePageSameAs = ({
  sameAs,
  sameAsTitle,
  sameAsIcon,
}: {
  sameAsTitle: ContentKey;
  sameAs: ReactNode[];
  sameAsIcon: ReactNode;
}) => {
  const getContent = useLocale();

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
