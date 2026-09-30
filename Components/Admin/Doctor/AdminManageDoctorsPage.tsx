// Types of the legacy `Doctor` model (Models/Doctor.ts in the backend).
// The admin UI for it was retired when the doctors directory was merged into
// doctor profiles (2026-09, /notadmin/doctor redirects to /doctorprofile);
// only these types are still imported (clinic/hospital doctor links, label
// getters, the clone-from-doctor popup).
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Province } from "@/Components/Enums/Provinces";
import { City } from "@/Components/Enums/Cities";
import {
  ISpeciality,
  SpecialityPopulation,
} from "../Speciality/AdminManageSpecialitiesPage";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  GalleryItemPopulation,
  IGalleryItem,
} from "./AdminManageDoctorGalleryTab";

export type DoctorPopulation = Population<{
  SpecialityPopulated?: SpecialityPopulation;
  SpecialitiesPopulated?: SpecialityPopulation;
  Gallery?: GalleryItemPopulation;
}>;

export interface IDoctor<
  T extends DoctorPopulation = DoctorPopulation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  image?: string;
  code?: string;
  hours?: string;
  awards?: string;
  birthDate?: Date;
  description?: string;
  summary?: string;
  images?: string[];
  order?: number;
  active?: boolean;
  address?: string;
  landLine?: string;
  mobile?: string;
  lng?: number;
  lat?: number;
  email?: string;
  province?: Province;
  city?: City;
  site?: string;
  telegram?: string;
  twitter?: string;
  youtube?: string;
  aparat?: string;
  instagram?: string;
  linkedin?: string;
  speciality?: T["SpecialityPopulated"] extends SpecialityPopulation
    ? ISpeciality<T["SpecialityPopulated"]>
    : string;
  specialities?: T["SpecialitiesPopulated"] extends SpecialityPopulation
    ? ISpeciality<T["SpecialitiesPopulated"]>[]
    : string[];
  gallery?: T["Gallery"] extends GalleryItemPopulation
    ? IGalleryItem<boolean, T["Gallery"]>[]
    : never;
}
