import OpenStatusBadge from "@/Components/OpeningHours/OpenStatusBadge";
import Image from "next/image";
import { IHospital } from "../Admin/Hospital/AdminManageHospitalsPage";
import classes from "./HospitalCard.module.css";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import LocationIcon from "../Icons/LocationIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import Badge from "../UI/Badge";
import { tbaseMedium, txsRegular } from "../UI/Typography";
import Link from "@/Components/i18n/Link";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "hospitalCard"];

const HospitalCard = ({
  node,
}: {
  node: IHospital<{
    Province: Record<never, never>;
    Tags: Record<never, never>;
    Category: Record<never, never>;
  }>;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <li className={classes.main}>
      <div className={classes.image}>
        <HostedImage
          alt={node.name || ""}
          src={node.image}
          fill
          style={{ objectFit: "contain" }}
          sizes="24rem"
        />
      </div>
      <div className={classes.details}>
        <div className={classes.header}>
          <Link href={`/hospital/${node.slug || node._id}`}>
            <span className={`${classes.name} ${tbaseMedium}`}>
              {node.name}
            </span>
          </Link>
          <div className={classes.stats}>
            <span className={classes.commentCount}>({node.commentCount})</span>
            <div className={classes.score}>
              <Ixon width=".75rem">
                <StarIcon />
              </Ixon>
              <span className={txsRegular}>
                {node.averageScore?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        {!!node.province && (
          <div className={classes.province}>
            <Ixon width=".75rem">
              <LocationIcon />
            </Ixon>
            <span>{node.province.name}</span>
          </div>
        )}
        {/* open now / closes at (2026-10, backend Lib/openingHours.ts) */}
        <OpenStatusBadge status={node.openStatus} />
        {/* real numbers only: the speciality count used to be a fixed "6" */}
        {!!node.bedCount && (
          <div className={`${classes.counts} ${txsRegular}`}>
            <div className={classes.count}>
              <Ixon width=".75rem">
                <StetoscopeIcon />
              </Ixon>
              <span>{getContent("nBeds", [String(node.bedCount)])}</span>
            </div>
          </div>
        )}
        {!!node.tags?.length && (
          <div className={classes.tags}>
            {node.tags.map((tag) => (
              // a tag is a filter: it opens the list narrowed to it
              <Link key={tag._id} href={`/hospital?tag=${tag._id}`}>
                <Badge color="Primarylight" size="S" radius="High" mode="Fill">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </li>
  );
};

export default HospitalCard;
