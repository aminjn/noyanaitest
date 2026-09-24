import Image from "next/image";
import { ISymptom } from "../Admin/Disease/AdminManageDiseasesPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./SymptomCard.module.css";
import { imagePath } from "../helpers/imagepath";
import Link from "next/link";
import VirusIcon from "../Icons/VirusIcon";
import Badge from "../UI/Badge";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import { tsmDemiBold, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "symptomCard"];

const SymptomCard = ({ node }: { node: ISymptom }) => {
  const getContent = useScopedLocale(NS);
  return (
    <li className={classes.main}>
      <div className={classes.header}>
        <div className={classes.icon}>
          <Ixon width="1.5rem">
            <VirusIcon />
          </Ixon>
        </div>
        <h3 className={`${classes.name} ${tsmDemiBold}`}>{node.name}</h3>
      </div>
      <p className={`${classes.summary} ${tsmRegular}`}>{node.summary}</p>
      <div className={classes.tags}>
        <Badge radius="High" color="Primarylight" mode="Fill" size="S">
          tag
        </Badge>
        <Badge radius="High" color="Primarylight" mode="Fill" size="S">
          tag
        </Badge>
      </div>
      <div className={classes.actions}>
        <Link
          href={`/symptom/${node.slug || node._id}`}
          className={`${classes.link} ${tsmDemiBold}`}
        >
          <span>{getContent("seeDetails")}</span>
          <Ixon width="1.25rem" style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </Link>
      </div>
    </li>
  );
};

export default SymptomCard;
