"use client";

import useSWR from "swr";
import classes from "./AdminManageDoctorsPage.module.css";
import { API } from "@/Components/config";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { findProvince, Province } from "@/Components/Enums/Provinces";
import { City, findCity } from "@/Components/Enums/Cities";
import { ISpeciality } from "../Speciality/AdminManageSpecialitiesPage";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import FormatDate from "@/Components/UI/FormatDate";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import Garbageicon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteDoctorPopup from "./DeleteDoctorPopup";
import WithTitle from "../UI/WithTitle";
import CreateDoctorPopup from "./CreateDoctorPopup";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";

type DoctorPopulation = {
  SpecialityPopulated?: boolean;
  SpecialitiesPopulated?: boolean;
};

export interface IDoctor<T extends DoctorPopulation = DoctorPopulation>
  extends MongoDoc {
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
  linkedin?: string;
  speciality?: T["SpecialityPopulated"] extends true ? ISpeciality : string;
  specialities?: T["SpecialitiesPopulated"] extends true
    ? ISpeciality[]
    : string[];
}

const AdminManageDoctorsPage = () => {
  const { data, error, mutate } = useSWR<
    IDoctor<{ SpecialityPopulated: true }>[]
  >(`${API}/auto/doctor`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="پزشکان"
          actions={
            hasAccess("Doctor", "write")
              ? [
                  {
                    title: "جدید",
                    action: () =>
                      setPopup(
                        "CreateDoctor",
                        <CreateDoctorPopup mutate={mutate} />
                      ),
                  },
                ]
              : undefined
          }
        >
          <Table
            name="AdminManageDoctors"
            data={data}
            renderer={{
              name: {
                name: "نام",
                value: (node) => node.name,
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/doctor/${node._id}`)}>
                    {node.name || node._id}
                  </InlineLink>
                ),
              },
              slug: {
                name: "اسلاگ",
                value: (node) => node.slug,
                filter: "Text",
              },
              code: { name: "کد", value: (node) => node.code, filter: "Text" },
              hours: {
                name: "ساعات کاری",
                value: (node) => node.hours,
                filter: "Text",
              },
              awards: {
                name: "جوائز",
                value: (node) => node.awards,
                filter: "Text",
              },
              birthDate: {
                name: "تاریخ تولد",
                value: (node) =>
                  node.birthDate ? new Date(node.birthDate) : "",
                filter: "Date",
                component: (node) => (
                  <FormatDate value={node.birthDate} time={false} />
                ),
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
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              active: {
                name: "فعال",
                value: (node) => booleanToValue[`${!!node.active}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={!!node.active} />,
              },
              address: {
                name: "آدرس",
                value: (node) => node.address,
                filter: "Text",
              },
              landLine: {
                name: "تلفن ثابت",
                value: (node) => node.landLine,
                filter: "Text",
              },
              mobile: {
                name: "موبایل",
                value: (node) => node.mobile,
                filter: "Text",
              },
              lng: {
                name: "طول جغرافیایی",
                value: (node) => node.lng,
                filter: "Number",
              },
              lat: {
                name: "عرض جغرافیایی",
                value: (node) => node.lat,
                filter: "Number",
              },
              email: {
                name: "ایمیل",
                value: (node) => node.email,
                filter: "Text",
              },
              province: {
                name: "استان",
                value: (node) =>
                  node.province ? findProvince(node.province) : "",
                filter: "Multi",
              },
              city: {
                name: "شهر",
                value: (node) => (node.city ? findCity(node.city) : ""),
                filter: "Multi",
              },
              site: {
                name: "سایت",
                value: (node) => node.site,
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
              speciality: {
                name: "تخصص",
                value: (node) => node.speciality?.name,
                filter: "Multi",
                component: (node) =>
                  node.speciality ? (
                    <InlineLink
                      href={adminPath(`/speciality/${node.speciality._id}`)}
                    >
                      {node.speciality.name}
                    </InlineLink>
                  ) : (
                    ""
                  ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    {hasAccess("Doctor", "readOne") && (
                      <IconLink
                        variant="Info"
                        href={adminPath(`/doctor/${node._id}`)}
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("Doctor", "delete") && (
                      <IconButton
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DeleteDoctor",
                            <DeleteDoctorPopup node={node} mutate={mutate} />
                          )
                        }
                      >
                        <Garbageicon />
                      </IconButton>
                    )}
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDoctorsPage;
