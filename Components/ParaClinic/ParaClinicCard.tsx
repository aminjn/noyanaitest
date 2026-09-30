import Image from "next/image";
import { IParaClinic } from "../Layout/ParaClinicPanelLayout";
import classes from "./ParaClinicCard.module.css";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import LocationIcon from "../Icons/LocationIcon";
import Badge from "../UI/Badge";
import Link from "@/Components/i18n/Link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ChevronIcon from "../Icons/ChevronIcon";
import { tbaseMedium, txsRegular } from "../UI/Typography";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "paraClinicCard"];

// Also the card of a pharmacy in search results (same shape: image, name,
// province, tags) - `kind` only changes the link and its label.
const ParaClinicCard = ({
  node,
  kind = "paraClinic",
}: {
  kind?: "paraClinic" | "pharmacy";
  node: IParaClinic<{
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }>;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <li className={classes.main}>
      <div className={classes.image}>
        <HostedImage
          src={node.image}
          alt={node.name || ""}
          sizes="23rem"
          style={{ objectFit: "contain" }}
          fill
        />
      </div>
      <div className={classes.details}>
        <h3 className={`${classes.name} ${tbaseMedium}`}>{node.name}</h3>
        {!!node.province && (
          <div className={`${classes.province} ${txsRegular}`}>
            <Ixon width=".75rem">
              <LocationIcon />
            </Ixon>
            <span>{node.province.name}</span>
          </div>
        )}
      </div>
      {!!node.tags?.length && (
        <div className={classes.tags}>
          {node.tags.map((tag) => (
            // a tag is a filter: it opens the list narrowed to it
            <Link key={tag._id} href={`/paraClinic?tag=${tag._id}`}>
              <Badge size="S" color="Primarylight" mode="Fill" radius="High">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}
      <div className={classes.footer}>
        <Link
          className={classes.link}
          href={`/${kind}/${node.slug || node._id}`}
        >
          <span>
            {getContent(kind === "pharmacy" ? "seePharmacy" : "seeParaClinic")}
          </span>
          <Ixon width="1.25rem" style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </Link>
      </div>
    </li>
  );
};

export default ParaClinicCard;
