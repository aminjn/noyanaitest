"use client";

import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import {
  GalleryItemPopulation,
  IGalleryItem,
} from "../Admin/Doctor/AdminManageDoctorGalleryTab";
import {
  CityPopulation,
  DistrictPopulation,
  ICity,
  IDistrict,
  IProvince,
  ProvincePopulation,
} from "../Admin/Province/AdminManageProvincesPage";
import {
  ISpeciality,
  SpecialityPopulation,
} from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { City } from "../Enums/Cities";
import { Province } from "../Enums/Provinces";
import useBreadCrump from "../Hooks/useBreadCrump";
import useLocale from "../Hooks/useLocale";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import { IMcCode, McCodepopulation } from "./BecomeADoctorPage";
import classes from "./DoctorPanelPage.module.css";
import { IOffice, OfficePopulation } from "./Office/DoctorManageOfficesPage";
import {
  DoctorSocialMediaPopulation,
  IDoctorSocialMedia,
} from "./Profile/DoctorManageSocialMediaTab";

export const genders = ["male", "female"] as const;

export type Gender = (typeof genders)[number];

export const genderDict: Record<Gender, string> = { female: "زن", male: "مرد" };

export const medicalSystemTitles = [
  "دندانپزشکی",
  "پزشکی",
  "مامایی",
  "داروسازی",
  "تغذیه",
  "فیزیوتراپی",
  "آزمایشگاهی (بالینی)",
  "گفتار درمانی",
  "کاردرمانی",
  "بینایی سنجی",
  "شنوایی سنجی",
  "علوم آزمایشگاهی",
  "ارتز و پروتز",
  "اتباع خارجی",
  "کایروپراکتیک",
  "ناتروپاتی",
] as const;

export type MedicalSystemTitle = (typeof medicalSystemTitles)[number];

export const becomeNodeStatuses = ["Pending", "Rejected", "Approved"] as const;

export type BecomeANodeStatus = (typeof becomeNodeStatuses)[number];

export const becomeNodeStatusesDict: Record<BecomeANodeStatus, string> = {
  Approved: "تایید شده",
  Pending: "منتظر تایید",
  Rejected: "رد شده",
};

type BecomeDoctorPopulation = {
  UserPopulated?: boolean;
  SpecialitiesPopulated?: boolean;
};

export interface IBecomeDoctorRequest<
  T extends BecomeDoctorPopulation = BecomeDoctorPopulation,
> extends MongoDoc {
  user: T["UserPopulated"] extends true ? IUser : string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  ssid: string;
  gender: Gender;
  medicalSystemTitle: MedicalSystemTitle;
  medicalSystemCode: string;
  specialities: T["SpecialitiesPopulated"] extends true
    ? ISpeciality[]
    : string[];
  province: Province;
  city: City;
  address: string;
  description?: string;
  status: BecomeANodeStatus;
}

export type DoctorProfilePopulation = Population<{
  UserPopulated: UserPopulation;
  SpecialitiesPopulated?: SpecialityPopulation;
  MainSpecialityPopulated?: SpecialityPopulation;
  PhoneConsultSettingsPopulated?: PhoneConsultSettingsPopulation;
  Mc: McCodepopulation;
  Gallery: GalleryItemPopulation;
  Offices: OfficePopulation;
  Socials: DoctorSocialMediaPopulation;
  Province: ProvincePopulation;
  City: CityPopulation;
  District: DistrictPopulation;
}>;

export const doctorProfileTiers = [
  "expert",
  "specialist",
  "superSpecialist",
] as const;
export type DoctorProfileTier = (typeof doctorProfileTiers)[number];

export interface IDoctorProfile<
  T extends DoctorProfilePopulation = DoctorProfilePopulation,
> extends MongoDoc {
  user?: T["UserPopulated"] extends UserPopulation
    ? IUser<T["UserPopulated"]>
    : string;
  mcCode?: T["Mc"] extends McCodepopulation ? IMcCode<T["Mc"]> : string;
  firstName?: string;
  lastName?: string;
  ssid?: string;
  gender?: Gender;
  tier?: DoctorProfileTier;
  mainSpeciality?: T["MainSpecialityPopulated"] extends SpecialityPopulation
    ? ISpeciality<T["MainSpecialityPopulated"]>
    : string;
  specialities: T["SpecialitiesPopulated"] extends SpecialityPopulation
    ? ISpeciality<T["SpecialitiesPopulated"]>[]
    : string[];
  medicalSystemTitle?: MedicalSystemTitle;
  medicalSystemCode?: string;
  introduction?: string;
  services: string[];
  achivements: string[];
  website?: string;
  landLine?: string;
  province?: T["Province"] extends ProvincePopulation
    ? IProvince<T["Province"]>
    : string;
  city?: T["City"] extends CityPopulation ? ICity<T["City"]> : string;
  district?: T["District"] extends DistrictPopulation
    ? IDistrict<T["District"]>
    : string;
  address?: string;
  lat?: number;
  lng?: number;
  phoneConsultSettings?: T["PhoneConsultSettingsPopulated"] extends PhoneConsultSettingsPopulation
    ? IPhoneConsultSettings<T["PhoneConsultSettingsPopulated"]> | null
    : void;
  active: boolean;
  order: number;
  avatar?: string;
  slug?: string;
  location?: { type: "Point"; coordinates: [number, number] };
  gallery: T["Gallery"] extends GalleryItemPopulation
    ? IGalleryItem<boolean, T["Gallery"]>[]
    : never;
  offices: T["Offices"] extends OfficePopulation
    ? IOffice<T["Offices"]>[]
    : never;
  socials: T["Socials"] extends DoctorSocialMediaPopulation
    ? IDoctorSocialMedia<T["Socials"]>[]
    : never;
  popular: boolean;
}

type PhoneConsultSettingsPopulation = { DoctorPopulated?: boolean };

export interface IPhoneConsultSettings<
  T extends PhoneConsultSettingsPopulation = PhoneConsultSettingsPopulation,
> extends MongoDoc {
  doctor: T["DoctorPopulated"] extends true ? IDoctorProfile : string;
  duration: number;
  price: number;
  active: boolean;
}

const DoctorPanelPage = () => {
  const getContent = useLocale();

  useBreadCrump([{ title: getContent("dashboard"), target: "/doctorpanel" }]);

  return <p>DoctorPanelPage</p>;
};

export default DoctorPanelPage;
