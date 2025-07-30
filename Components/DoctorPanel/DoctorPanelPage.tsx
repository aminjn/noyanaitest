"use client";

import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { City } from "../Enums/Cities";
import { Province } from "../Enums/Provinces";
import useLocale from "../Hooks/useLocale";
import { IUser, MongoDoc } from "../Hooks/useUser";
import classes from "./DoctorPanelPage.module.css";

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

export const becomeDoctorStatuses = [
  "Pending",
  "Rejected",
  "Approved",
] as const;

export type BecomeDoctorStatus = (typeof becomeDoctorStatuses)[number];

export const becomeDoctorStatusesDict: Record<BecomeDoctorStatus, string> = {
  Approved: "تایید شده",
  Pending: "منتظر تایید",
  Rejected: "رد شده",
};

type BecomeDoctorPopulation = {
  UserPopulated?: boolean;
  SpecialitiesPopulated?: boolean;
};

export interface IBecomeDoctorRequest<
  T extends BecomeDoctorPopulation = BecomeDoctorPopulation
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
  status: BecomeDoctorStatus;
}

type DoctorProfilePopulation = {
  UserPopulated?: boolean;
  SpecialitiesPopulated?: boolean;
  MainSpecialityPopulated?: boolean;
  PhoneConsultSettingsPopulated?: boolean;
};

export interface IDoctorProfile<
  T extends DoctorProfilePopulation = DoctorProfilePopulation
> extends MongoDoc {
  user?: T["UserPopulated"] extends true ? IUser : string;
  firstName?: string;
  lastName?: string;
  ssid?: string;
  gender?: Gender;
  mainSpeciality?: T["MainSpecialityPopulated"] extends true
    ? ISpeciality
    : string;
  specialities: T["SpecialitiesPopulated"] extends true
    ? ISpeciality[]
    : string[];
  medicalSystemTitle?: MedicalSystemTitle;
  medicalSystemCode?: string;
  introduction?: string;
  services: string[];
  achivements: string[];
  website?: string;
  landLine?: string;
  province?: Province;
  city?: City;
  address?: string;
  lat?: number;
  lng?: number;
  phoneConsultSettings?: T["PhoneConsultSettingsPopulated"] extends true
    ? IPhoneConsultSettings | null
    : void;
  active: boolean;
}

type PhoneConsultSettingsPopulation = { DoctorPopulated?: boolean };

export interface IPhoneConsultSettings<
  T extends PhoneConsultSettingsPopulation = PhoneConsultSettingsPopulation
> extends MongoDoc {
  doctor: T["DoctorPopulated"] extends true ? IDoctorProfile : string;
  duration: number;
  price: number;
  active: boolean;
}

const DoctorPanelPage = () => {
  const getContent = useLocale();

  return <p>DoctorPanelPage</p>;
};

export default DoctorPanelPage;
