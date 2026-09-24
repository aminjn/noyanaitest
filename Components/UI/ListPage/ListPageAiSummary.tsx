import classes from "./ListPageAiSummary.module.css";
import Image from "next/image";
import Ixon from "../Ixon";
import AiIcon from "@/Components/Icons/AiIcon";
import RenderRtf from "../RenderRtf";
import { tlgDemiBold, tsmRegular, txsRegular } from "../Typography";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const ListPageAISummary = ({
  content,
  title,
}: {
  title: string;
  content?: string;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);

  if (!content) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <Ixon width="3rem">
          <AiIcon />
        </Ixon>
        <div className={classes.headerContent}>
          <legend className={`${classes.title} ${tlgDemiBold}`}>{title}</legend>
          <legend className={`${classes.subTitle} ${txsRegular}`}>
            {getContent("generatedByAi")}
          </legend>
        </div>
      </div>
      <div className={classes.content}>
        <RenderRtf value={content} />
      </div>
      <span className={`${classes.notice} ${tsmRegular}`}>
        {getContent("dataIsnotAccurate")}
      </span>
    </div>
  );
};

export default ListPageAISummary;
