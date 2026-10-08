import Image from "next/image";
import classes from "./InsurancePageIntro.module.css";
import { FilePath } from "../config";
import Button from "../UI/Button";
import CallingIcon from "../Icons/CallingIcon";
import Badge from "../UI/Badge";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { tlgMedium, tsmMedium } from "../UI/Typography";
import { InsurancePageNode } from "./InsurancePage";
import HostedImage from "../UI/HostedImage";
import CentreVerifiedTick from "../UI/CentreVerifiedTick";

const NS: ContentNamespace[] = ["common", "insurancePage"];
const InsurancePageIntro = ({ node }: { node: InsurancePageNode }) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.main}>
      <HostedImage
        src={node.image}
        alt={node.name || ""}
        fill
        style={{ objectFit: "cover" }}
        sizes="62rem"
      />
      <div className={classes.fade} />
      <div className={classes.content}>
        <div className={classes.intro}>
          <div className={classes.avatar}>
            <HostedImage
              src={node.image}
              alt={node.name || ""}
              fill
              style={{ objectFit: "cover" }}
              sizes="3.5rem"
            />
          </div>
          <div className={classes.details}>
            <h1 className={`${classes.name} ${tlgMedium}`}>
              {node.name}
              <CentreVerifiedTick verified={node.verified} size="1.125rem" className={classes.tick} />
            </h1>
            <div className={classes.footer}>
              {!!node.category && (
                <Badge size="S" radius="High" mode="Fill" color="Disabled">
                  {node.category.name}
                </Badge>
              )}
              <div className={`${classes.stats} ${tsmMedium}`}>
                <Ixon width=".875rem">
                  <StarIcon />
                </Ixon>
                <span>{`${node.averageScore?.toFixed(1)} (${getContent("xComment", [node.commentCount?.toString() || "0"])})`}</span>
              </div>
            </div>
          </div>
        </div>
        {!!node.phone && (
          <Button
            variant="Primary"
            size="M"
            radius="High"
            mode="Fill"
            tailIcon={<CallingIcon />}
          >
            {node.phone}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InsurancePageIntro;
