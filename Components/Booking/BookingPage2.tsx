"use client";
import { useEffect, useMemo, useState } from "react";
import useLocale from "../Hooks/useLocale";
import AdjustmentHorizontalIcon from "../Icons/AdjustmentHorizontalIcon";
import MapIcon from "../Icons/MapIcon";
import SearchIcon from "../Icons/SearchIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import BookingFilter from "./BookingFilters";
import BookingHeader from "./BookingHeader";
import BookingMeta from "./BookingMeta";
import classes from "./BookingPage2.module.css";
import BookingResults from "./BookingResults";
import { DoctorSessionType } from "../DoctorPanel/Calendar/DoctorCalendarDay";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import { DoctorProfileTier, Gender } from "../DoctorPanel/DoctorPanelPage";
import { ContentKey } from "../Enums/contentKeys";
import { IServiceCategory } from "../Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useDebounce from "../Hooks/useDebounce";

export const bookingNodes = ["doctor", "clinic"] as const;
export type BookingNode = (typeof bookingNodes)[number];

export const bookingNodesContentKeyDict: Record<BookingNode, ContentKey> = {
  clinic: "clinics",
  doctor: "doctors",
};

export const bookingViews = ["Grid", "List"] as const;

export type BookingView = (typeof bookingViews)[number];

export const bookingSorts = ["Best", "Worst"] as const;

export type BookingSort = (typeof bookingSorts)[number];

export type BookingOptions = Partial<{
  node: BookingNode | null;
  clinic: IClinic[] | null; //✅
  sessiontype: DoctorSessionType[] | null; //✅;
  location: {
    min: { lat: number; lng: number };
    max: { lat: number; lng: number };
  } | null;
  district: string[] | null;
  speciality: ISpeciality[] | null; //✅
  disease: IDisease[] | null; //✅
  service: IServiceCategory[] | null; //✅
  education: DoctorProfileTier[] | null; //✅
  gender: Gender | null; //✅
  date: { start?: Date; end?: Date } | null; //✅
  time: { start?: number; end?: number } | null; //✅
  onlyAvailable: boolean; //✅
  ePresc: boolean;
  query: string;
}> & { view: BookingView; sort: BookingSort };

const BookingPage2 = () => {
  const getContent = useLocale();

  const [options, setOptions] = useState<BookingOptions>({
    view: "Grid",
    sort: "Best",
  });

  const [debouncedOptions, setDebouncedOptions] = useDebounce<BookingOptions>({
    initialValue: options,
  });

  useEffect(() => {
    setDebouncedOptions({ ...options });
  }, [options, setDebouncedOptions]);

  const params = useMemo(() => {
    const params = new URLSearchParams();
    const options = { ...debouncedOptions };
    if (options.node) params.append("node", options.node);
    if (!!options.clinic?.length)
      for (const clinic of options.clinic) params.append("clinic", clinic._id);
    if (options.sessiontype?.length)
      for (const sessionType of options.sessiontype)
        params.append("sessiontype", sessionType);
    if (options.location) {
      params.append("location.min.lat", options.location.min.lat.toString());
      params.append("location.min.lng", options.location.min.lng.toString());
      params.append("location.max.lat", options.location.max.lat.toString());
      params.append("location.max.lng", options.location.max.lng.toString());
    }
    if (options.district?.length)
      for (const district of options.district)
        params.append("district", district);
    if (options.speciality?.length)
      for (const speciality of options.speciality)
        params.append("speciality", speciality._id);
    if (options.disease?.length)
      for (const disease of options.disease)
        params.append("disease", disease._id);
    if (options.service?.length)
      for (const service of options.service)
        params.append("service", service._id);
    if (options.education?.length)
      for (const tier of options.education) params.append("tier", tier);
    if (options.gender) params.append("gender", options.gender);
    if (options.date) {
      if (options.date.start)
        params.append("date.start", options.date.start.getTime().toString());
      if (options.date.end)
        params.append("date.end", options.date.end.getTime().toString());
    }
    if (options.time) {
      if (options.time.start)
        params.append("time.start", options.time.start.toString());
      if (options.time.end)
        params.append("time.end", options.time.end.toString());
    }
    if (options.onlyAvailable) params.append("onlyAvailable", "true");
    if (options.ePresc) params.append("ePresc", "true");
    if (options.query) params.append("query", options.query);
    return params;
  }, [debouncedOptions]);

  const { data, error, mutate } = useSWR(
    `${API}/public/filterBooking?${params.toString()}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  console.log(data);

  return (
    <div className={classes.main}>
      <BookingHeader options={options} setOptions={setOptions} />
      <div className={classes.content}>
        <BookingFilter options={options} setOptions={setOptions} />
        <BookingResults data={data} options={options} setOptions={setOptions} />
      </div>
      <BookingMeta />
    </div>
  );
};

export default BookingPage2;
