import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import BookingHeader from "./BookingHeader";
import classes from "./DoctorBooking.module.css";
import {
  BookingCommon,
  BookingPageDoctor,
  DoctorBookingOptions,
} from "./BookingPage2";
import useDebounce from "../Hooks/useDebounce";
import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import BookingMeta from "./BookingMeta";
import DoctorBookingFilter from "./DoctorBookingFilters";
import DoctorBookinResult from "./DoctorBookingResults";
import BookingLayout from "./BookingLayout";

const DoctorBooking = ({
  common,
  setCommon,
}: {
  common: BookingCommon;
  setCommon: Dispatch<SetStateAction<BookingCommon>>;
}) => {
  const [options, setOptions] = useState<DoctorBookingOptions>({});

  const [debouncedOptions, setDebouncedOptions] =
    useDebounce<DoctorBookingOptions>({
      initialValue: options,
    });

  useEffect(() => {
    setDebouncedOptions({ ...options });
  }, [options, setDebouncedOptions]);

  const params = useMemo(() => {
    const params = new URLSearchParams();
    const options = { ...debouncedOptions };
    params.append("sort", common.sort);
    params.append("page", "1");
    if (!!options.clinic?.length)
      for (const clinic of options.clinic) params.append("clinic", clinic._id);
    if (options.sessiontype?.length)
      for (const sessionType of options.sessiontype)
        params.append("sessiontype", sessionType);
    if (options.location) {
      params.append(
        "location.coords.lat",
        options.location.coords[1].toString(),
      );
      params.append(
        "location.coords.lng",
        options.location.coords[0].toString(),
      );
      params.append("location.radius", options.location.radius.toString());
    }
    if (options.province) params.append("province", options.province._id);
    if (options.city) params.append("city", options.city._id);
    if (options.district?.length)
      for (const district of options.district)
        params.append("district", district._id);
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
  }, [debouncedOptions, common]);

  const { data: data2 } = useSWR<{
    rows: BookingPageDoctor[];
    count: { total: number }[];
  }>(`${API}/public/filterBooking2?${params.toString()}`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  return (
    <Fragment>
      <BookingHeader
        onChange={(e) =>
          setOptions((prev) => ({ ...prev, query: e.target.value }))
        }
      />
      <BookingLayout>
        <DoctorBookingFilter
          options={options}
          setOptions={setOptions}
          common={common}
          setCommon={setCommon}
        />
        <DoctorBookinResult
          common={common}
          setCommon={setCommon}
          data={data2?.rows}
          count={data2?.count?.[0]?.total ?? 0}
          options={options}
          setOptions={setOptions}
        />
      </BookingLayout>
      <BookingMeta
        title="doctorBookingMetaTitle"
        description="doctorBookingMetaDescription"
        label="doctorBookingMetaLabel"
        legend="doctorBookingMetaLegend"
      />
    </Fragment>
  );
};

export default DoctorBooking;
