import { ReactNode, useMemo } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import ShieldIcon from "../Icons/ShieldIcon";
import Badge from "../UI/Badge";
import Ixon from "../UI/Ixon";
import Link from "@/Components/i18n/Link";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { InsurancePageNode } from "./InsurancePage";
import classes from "./InsurancePageInfo.module.css";
import FlaskIcon from "../Icons/FlaskIcon";
import PillIcon from "../Icons/PillIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import UserGroupIcon from "../Icons/UserGroupIcon";
import Calendar02Icon from "../Icons/Calendar02Icon";
import { t2xsRegular, tsmBold, tsmMedium, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "insurancePage"];

const Count = ({
  icon,
  title,
  value,
  href,
}: {
  icon: ReactNode;
  title: string;
  value?: string;
  href?: string;
}) => {
  if (!value) return null;
  const content = (
    <>
      <div className={`${classes.countIcon} glassIcon tone-sky`}>
        <Ixon width="1rem">{icon}</Ixon>
      </div>
      <div className={classes.countContent}>
        <legend className={`${classes.countTitle} ${t2xsRegular}`}>
          {title}
        </legend>
        <span className={`${classes.countValue} ${tsmBold}`}>{value}</span>
      </div>
    </>
  );
  if (!href) return <div className={classes.count}>{content}</div>;
  return (
    <Link href={href} className={`${classes.count} ${classes.countLink}`}>
      {content}
    </Link>
  );
};

// Like Zocdoc's "in network" (and Paziresh24's insurance filter): the
// insurer page shows who accepts it on the site, counted live, and each count
// opens that list already filtered by this insurer.
const InsurancePageInfo = ({ node }: { node: InsurancePageNode }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const network = node.network;
  const name = encodeURIComponent(node.name || "");
  const tiles: {
    key: keyof NonNullable<InsurancePageNode["network"]>;
    title: ContentKey;
    icon: ReactNode;
    href: string;
  }[] = [
    {
      key: "doctors",
      title: "doctorsAcceptingInsurance",
      icon: <StetoscopeIcon />,
      href: `/book?insurance=${node._id}&name=${name}`,
    },
    {
      key: "clinics",
      title: "clinicsAcceptingInsurance",
      icon: <Calendar02Icon />,
      href: `/clinic?insurance=${node._id}`,
    },
    {
      key: "hospitals",
      title: "hospitalsAcceptingInsurance",
      icon: <HospitalIcon />,
      href: `/hospital?insurance=${node._id}`,
    },
    {
      key: "paraClinics",
      title: "paraClinicsAcceptingInsurance",
      icon: <FlaskIcon />,
      href: `/paraClinic?insurance=${node._id}`,
    },
    {
      key: "pharmacies",
      title: "pharmaciesAcceptingInsurance",
      icon: <PillIcon />,
      href: `/pharmacy?insurance=${node._id}`,
    },
  ];
  const shown = tiles.filter((el) => (network?.[el.key] || 0) > 0);
  const tags = Array.isArray(node.tags) ? node.tags : [];

  return (
    <div className={classes.main}>
      {!!node.summary && (
        <p className={`${classes.summary} ${tsmRegular}`}>{node.summary}</p>
      )}
      {!!node.category && (
        <div className={classes.categoryBox}>
          <div className={`${classes.categoryIcon} glassIcon tone-sky`}>
            <Ixon width="1rem">
              <ShieldIcon />
            </Ixon>
          </div>
          <span className={`${classes.categoryTitle} ${t2xsRegular}`}>
            {getContent("insuranceCategory")}
          </span>
          <Badge size="L" radius="High" color="Primarylight" mode="Fill">
            {node.category.name}
          </Badge>
        </div>
      )}
      {!!tags.length && (
        <div className={classes.tags}>
          {tags.map((tag) =>
            typeof tag === "string" ? null : (
              // a tag is a filter: it opens the list narrowed to it
              <Link key={tag._id} href={`/insurance?tag=${tag._id}`}>
                <Badge size="L" radius="High" color="Primarylight" mode="Fill">
                  {tag.name}
                </Badge>
              </Link>
            ),
          )}
        </div>
      )}
      <div className={classes.counts}>
        <Count
          icon={<UserGroupIcon />}
          title={getContent("insurerees")}
          value={node.membersCount}
        />
      </div>
      {!!shown.length && (
        <section className={classes.network}>
          <div className={classes.networkHead}>
            <h2 className={tsmMedium}>{getContent("insuranceNetworkTitle")}</h2>
            <span className={`${classes.countTitle} ${t2xsRegular}`}>
              {getContent("insuranceNetworkLegend")}
            </span>
          </div>
          <div className={classes.counts}>
            {shown.map((el) => (
              <Count
                key={el.key}
                icon={el.icon}
                title={getContent(el.title)}
                value={num.format(network?.[el.key] || 0)}
                href={el.href}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default InsurancePageInfo;
