"use client";

import useSWR from "swr";
import classes from "./BookingPage.module.css";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import useLocale from "../Hooks/useLocale";
import DoctorCardWithSessions from "./DoctorCardWithSessions";
import { Fragment } from "react";
import DoctorsCardList from "./DoctorsCardList";
import WithSideMap from "./WithSideMap";

const BookingPage = () => {
  const { data, error } = useSWR<
    IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[]
  >(`${API}/public/booking`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithSideMap>
          <Fragment>
            <h1>{getContent("booking")}</h1>
            <DoctorsCardList>
              {data.map((doc) => (
                <DoctorCardWithSessions key={doc._id} node={doc} />
              ))}
            </DoctorsCardList>
          </Fragment>
        </WithSideMap>
      )}
    </HandleLoading>
  );
};

export default BookingPage;
