import Image from "next/image";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./DoctorCardWithSessions.module.css";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import { imagePath } from "../helpers/imagepath";
import useLocale from "../Hooks/useLocale";
import Ixon from "../UI/Ixon";
import HandThumUpIcon from "../Icons/HandThumbUpIcon";
import Link from "next/link";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import StarIcon from "../Icons/StarIcon";
import LocationIcon from "../Icons/LocationIcon";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { Fragment, useMemo } from "react";
import HandleLoading from "../Admin/UI/HandleLoading";
import { getSessionDateKey } from "../helpers/lib";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import AuthPopup from "../Popups/AuthPopup";
import SelectSessionToReservePopup from "./SelectSessionToReservePopup";

const Sessions = ({ node }: { node: IDoctorProfile }) => {
  const { data, error } = useSWR<{ count: number; _id: string }[]>(
    `${API}/public/doctor/${node._id}/week`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const { user } = useUser();

  const isAvailable = useMemo<boolean>(
    () => !!data?.some((el) => !!el.count),
    [data]
  );

  const getContent = useLocale();

  const ready = useMemo<Record<string, number>>(() => {
    const result: Record<string, number> = {};
    const now = new Date();
    for (let i = 0; i < 7; ++i) {
      const key = getSessionDateKey(now);
      result[key] = data?.find((el) => el._id === key)?.count || 0;
      now.setDate(now.getDate() + 1);
    }
    return result;
  }, [data]);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Fragment>
          {isAvailable ? (
            <div className={classes.sessions}>
              {Object.entries(ready).map(([key, value]) => (
                <div
                  key={key}
                  className={`${classes.day} ${!value ? classes.full : ""}`}
                  onClick={() => {
                    if (!user) {
                      setPopup("login", <AuthPopup />);
                    } else {
                      setPopup(
                        "SelectSessionToReserve",
                        <SelectSessionToReservePopup
                          doctor={node}
                          stamp={key}
                        />
                      );
                    }
                  }}
                >
                  <span className={classes.weekDay}>
                    {new Date(key).toLocaleDateString("fa-IR", {
                      weekday: "long",
                    })}
                  </span>
                  <span>
                    {new Date(key).toLocaleDateString("fa-IR", {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span>{value}</span>
                  <span className={classes.countLabel}>
                    {getContent("availableSessionCount")}
                  </span>
                </div>
              ))}
              <Link
                href={`/doctor/${node.slug || node._id}/calendar`}
                className={classes.more}
              >
                {getContent("moreSessions")}
              </Link>
            </div>
          ) : (
            <p className={classes.notAvailable}>
              {getContent("doctorNotAvailableMessage")}
            </p>
          )}
        </Fragment>
      )}
    </HandleLoading>
  );
};

const DoctorCardWithSessions = ({
  node,
}: {
  node: IDoctorProfile<{ MainSpecialityPopulated: true }>;
}) => {
  const getContent = useLocale();

  return (
    <li className={classes.main}>
      <div className={classes.avatar}>
        <Image
          alt={getDoctorProfileLabel(node)}
          src={imagePath(node.avatar)}
          fill
          sizes="10rem"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.details}>
        <div className={classes.header}>
          <h2 className={classes.name}>
            <Link href={`/doctor/${node.slug || node._id}`}>
              {getDoctorProfileLabel(node)}
            </Link>
          </h2>
          {
            //TODO: calculate this
          }
          <div className={classes.recommendation}>
            <Ixon width="1rem" className={classes.thumbsUp}>
              <HandThumUpIcon />
            </Ixon>
            <span>98% {getContent("usersSuggestionRate")}</span>
          </div>
        </div>
        <div className={classes.second}>
          {node.mainSpeciality && (
            <Link
              href={`/speciality/${
                node.mainSpeciality.slug || node.mainSpeciality._id
              }`}
              className={classes.speciality}
            >
              {node.mainSpeciality.name}
            </Link>
          )}
          <span className={classes.successRate}>
            <Ixon width=".875rem">
              <CheckCircleIcon />
            </Ixon>
            <span>23490 {getContent("succeededAppointmentsCount")}</span>
          </span>
        </div>
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
        {!!node.address && (
          <div className={classes.address}>
            <Ixon width="1rem">
              <LocationIcon />
            </Ixon>
            <p>{node.address}</p>
          </div>
        )}
        <p className={classes.summary}>{node.introduction}</p>
      </div>
      <Sessions node={node} />
    </li>
  );
};

export default DoctorCardWithSessions;
