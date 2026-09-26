import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./PublicDrIntro.module.css";
import PublicDrSessions from "./PublicDrSessions";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import HostedImage from "../UI/HostedImage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Link from "@/Components/i18n/Link";
import Ixon from "../UI/Ixon";
import CupIcon from "../Icons/CupIcon";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import LocationIcon from "../Icons/LocationIcon";
import StarIcon from "../Icons/StarIcon";
import { ReactNode } from "react";
import ClockIcon from "../Icons/ClockIcon";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import Button from "../UI/Button";
import useProgress from "../Hooks/useProgress";

const NS: ContentNamespace[] = ["common", "drProfile"];

const Point = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) => {
  return (
    <li className={classes.point}>
      <div className={classes.pointHeader}>
        <Ixon width="1.625rem">{icon}</Ixon>
        <legend>{title}</legend>
      </div>
      <p className={classes.pointDescription}>{description}</p>
    </li>
  );
};

export const PublicDrIntroInner = ({
  image,
  name,
  profile,
  speciality,
  address,
}: {
  name: string;
  image?: string;
  profile?: IDoctorProfile;
  speciality?: ISpeciality;
  address?: string;
}) => {
  const getContent = useScopedLocale(NS);

  const push = useProgress();

  return (
    <div className={classes.main}>
      <div className={classes.details}>
        <div className={classes.identity}>
          <div className={classes.image}>
            <HostedImage
              alt={name}
              src={image}
              fill
              sizes="10rem"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className={classes.identityDetails}>
            <div className={classes.identityHeader}>
              <h1 className={classes.name}>{name}</h1>
              {/* TODO: calculate this */}
              {!!profile && (
                <span className={classes.successRate}>
                  <Ixon width=".875rem">
                    <CupIcon />
                  </Ixon>
                  <span>{`98% ${getContent("patientsChoiceRate")}`}</span>
                </span>
              )}
              {!profile && (
                <Button onClick={() => push("/doctorpanel")}>
                  {getContent("isThisYou")}
                </Button>
              )}
            </div>
            <div className={classes.identityMiddle}>
              {speciality && (
                <Link
                  href={`/speciality/${speciality.slug || speciality.name}`}
                  className={classes.speciality}
                >
                  {speciality.name}
                </Link>
              )}
              {/* TODO: Calculate this */}
              {profile && (
                <span className={classes.succeededSessions}>
                  <Ixon width=".875rem">
                    <CheckCircleIcon />
                  </Ixon>
                  <span>{`233 ${getContent(
                    "succeededAppointmentsCount"
                  )}`}</span>
                </span>
              )}
            </div>
            {address && (
              <div className={classes.address}>
                <Ixon width="1rem">
                  <LocationIcon />
                </Ixon>
                <p>{address}</p>
              </div>
            )}
          </div>
        </div>
        {/* TODO: calculate this */}
        {profile && (
          <div className={classes.topReview}>
            <div className={classes.score}>
              <span className={classes.scoreValue}>4.93</span>
              <div className={classes.stars}>
                <Ixon width="1.25rem">
                  <StarIcon />
                </Ixon>
                <Ixon width="1.25rem">
                  <StarIcon />
                </Ixon>
                <Ixon width="1.25rem">
                  <StarIcon />
                </Ixon>
                <Ixon width="1.25rem">
                  <StarIcon />
                </Ixon>
                <Ixon width="1.25rem">
                  <StarIcon />
                </Ixon>
              </div>
              <span className={classes.reviewCount}>{`21 ${getContent(
                "reviewsCount"
              )}`}</span>
            </div>
            <div className={classes.reviewContent}>
              <p className={classes.reviewText}>
                {getContent("drSampleReviewText")}
              </p>
              <button className={classes.allComments}>
                {getContent("seeAllReviews")}
              </button>
            </div>
          </div>
        )}
        <nav className={classes.navs}>
          {!!profile && (
            <button className={`${classes.nav} ${classes.activeNav}`}>
              {getContent("boldPoints")}
            </button>
          )}
          <button className={classes.nav}>{getContent("introduction")}</button>
          <button className={classes.nav}>{getContent("socialMedia")}</button>
          <button className={classes.nav}>{getContent("comments")}</button>
          <button className={classes.nav}>{getContent("faq")}</button>
        </nav>
        {profile && (
          <ul className={classes.points}>
            {/* TODO:Calculate this */}
            <Point
              icon={<CupIcon />}
              title={getContent("drPointPatientsChoiceTitle")}
              description={getContent("drPointPatientsChoiceDescription")}
            />
            <Point
              icon={<ClockIcon />}
              title={getContent("drPointShortWaitTitle")}
              description={getContent("drPointShortWaitDescription")}
            />
          </ul>
        )}
        {profile && (
          <div className={classes.notice}>
            <div className={classes.noticeHeader}>
              <Ixon width="1.5rem">
                <ShieldCheckIcon />
              </Ixon>
              <legend>{getContent("drSelfPayNoticeTitle")}</legend>
            </div>
            <p className={classes.noticeText}>
              {getContent("drSelfPayNoticeText1")}
            </p>
            <p className={classes.noticeText}>
              {getContent("drSelfPayNoticeText2")}
            </p>
          </div>
        )}
      </div>
      {profile && <PublicDrSessions doctor={profile} />}
    </div>
  );
};

const PublicDrIntro = ({
  doctor,
}: {
  doctor: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>;
}) => {
  return (
    <PublicDrIntroInner
      name={getDoctorProfileLabel(doctor)}
      image={doctor.avatar}
      profile={doctor}
      speciality={doctor.mainSpeciality}
    />
  );
};

export default PublicDrIntro;
