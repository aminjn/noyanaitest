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
import CardWithSession from "./CardWithSession";

export const Sessions = ({ node }: { node: IDoctorProfile }) => {
  const { data, error } = useSWR<{ count: number; _id: string }[]>(
    `${API}/public/doctor/${node._id}/week`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  console.log(data);

  const { user } = useUser();

  const isAvailable = useMemo<boolean>(
    () => !!data?.some((el) => !!el.count),
    [data],
  );

  const getContent = useLocale();

  const ready = useMemo<Record<string, number>>(() => {
    const result: Record<string, number> = {};
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    for (let i = 0; i < 7; ++i) {
      const key = getSessionDateKey(now);
      result[key] = data?.find((el) => el._id === key)?.count || 0;
      now.setDate(now.getDate() + 1);
    }
    return result;
  }, [data]);

  console.log(ready);

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
                        />,
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
  node: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>;
}) => {
  return (
    <CardWithSession
      name={getDoctorProfileLabel(node)}
      image={node.avatar}
      speciality={node.mainSpeciality}
      target={`/dr/${node.slug || node._id}`}
      address={node.address}
      description={node.introduction}
      doctorProfile={node}
    />
  );
};

export default DoctorCardWithSessions;
