import Link from "@/Components/i18n/Link";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import classes from "./DiseaseCard.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";
import Ixon from "../UI/Ixon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import TemperatureIcon from "../Icons/TemperatureIcon";
import PillIcon from "../Icons/PillIcon";
import Button from "../UI/Button";
import { t2xsRegular, tsmDemiBold, txsRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "diseaseCard"];

const DiseaseCard = ({
  node,
}: {
  node: IDisease<{ Tag: Record<never, never>; Category: Record<never, never> }>;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <li className={classes.main}>
      <div className={classes.header}>
        <div className={`${classes.icon} glassIcon tone-rose`}>
          <Ixon width="1.5rem">
            <StetoscopeIcon />
          </Ixon>
        </div>
      </div>
      <h3 className={`${classes.name} ${tsmDemiBold}`}>{node.name}</h3>
      {!!node.category && (
        <span className={`${classes.category} ${t2xsRegular}`}>
          {node.category.name}
        </span>
      )}
      <p className={`${classes.summary} ${txsRegular}`}>{node.summary}</p>
      <div className={`${classes.counts} ${t2xsRegular}`}>
        <div className={classes.count}>
          <Ixon width=".75rem">
            <TemperatureIcon />
          </Ixon>
          <span>
            {getContent("nSymptoms", [node.symptoms?.length.toString() || "0"])}
          </span>
        </div>
        <span>.</span>
        <div className={classes.count}>
          <Ixon width=".75rem">
            <PillIcon />
          </Ixon>
          <span>
            {getContent("nRecommendedDrugs", [
              node.drugs?.length.toString() || "0",
            ])}
          </span>
        </div>
      </div>
      <Button
        className={classes.action}
        variant="Primary"
        mode="Fill"
        size="S"
        radius="High"
        href={`/disease/${node.slug || node._id}`}
      >
        {getContent("seeDetails")}
      </Button>
    </li>
  );
};

export default DiseaseCard;
