import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./CardWithSession.module.css";
import HostedImage from "../UI/HostedImage";
import Link from "next/link";
import Ixon from "../UI/Ixon";
import HandThumUpIcon from "../Icons/HandThumbUpIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import LocationIcon from "../Icons/LocationIcon";
import { Sessions } from "./DoctorCardWithSessions";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import StarIcon from "../Icons/StarIcon";

const NS: ContentNamespace[] = ["common", "booking"];

const CardWithSession = ({
  name,
  speciality,
  target,
  address,
  description,
  doctorProfile,
  image,
}: {
  image?: string;
  name: string;
  target: string;
  doctorProfile?: IDoctorProfile;
  speciality?: ISpeciality;
  address?: string;
  description?: string;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <li className={classes.main}>
      <div className={classes.avatar}>
        <HostedImage
          alt={name}
          src={image}
          fill
          sizes="10rem"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.details}>
        <div className={classes.header}>
          <h2 className={classes.name}>
            <Link href={target}>{name}</Link>
          </h2>
          {
            //TODO: calculate this
          }
          {!!doctorProfile && (
            <div className={classes.recommendation}>
              <Ixon width="1rem" className={classes.thumbsUp}>
                <HandThumUpIcon />
              </Ixon>
              <span>98% {getContent("usersSuggestionRate")}</span>
            </div>
          )}
        </div>
        <div className={classes.second}>
          {speciality && (
            <Link
              href={`/speciality/${speciality.slug || speciality.name}`}
              className={classes.speciality}
            >
              {speciality.name}
            </Link>
          )}
          {!!doctorProfile && (
            <span className={classes.successRate}>
              <Ixon width=".875rem">
                <CheckCircleIcon />
              </Ixon>
              <span>23490 {getContent("succeededAppointmentsCount")}</span>
            </span>
          )}
        </div>
        {!!doctorProfile && (
          <div className={classes.rating}>
            <Ixon width="1rem" className={classes.star}>
              <StarIcon />
            </Ixon>
            {
              //TODO: calculate this
            }
            <span className={classes.ratingValue}>4.86</span>
            <span className={classes.commentCount}>
              85 {getContent("commentCount")}
            </span>
          </div>
        )}
        {!!address && (
          <div className={classes.address}>
            <Ixon width="1rem">
              <LocationIcon />
            </Ixon>
            <p>{address}</p>
          </div>
        )}
        {!!description && <p className={classes.summary}>{description}</p>}
      </div>
      {!!doctorProfile && <Sessions node={doctorProfile} />}
    </li>
  );
};

export default CardWithSession;
