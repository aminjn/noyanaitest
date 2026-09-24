import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ShieldIcon from "../Icons/ShieldIcon";
import Badge from "../UI/Badge";
import Ixon from "../UI/Ixon";
import { InsurancePageNode } from "./InsurancePage";
import classes from "./InsurancePageInfo.module.css";
import FlaskIcon from "../Icons/FlaskIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import UserGroupIcon from "../Icons/UserGroupIcon";
import { t2xsRegular, tsmBold, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "insurancePage"];

const Count = ({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value?: string;
}) => {
  if (!value) return null;
  return (
    <div className={classes.count}>
      <div className={classes.countIcon}>
        <Ixon width="1rem">{icon}</Ixon>
      </div>
      <div className={classes.countContent}>
        <legend className={`${classes.countTitle} ${t2xsRegular}`}>
          {title}
        </legend>
        <span className={`${classes.countValue} ${tsmBold}`}>{value}</span>
      </div>
    </div>
  );
};

const InsurancePageInfo = ({ node }: { node: InsurancePageNode }) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      {!!node.summary && (
        <p className={`${classes.summary} ${tsmRegular}`}>{node.summary}</p>
      )}
      {!!node.category && (
        <div className={classes.categoryBox}>
          <div className={classes.categoryIcon}>
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
      <div className={classes.counts}>
        <Count
          icon={<FlaskIcon />}
          title={getContent("pharmacy")}
          value={node.pharmacyCount}
        />
        <Count
          icon={<StetoscopeIcon />}
          title={getContent("doctor")}
          value={node.doctorCount}
        />
        <Count
          icon={<HospitalIcon />}
          title={getContent("hospital")}
          value={node.hospitalCount}
        />
        <Count
          icon={<UserGroupIcon />}
          title={getContent("insurerees")}
          value={node.membersCount}
        />
      </div>
    </div>
  );
};

export default InsurancePageInfo;
