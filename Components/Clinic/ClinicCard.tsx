import OpenStatusBadge from "@/Components/OpeningHours/OpenStatusBadge";
import Image from "next/image";
import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import classes from "./ClinicCard.module.css";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import LocationIcon from "../Icons/LocationIcon";
import Link from "@/Components/i18n/Link";
import Badge from "../UI/Badge";
import Button from "../UI/Button";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ChevronIcon from "../Icons/ChevronIcon";
import { tbaseMedium, txsRegular } from "../UI/Typography";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "clinicCard"];

const ClinicCard = ({
  node,
}: {
  node: IClinic<{
    Province: Record<never, never>;
    Category: Record<never, never>;
    Tags: Record<never, never>;
  }>;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <li className={classes.main}>
      <div className={classes.image}>
        <HostedImage
          alt={node.name || ""}
          src={node.image}
          sizes="22.75rem"
          style={{ objectFit: "contain" }}
          fill
        />
        {!!node.category && (
          <Badge
            color="Black"
            size="L"
            mode="Outline"
            radius="High"
            className={classes.category}
          >
            {node.category.name}
          </Badge>
        )}
        {!!node.isRoundTheClock && !node.openStatus && (
          <Badge
            color="Success"
            mode="Fill"
            radius="High"
            size="L"
            className={classes.tfs}
          >
            {getContent("roundTheClock")}
          </Badge>
        )}
      </div>
      <div className={classes.details}>
        <div className={classes.header}>
          <span className={`${classes.name} ${tbaseMedium}`}>{node.name}</span>
          <div className={`${classes.score} ${txsRegular}`}>
            <Ixon width=".75rem">
              <StarIcon />
            </Ixon>
            <span>{node.averageScore?.toFixed(1)}</span>
          </div>
        </div>
        {!!node.province && (
          <div className={classes.location}>
            <Ixon width=".75rem">
              <LocationIcon />
            </Ixon>
            <span>{node.province.name}</span>
          </div>
        )}
        {/* open now / closes at (2026-10, backend Lib/openingHours.ts) */}
        <OpenStatusBadge status={node.openStatus} />
        {!!node.tags?.length && (
          <div className={classes.tags}>
            {node.tags.map((tag) => (
              // a tag is a filter: it opens the list narrowed to it
              <Link key={tag._id} href={`/clinic?tag=${tag._id}`}>
                <Badge color="Primarylight" size="S" mode="Fill" radius="High">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
        <Button
          className={classes.action}
          variant="Primary"
          mode="Fill"
          size="S"
          radius="High"
          tailIcon={
            <Ixon style={{ transform: "rotateZ(90deg)" }}>
              <ChevronIcon />
            </Ixon>
          }
          href={`/clinic/${node.slug || node._id}`}
        >
          {getContent("seeDetails")}
        </Button>
      </div>
    </li>
  );
};

export default ClinicCard;
