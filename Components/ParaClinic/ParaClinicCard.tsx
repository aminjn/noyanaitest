import Image from "next/image";
import { IParaClinic } from "../Layout/ParaClinicPanelLayout";
import classes from "./ParaClinicCard.module.css";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import LocationIcon from "../Icons/LocationIcon";
import Badge from "../UI/Badge";
import Link from "next/link";
import useLocale from "../Hooks/useLocale";
import ChevronIcon from "../Icons/ChevronIcon";
import { tbaseMedium, txsRegular } from "../UI/Typography";

const ParaClinicCard = ({
  node,
}: {
  node: IParaClinic<{
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }>;
}) => {
  const getContent = useLocale();

  return (
    <li className={classes.main}>
      <div className={classes.image}>
        <Image
          src={`${FilePath}/${node.image}`}
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
      {!!node.tags.length && (
        <div className={classes.tags}>
          {node.tags.map((tag) => (
            <Badge
              size="S"
              color="Primarylight"
              mode="Fill"
              radius="High"
              key={tag._id}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}
      <div className={classes.footer}>
        <Link
          className={classes.link}
          href={`/paraClinic/${node.slug || node._id}`}
        >
          <span>{getContent("seeParaClinic")}</span>
          <Ixon width="1.25rem" style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </Link>
      </div>
    </li>
  );
};

export default ParaClinicCard;
