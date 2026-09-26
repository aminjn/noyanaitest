import classes from "../UI/DoctorCardAlt.module.css";
import { IDoctor } from "../Admin/Doctor/AdminManageDoctorsPage";
import HostedImage from "../UI/HostedImage";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import VerifyIcon from "../Icons/VerifyIcon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Link from "next/link";
import {
  t2xsMedium,
  t2xsRegular,
  tsmDemiBold,
  txsMedium,
  txsRegular,
} from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "doctorsList"];

const DoctorCard = ({
  node,
}: {
  node: IDoctor<{ SpecialityPopulated: Record<never, never> }>;
}) => {
  const getContent = useScopedLocale(NS);
  const getCompContent = getContent;

  const name = node.name || getContent("noName");
  const target = `/doctor/${node.slug || node.name}`;

  return (
    <div className={classes.main}>
      {/* <div className={classes.scores}>
        <div className={`${classes.badge} ${classes.starBadge}`}>
          <Ixon width=".75rem">
            <StarIcon />
          </Ixon>
          {
            //TODO: calculate this
          }
          <span className={`${classes.badgeValue} ${t2xsMedium}`}>4.5</span>
        </div>
        <div className={`${classes.badge} ${classes.recommendBadge}`}>
          <Ixon width=".75rem">
            <CheckCircleIcon />
          </Ixon>
          <span className={`${classes.badgeValue} ${t2xsMedium}`}>
            {getCompContent("xPeopleRecommended", ["20"])}
          </span>
        </div>
      </div> */}
      <div className={classes.imageBox}>
        <div className={classes.image}>
          <HostedImage
            src={node.image}
            alt={name}
            sizes="5rem"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <span className={classes.onlineBadge} />
        <Ixon width="1.5rem" className={classes.verifiedBadge}>
          <VerifyIcon />
        </Ixon>
      </div>
      <div className={classes.identity}>
        <h5 className={`${classes.doctorName} ${tsmDemiBold}`}>{name}</h5>
        <legend className={`${classes.speciality} ${txsRegular}`}>
          &nbsp;{node.speciality?.name}&nbsp;
        </legend>
      </div>
      {/* <div className={classes.consult}>
        <div className={`${classes.pair} ${t2xsRegular}`}>
          <span className={classes.pairTitle}>{getContent("consultTime")}</span>
          <span className={classes.pairValue}>
            {getCompContent("xMinutes", ["15"])}
          </span>
        </div>
        <div className={`${classes.pair} ${t2xsRegular}`}>
          <span className={classes.pairTitle}>
            {getContent("responseStatus")}
          </span>
          <span className={classes.pairValue}>
            {getContent("readyToRespond")}
          </span>
        </div>
      </div> */}
      <div className={`${classes.actions} ${txsMedium}`}>
        <Link
          className={`${classes.action} ${classes.primaryAction}`}
          href={target}
        >
          {getContent("visitProfile")}
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
