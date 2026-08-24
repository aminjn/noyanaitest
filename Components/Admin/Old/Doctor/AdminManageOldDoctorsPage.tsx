"use client";

import classes from "./AdminManageOldDoctorsPage.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import Table from "../../UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import OrderEditor from "../../UI/OrderEditor";

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
            _id: { name: "آی دی", value: (node) => node._id, filter: "Text" },
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            link: { name: "لینک", value: (node) => node.link, filter: "Text" },
            address: {
              name: "آدرس",
              value: (node) => node.address,
              filter: "Text",
            },
            landLine: {
              name: "شماره ثابت",
              value: (node) => node.landLine,
              filter: "Text",
            },
            mobile: {
              name: "موبایل",
              value: (node) => node.mobile,
              filter: "Text",
            },
            //sepciality
            speciality: {
              name: "تخصص",
              value: (node) => node.speciality?.name,
              filter: "Multi",
            },
            code: { name: "کد", value: (node) => node.code, filter: "Text" },
            lng: { name: "LNG", value: (node) => node.lng, filter: "Number" },
            lat: { name: "LAT", value: (node) => node.lat, filter: "Number" },
            hours: {
              name: "ساعت ها",
              value: (node) => node.hours,
              filter: "Text",
            },
            awards: {
              name: "جوائز",
              value: (node) => node.awards,
              filter: "Set",
            },
            birthDate: {
              name: "تاریخ تولد",
              value: (node) => (node.birthDate ? new Date(node.birthDate) : ""),
              component: (node) =>
                node.birthDate ? (
                  <FormatDate value={new Date(node.birthDate)} />
                ) : (
                  ""
                ),
              filter: "Date",
            },
            description: {
              name: "توضیحات",
              value: (node) => node.description,
              filter: "Text",
            },
            summary: {
              name: "خلاصه",
              value: (node) => node.summary,
              filter: "Text",
            },
            email: {
              name: "ایمیل",
              value: (node) => node.email,
              filter: "Text",
            },
            user: {
              name: "یوزر",
              value: (node) => node.user?.phone,
              filter: "Set",
            },
            instagram: {
              name: "اینستاگرام",
              value: (node) => node.instagram,
              filter: "Text",
            },
            telegram: {
              name: "تلگرام",
              value: (node) => node.telegram,
              filter: "Text",
            },
            twitter: {
              name: "توییتر",
              value: (node) => node.twitter,
              filter: "Text",
            },
            youtube: {
              name: "یوتیوب",
              value: (node) => node.youtube,
              filter: "Text",
            },
            aparat: {
              name: "آپارات",
              value: (node) => node.aparat,
              filter: "Text",
            },
            linkedin: {
              name: "لینکدین",
              value: (node) => node.linkedin,
              filter: "Text",
            },
            province: {
              name: "استان",
              value: (node) => node.province,
              filter: "Multi",
            },
            city: {
              name: "شهر",
              value: (node) => node.newCity,
              filter: "Multi",
            },
            order: {
              name: "رتبه",
              value: (node) => node.order,
              filter: "Number",
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldDoctorsPage;
