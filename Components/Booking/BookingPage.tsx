"use client";

import useSWR from "swr";
import classes from "./BookingPage.module.css";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import useLocale from "../Hooks/useLocale";
import DoctorCardWithSessions from "./DoctorCardWithSessions";

const BookingPage = () => {
  const { data, error } = useSWR<
    IDoctorProfile<{ MainSpecialityPopulated: true }>[]
  >(`${API}/public/booking`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <h1>{getContent("booking")}</h1>
          <ul className={classes.list}>
            {data.map((doc) => (
              <DoctorCardWithSessions key={doc._id} node={doc} />
            ))}
          </ul>
        </div>
      )}
    </HandleLoading>
  );
};

export default BookingPage;
