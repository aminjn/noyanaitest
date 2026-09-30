"use client";
import { useState } from "react";
import classes from "./BookingPage2.module.css";
import { DoctorSessionType } from "../DoctorPanel/Calendar/DoctorCalendarDay";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDisease } from "../Admin/Disease/AdminManageDiseasesPage";
import {
  DoctorProfileTier,
  Gender,
  IDoctorProfile,
} from "../DoctorPanel/DoctorPanelPage";
import { ContentKey } from "../Enums/contentKeys";
import { IServiceCategory } from "../Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import { IClinic } from "../Admin/Clinic/AdminManageClinicsPage";
import {
  ICity,
  IDistrict,
  IProvince,
} from "../Admin/Province/AdminManageProvincesPage";
import DoctorBooking from "./DoctorBooking";
import ClinicBooking from "./ClinicBooking";
import PharmacyBooking from "./PharmacyBooking";
import type {
  BookingDescriptionSegment,
  IBookingDescription,
} from "../Admin/BookingDescription/AdminManageBookingDescriptionsPage";

export const bookingNodes = ["doctor", "clinic", "pharmacy"] as const;
export type BookingNode = (typeof bookingNodes)[number];

export const bookingNodesContentKeyDict: Record<BookingNode, ContentKey> = {
  clinic: "clinics",
  doctor: "doctors",
  pharmacy: "pharmacy",
};

export const bookingViews = ["Grid", "List"] as const;

export type BookingView = (typeof bookingViews)[number];

export const bookingSorts = [
  "Best",
  "Worst",
  "MostRecommended",
  "LeastRecommended",
] as const;

export type BookingSort = (typeof bookingSorts)[number];

export type BookingCommon = {
  view: BookingView;
  sort: BookingSort;
  node: BookingNode;
};

export type DoctorBookingOptions = Partial<{
  clinic: IClinic[] | null; //✅
  sessiontype: DoctorSessionType[] | null; //✅;
  location: {
    coords: [number, number];
    radius: number;
  } | null;
  province: IProvince | null;
  city: ICity | null;
  district: IDistrict[] | null;
  speciality: ISpeciality[] | null; //✅
  disease: IDisease[] | null; //✅
  service: IServiceCategory[] | null; //✅
  // "who takes my insurance" (DoctorInsurance)
  insurance: { _id: string; name?: string }[] | null;
  education: DoctorProfileTier[] | null; //✅
  gender: Gender | null; //✅
  date: { start?: Date; end?: Date } | null; //✅
  time: { start?: number; end?: number } | null; //✅
  onlyAvailable: boolean; //✅
  ePresc: boolean;
  query: string;
}>;

export type BookingPageDoctor = IDoctorProfile<{
  MainSpecialityPopulated: Record<never, never>;
  Availabilities: Record<never, never>;
  Province: Record<never, never>;
  City: Record<never, never>;
  District: Record<never, never>;
}>;

const BookingPage2 = ({
  descriptions,
}: {
  descriptions?: Record<BookingDescriptionSegment, IBookingDescription[]>;
}) => {
  const [common, setCommon] = useState<BookingCommon>({
    view: "Grid",
    sort: "Best",
    node: "doctor",
  });

  return (
    <div className={classes.main}>
      {common.node === "doctor" && (
        <DoctorBooking
          common={common}
          setCommon={setCommon}
          descriptions={descriptions?.Doctor}
        />
      )}
      {common.node === "clinic" && (
        <ClinicBooking
          common={common}
          setCommon={setCommon}
          descriptions={descriptions?.Clinic}
        />
      )}
      {common.node === "pharmacy" && (
        <PharmacyBooking
          common={common}
          setCommon={setCommon}
          descriptions={descriptions?.Pharmacy}
        />
      )}
    </div>
  );
};

export default BookingPage2;
