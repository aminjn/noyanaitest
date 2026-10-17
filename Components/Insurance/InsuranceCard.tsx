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

// An insurer in the list (2026-10, the owner's review: the old card was a
// 16rem image box - for insurers mostly an empty letter - and a blank
// half). Compact, like the pharmacy cards and Doctolib / Paziresh24's
// insurer lists: a logo tile, the name, basic or supplementary, the year
// it was founded, its summary, what it covers, and its network on the site.
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
  const coverages = (Array.isArray(node.coverages) ? node.coverages : []).filter((c) => typeof c === "string" && c.trim());
  const kindLabel = node.isBasic ? getContent("basicInsurance") : getContent("finInsSupplementary");
  // a tag that only repeats the kind badge («بیمه‌ی پایه») is left out
  const flat = (v?: string) => (v || "").replace(/[\s\u200c‌ی]+/g, "");
  const tags = Array.isArray(node.tags) ? node.tags.filter((t) => t && t._id && flat(t.name) !== flat(kindLabel)) : [];
  const rated = (node.commentCount || 0) > 0 && typeof node.averageScore === "number";

  return (
    <li className={classes.main}>
      <div className={classes.head}>
        <Link href={href} className={classes.logo} aria-hidden tabIndex={-1}>
          {node.image ? (
            <HostedImage alt="" src={node.image} fill style={{ objectFit: "contain" }} sizes="3rem" />
          ) : (
            <span className={classes.initial}>{name.replace(/^بیمه\s+/, "").trim().charAt(0) || "؟"}</span>
          )}
        </Link>
        <div className={classes.title}>
          <Link href={href} className={classes.name}>
            <h3>{name}</h3>
          </Link>
          <div className={classes.meta}>
            <span className={`${classes.kind} ${node.isBasic ? classes.basic : ""}`}>
              {kindLabel}
            </span>
            {!!node.establishment && <span>{getContent("establishedAtx", [node.establishment])}</span>}
            {rated && (
              <span className={classes.score}>
                <Ixon width="0.75rem" className={classes.star}>
                  <StarIcon />
                </Ixon>
                {score.format(node.averageScore!)}
              </span>
            )}
          </div>
        </div>
      </div>

      {!!node.summary?.trim() && <p className={classes.summary}>{node.summary}</p>}

      {(!!coverages.length || !!tags.length) && (
        <div className={classes.chips}>
          {tags.map((tag) => (
            // a tag is a filter: it opens the list narrowed to it
            <Link key={tag._id} href={`/insurance?tag=${tag._id}`} className={`${classes.chip} ${classes.tag}`}>
              {tag.name}
            </Link>
          ))}
          {coverages.slice(0, 3).map((c) => (
            <span key={c} className={classes.chip}>
              {c}
            </span>
          ))}
          {coverages.length > 3 && <span className={classes.more}>+{num.format(coverages.length - 3)}</span>}
        </div>
      )}

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
    </li>
  );
};

export default InsuranceCard;
