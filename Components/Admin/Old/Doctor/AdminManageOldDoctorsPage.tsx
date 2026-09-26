"use client";

import classes from "./AdminManageOldDoctorsPage.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";

export interface IOldSpeciality extends MongoDoc {
  name: string;
  image?: string;
  featured: boolean;
  order: number;
  summary?: string;
}

export interface IOldBlog extends MongoDoc {
  owner?: IOldDoctor;
  submittedAt: Date;
  status: string;
  publishedAt?: Date;
  name: string;
  slug?: string;
  summary?: string;
  image?: string;
  content?: string;
  mainContent?: string;
  featured: boolean;
  category?: string;
  isBlogs: boolean;
  related: IOldBlog[];
  doctors: IOldDoctor[];
  speciality?: IOldSpeciality;
}

export interface IOldDisease extends MongoDoc {
  name: string;
  description?: string;
  summary?: string;
  symptoms: IOldSymptom[];
  specialities: IOldSpeciality[];
  drugs: IOldDrug[];
  genderSpecific?: string;
  expectedPrognosis?: string;
  image?: string;
  naturalProgression?: string;
  pathophysiology?: string;
  sameAs: IOldDisease[];
  possibleComlplication?: string;
  order: number;
}

export interface IOldDrug extends MongoDoc {
  name: string;
  summary?: string;
  description?: string;
  sideEffects?: string;
  activeIngridient?: string;
  adminstrationRoute?: string;
  alcoholWarning?: string;
  alternateName?: string;
  breastfeedingWarning?: string;
  clinicalPharmacology?: string;
  dosageForm?: string;
  drugUnit?: string;
  foodWarning?: string;
  identifier?: string;
  image?: string;
  overdosage?: string;
  pregnancyWarning?: string;
  prescribingInfo?: string;
  prescriptionStatus?: string;
  warning?: string;
  order: number;
}

export interface IOldPart extends MongoDoc {
  name: string;
  order: number;
}

export interface IOldSymptom extends MongoDoc {
  name: string;
  genderSpecific?: string;
  part: IOldPart[];
  summary?: string;
  description?: string;
  expectedPrognosis?: string;
  image?: string;
  naturalProgression?: string;
  pathophysiology?: string;
  sameAs: IOldSymptom[];
  possibleComplication?: string;
  diseases?: IOldDisease[];
  order: number;
}

export interface IOldUser extends MongoDoc {
  phone: string;
  role: string;
  gender?: string;
  birth?: number;
  name?: string;
  doctor?: IOldDoctor;
  firstName?: string;
  lastName?: string;
  ssid?: string;
  image?: string;
  exactBirth?: Date;
  license: string;
  licenseExpiration?: Date;
  balance: number;
}

export interface IOldDoctor extends MongoDoc {
  name: string;
  link?: string;
  image?: string;
  address?: string;
  landLine?: string;
  mobile?: string;
  speciality?: IOldSpeciality;

  code?: string;

  lng?: number;
  lat?: number;
  hours?: string;
  //New
  awards?: string;
  birthDate?: Date;
  colleagues: IOldDoctor[];
  description?: string;
  summary?: string;
  email?: string;
  user?: IOldUser;
  specialities: IOldSpeciality[];
  images: string[];
  //   availabilities: IAvailability[];
  instagram?: string;
  telegram?: string;
  twitter?: string;
  youtube?: string;
  aparat?: string;
  linkedin?: string;
  province?: string;
  newCity?: string;
  visitation: number;

  order: number;
  active: boolean;
  special: boolean;
  isHome: boolean;
  isMain: boolean;

  newSpecial?: Date;
  newHome?: Date;

  //   closestSession?: IAvailability | null;

  clinic?: string;
  hospital?: string;
}

const AdminManageOldDoctorsPage = () => {
  const { data, error } = useSWR<IOldDoctor[]>(
    `${API}/old/doctor`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          name="AdminManageOldDoctors"
          renderer={{
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            speciality: {
              name: "تخصص",
              value: (node) => node.speciality?.name,
              filter: "Multi",
            },
            code: { name: "کد نظام", value: (node) => node.code, filter: "Text" },
            mobile: {
              name: "موبایل",
              value: (node) => node.mobile,
              filter: "Text",
            },
            city: {
              name: "شهر",
              value: (node) => node.newCity,
              filter: "Multi",
            },
            user: {
              name: "کاربر",
              value: (node) => node.user?.phone,
              filter: "Text",
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldDoctorsPage;
