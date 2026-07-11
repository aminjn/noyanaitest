import Link from "next/link";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import classes from "./DiseaseCard.module.css";
import useLocale from "../Hooks/useLocale";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";
import Ixon from "../UI/Ixon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import Badge from "../UI/Badge";
import TemperatureIcon from "../Icons/TemperatureIcon";
import PillIcon from "../Icons/PillIcon";
import Button from "../UI/Button";
import { t2xsRegular, tsmDemiBold, txsRegular } from "../UI/Typography";

const DiseaseCard = ({
  node,
}: {
  node: IDisease<{ Tag: Record<never, never>; Category: Record<never, never> }>;
}) => {
  const getContent = useLocale();

  return (
    <li className={classes.main}>
      <div className={classes.header}>
        <div className={classes.icon}>
          <Ixon width="1.5rem">
            <StetoscopeIcon />
          </Ixon>
        </div>
        {!!node.tag && (
          <Badge color={node.tag.level} size="S" radius="High" mode="Fill">
            {node.tag.name}
          </Badge>
        )}
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
