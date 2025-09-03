"use client";

import { useParams } from "next/navigation";
import classes from "./DashboardManageBookingPage.module.css";
import useSWR from "swr";
import { IBooking } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";

const DashboardManageBookingPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error } = useSWR<IBooking>(
    `${API}/user/booking/${params.nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  return <p>DashboardManageBookingPage</p>;
};

export default DashboardManageBookingPage;
