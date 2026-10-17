import classes from "./InsuranceCard.module.css";
import { InsurancesPageNode } from "./InsurancesPage";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ReactNode, useMemo } from "react";
import { useIntlLocale } from "@/Components/i18n/navigation";
import UserGroupIcon from "../Icons/UserGroupIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import ChevronIcon from "../Icons/ChevronIcon";
import Link from "@/Components/i18n/Link";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "insuranceCard"];

// An insurer in the list (2026-10, the owner's review): its image on top -
// shorter than before and the whole logo, not cropped - then only the
// name, basic or supplementary, the year founded, a two-line summary and
// its network on the site. Covers (long sentences) stay on its page.
const Stat = ({ icon, value, title }: { icon: ReactNode; value?: string; title: string }) =>
  value ? (
    <span className={classes.stat}>
      <Ixon width="0.875rem" className={classes.statIcon}>
        {icon}
      </Ixon>
      <strong>{value}</strong>
      <span>{title}</span>
    </span>
  ) : null;

const InsuranceCard = ({ node }: { node: InsurancesPageNode }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const score = useMemo(() => new Intl.NumberFormat(intlTag, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), [intlTag]);
  const href = `/insurance/${node.slug || node._id}`;
  const name = node.name || "";
  const centers = (node.network?.clinics || 0) + (node.network?.hospitals || 0) + (node.network?.paraClinics || 0);
  const kindLabel = node.isBasic ? getContent("basicInsurance") : getContent("finInsSupplementary");
  const rated = (node.commentCount || 0) > 0 && typeof node.averageScore === "number";

  return (
    <li className={classes.main}>
      <Link href={href} className={classes.cover} aria-hidden tabIndex={-1}>
        {node.image ? (
          // the whole logo, on a soft backdrop: insurers' images are logos
          <HostedImage alt="" src={node.image} fill style={{ objectFit: "contain" }} sizes="20rem" />
        ) : (
          <span className={classes.initial}>{name.replace(/^بیمه\s+/, "").trim().charAt(0) || "؟"}</span>
        )}
        <span className={`${classes.kind} ${node.isBasic ? classes.basic : ""}`}>{kindLabel}</span>
        {rated && (
          <span className={classes.score}>
            <Ixon width="0.75rem" className={classes.star}>
              <StarIcon />
            </Ixon>
            {score.format(node.averageScore!)}
          </span>
        )}
      </Link>

      <div className={classes.body}>
        <Link href={href} className={classes.name}>
          <h3>{name}</h3>
        </Link>
        {!!node.establishment && <span className={classes.meta}>{getContent("establishedAtx", [node.establishment])}</span>}
        {!!node.summary?.trim() && <p className={classes.summary}>{node.summary}</p>}

        <div className={classes.footer}>
          <div className={classes.stats}>
            <Stat icon={<UserGroupIcon />} title={getContent("member")} value={node.membersCount} />
            {/* the network on the site, counted from who actually accepts it */}
            <Stat icon={<HospitalIcon />} title={getContent("center")} value={centers ? num.format(centers) : undefined} />
            <Stat icon={<StetoscopeIcon />} title={getContent("doctor")} value={node.network?.doctors ? num.format(node.network.doctors) : undefined} />
          </div>
          <Link href={href} className={classes.go}>
            {getContent("seeDetails")}
            <Ixon width="0.75rem" className={classes.goIcon}>
              <ChevronIcon />
            </Ixon>
          </Link>
        </div>
      </div>
    </li>
  );
};

export default InsuranceCard;
