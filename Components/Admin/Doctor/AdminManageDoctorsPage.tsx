"use client";

import useSWR from "swr";
import classes from "./AdminManageDoctorsPage.module.css";
import { API } from "@/Components/config";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Province } from "@/Components/Enums/Provinces";
import { City, findCity } from "@/Components/Enums/Cities";
import {
  ISpeciality,
  SpecialityPopulation,
} from "../Speciality/AdminManageSpecialitiesPage";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteDoctorPopup from "./DeleteDoctorPopup";
import WithTitle from "../UI/WithTitle";
import CreateDoctorPopup from "./CreateDoctorPopup";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  GalleryItemPopulation,
  IGalleryItem,
} from "./AdminManageDoctorGalleryTab";
import OrderEditor from "../UI/OrderEditor";

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

const AdminManageDoctorsPage = () => {
  const { data, error, mutate } = useSWR<
    IDoctor<{ SpecialityPopulated: Record<never, never> }>[]
  >(`${API}/auto/doctor`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
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
                        <CreateDoctorPopup mutate={mutate} />,
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
                    "—"
                  ),
              },
              city: {
                name: "شهر",
                value: (node) => (node.city ? findCity(node.city) : ""),
                filter: "Multi",
              },
              mobile: {
                name: "موبایل",
                value: (node) => node.mobile,
                filter: "Text",
              },
              active: {
                name: "فعال",
                value: (node) => booleanToValue[`${!!node.active}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={!!node.active} />,
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    _id={node._id}
                    modelName="doctor"
                    value={node.order || 0}
                    mutate={mutate}
                  />
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
                        title="ویرایش"
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("Doctor", "delete") && (
                      <IconButton
                        variant="Danger"
                        title="حذف"
                        onClick={() =>
                          setPopup(
                            "DeleteDoctor",
                            <DeleteDoctorPopup node={node} mutate={mutate} />,
                          )
                        }
                      >
                        <GarbageIcon />
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
