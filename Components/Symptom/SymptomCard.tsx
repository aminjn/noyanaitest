import Image from "next/image";
import { ISymptom } from "../Admin/Disease/AdminManageDiseasesPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./SymptomCard.module.css";
import { imagePath } from "../helpers/imagepath";
import Link from "@/Components/i18n/Link";
import VirusIcon from "../Icons/VirusIcon";
import Badge from "../UI/Badge";
import Ixon from "../UI/Ixon";
import ChevronIcon from "../Icons/ChevronIcon";
import { tsmDemiBold, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "symptomCard"];

const SymptomCard = ({ node }: { node: ISymptom }) => {
  const getContent = useScopedLocale(NS);
  // populated by the directory; a list of bare ids shows no chips
  const parts = (Array.isArray(node.part) ? node.part : []).filter(
    (p): p is { _id: string; name?: string } & typeof p =>
      !!p && typeof p === "object" && !!(p as { name?: string }).name,
  ) as unknown as { _id: string; name?: string }[];
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
      {/* the body parts it is filed under (the placeholder "tag" chips were
          drawn on every card) */}
      {parts.length > 0 && (
        <div className={classes.tags}>
          {parts.map((part) => (
            <Badge key={part._id} radius="High" color="Primarylight" mode="Fill" size="S">
              {part.name}
            </Badge>
          ))}
        </div>
      )}
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
