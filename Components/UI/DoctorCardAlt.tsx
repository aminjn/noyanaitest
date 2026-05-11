import Image from "next/image";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./DoctorCardAlt.module.css";
import { imagePath } from "../helpers/imagepath";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import Ixon from "./Ixon";
import StarIcon from "../Icons/StarIcon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import useComplexLocale from "../Hooks/useComplexLocale";
import VerifyIcon from "../Icons/VerifyIcon";
import useLocale from "../Hooks/useLocale";
import Link from "next/link";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import {
  t2xsMedium,
  t2xsRegular,
  tsmDemiBold,
  txsMedium,
  txsRegular,
} from "./Typography";

const DoctorCardAlt = ({
  node,
}: {
  node: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>;
}) => {
  const getCompContent = useComplexLocale();
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.scores}>
        <div className={`${classes.badge} ${classes.starBadge}`}>
          <Ixon width=".75rem">
            <StarIcon />
          </Ixon>
          {
            //TODO : claculate this
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
      </div>
      <div className={classes.imageBox}>
        <div className={classes.image}>
          <Image
            src={imagePath(node.avatar)}
            alt={getDoctorProfileLabel(node)}
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
        <h5 className={`${classes.doctorName} ${tsmDemiBold}`}>
          {getDoctorProfileLabel(node)}
        </h5>
        <legend className={`${classes.speciality} ${txsRegular}`}>
          &nbsp;{node.mainSpeciality?.name}&nbsp;
        </legend>
      </div>
      <div className={classes.consult}>
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
      </div>
      <div className={`${classes.actions} ${txsMedium}`}>
        <Link
          className={`${classes.action} ${classes.primaryAction}`}
          href={`/doctor/${node.slug || node._id}`}
        >
          {getContent("visitProfile")}
        </Link>
        <Link
          className={`${classes.action} ${classes.secondaryAction}`}
          href={"/booking"}
        >
          <span>{getContent("booking")}</span>
          <Ixon width="1.25rem">
            <ArrowLeftIcon />
          </Ixon>
        </Link>
      </div>
    </div>
  );
};

export default DoctorCardAlt;
