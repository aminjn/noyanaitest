import Image from "next/image";
import classes from "./InsuranceCard.module.css";
import { InsurancesPageNode } from "./InsurancesPage";
import { FilePath } from "../config";
import Badge from "../UI/Badge";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import useLocale from "../Hooks/useLocale";
import { ReactNode } from "react";
import UserGroupIcon from "../Icons/UserGroupIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import {
  t2xsMedium,
  t2xsRegular,
  tbaseMedium,
  txsDemiBold,
} from "../UI/Typography";
import Link from "next/link";
import HostedImage from "../UI/HostedImage";

const Count = ({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  value?: string;
  title: string;
}) => {
  if (!value) return null;
  return (
    <div className={classes.count}>
      <Ixon className={classes.countIcon} width="1rem">
        {icon}
      </Ixon>
      <span className={`${classes.countValue} ${txsDemiBold}`}>{value}</span>
      <legend className={`${classes.countTitle} ${t2xsRegular}`}>
        {title}
      </legend>
    </div>
  );
};

const InsuranceCard = ({ node }: { node: InsurancesPageNode }) => {
  const getContent = useLocale();

  return (
    <li className={classes.main}>
      <div className={classes.image}>
        <HostedImage
          alt={node.name || ""}
          src={node.image}
          fill
          style={{ objectFit: "cover" }}
          sizes="23rem"
        />
        {!!node.category && (
          <Badge
            color="Disabled"
            size="L"
            radius="High"
            mode="Fill"
            className={classes.category}
          >
            {node.category.name}
          </Badge>
        )}
        <div className={classes.imageFooter}>
          <div className={classes.nameBox}>
            <Link href={`/insurance/${node.slug || node._id}`}>
              <h3 className={tbaseMedium}>{node.name}</h3>
            </Link>
            {!!node.establishment && (
              <legend
                className={t2xsMedium}
              >{`${getContent("establishedAtx", [node.establishment])}`}</legend>
            )}
          </div>
          <div className={classes.scoreBox}>
            <Ixon width=".75rem" className={classes.star}>
              <StarIcon />
            </Ixon>
            <span className={`${classes.scoreValue} ${t2xsMedium}`}>
              {node.averageScore?.toFixed(1)}
            </span>
          </div>
        </div>
        <div className={classes.fade} />
      </div>
      <div className={classes.content}>
        {!!node.tags.length && (
          <div className={classes.tags}>
            {node.tags.map((tag) => (
              <Badge
                key={tag._id}
                color="Primarylight"
                size="L"
                mode="Fill"
                radius="High"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        <div className={classes.counts}>
          <Count
            icon={<UserGroupIcon />}
            title={getContent("member")}
            value={node.membersCount}
          />
          <Count
            icon={<HospitalIcon />}
            title={getContent("center")}
            value={node.centersCount}
          />
          <Count
            icon={<StetoscopeIcon />}
            title={getContent("doctor")}
            value={node.doctorsCount}
          />
        </div>
      </div>
    </li>
  );
};

export default InsuranceCard;
