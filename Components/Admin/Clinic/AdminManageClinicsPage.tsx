"use client";

import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import classes from "./AdminManageClinicsPage.module.css";
import {
  Province,
  provinces,
  provinceSlugs,
} from "@/Components/Enums/Provinces";
import { cities, City } from "@/Components/Enums/Cities";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import CreateClinicPopup from "./CreateClinicPopup";
import Table from "../UI/Table";
import { DoctorPopulation, IDoctor } from "../Doctor/AdminManageDoctorsPage";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import DeleteClinicPopup from "./DeleteClinicPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import {
  DoctorProfilePopulation,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import { getUserLabel } from "../Lib/LabelGetters";
import InlineLink from "../UI/InlineLink";
import {
  ClinicCategoryPopulation,
  IClinicCategory,
} from "../ClinicCategory/AdminManageClinicCategoriesPage";
import {
  CityPopulation,
  DistrictPopulation,
  ICity,
  IDistrict,
  IProvince,
  ProvincePopulation,
} from "../Province/AdminManageProvincesPage";
import {
  ClinicTagPopulation,
  IClinicTag,
} from "../ClinicTag/AdminManageClinicTagsPage";
import {
  IInsurance,
  InsurancePopulation,
} from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import OrderEditor from "../UI/OrderEditor";

// export type Population<T> = { [key in keyof T]?: T[key] | false };

export type Population<T> = { [key in keyof T]?: T[key] | false };
// export type Population<T> = {
//   [key in keyof T]?: T[key] extends true
//     ? Population<Record<never, never>>
//     : T[key] | boolean;
// };

export type ClinicPopulation = Population<{
  DepartmentsPopulated: ClinicDepartmentPopulation;
  DoctorsPopulated: ClinicDoctorPopuplation;
  User: UserPopulation;
  Category?: ClinicCategoryPopulation;
  Province?: ProvincePopulation;
  City: CityPopulation;
  District: DistrictPopulation;
  Tags: ClinicTagPopulation;
  Insurances: InsurancePopulation;
}>;

export interface IClinic<
  T extends ClinicPopulation = ClinicPopulation,
> extends MongoDoc {
  slug?: string;
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  province?: T["Province"] extends ProvincePopulation
    ? IProvince<T["Province"]>
    : string;
  city?: T["City"] extends CityPopulation ? ICity<T["City"]> : string;
  district: T["District"] extends DistrictPopulation
    ? IDistrict<T["District"]>
    : string;
  lat?: number;
  lng?: number;
  image?: string;
  order: number;
  active: boolean;
  departments: T["DepartmentsPopulated"] extends ClinicDepartmentPopulation
    ? IClinicDepartment<T["DepartmentsPopulated"]>[]
    : never;
  doctors: T["DoctorsPopulated"] extends ClinicDoctorPopuplation
    ? IClinicDoctor<T["DoctorsPopulated"]>[]
    : never;
  user?: T["User"] extends UserPopulation ? IUser : string;
  location?: { type: "Point"; coordinates?: [number, number] };
  summary?: string;
  category?: T["Category"] extends ClinicCategoryPopulation
    ? IClinicCategory<T["Category"]>
    : string;
  special: boolean;
  tags: T["Tags"] extends ClinicTagPopulation
    ? IClinicTag<T["Tags"]>[]
    : string[];
  isRoundTheClock: boolean;
  insurances: T["Insurances"] extends InsurancePopulation
    ? IInsurance<T["Insurances"]>[]
    : string[];
  clinicCode?: string;
  personelCount?: number;
  establishment?: string;
  website?: string;
  mail?: string;
  businessTimes?: string;
  services?: string[];
  certificates?: string[];
  averageScore?: number;
  commentCount?: number;
}

export type ClinicDepartmentPopulation = Population<{
  ClinicPopulated: ClinicPopulation;
  DoctorsPopulated: ClinicDoctorPopuplation;
  DoctorsCount: boolean;
}>;

export interface IClinicDepartment<
  T extends ClinicDepartmentPopulation = ClinicDepartmentPopulation,
> extends MongoDoc {
  clinic: T["ClinicPopulated"] extends ClinicPopulation
    ? IClinic<T["ClinicPopulated"]> | null
    : string;
  name?: string;
  description?: string;
  image?: string;
  active: boolean;
  order: number;
  doctors: T["DoctorsPopulated"] extends ClinicDoctorPopuplation
    ? IClinicDoctor<T["DoctorsPopulated"]>[]
    : string[];
  doctorsCount: T["DoctorsCount"] extends true ? number : never;
  summary?: string;
  phone?: string;
}

export type ClinicDoctorPopuplation = Population<{
  ClinicPopulated: ClinicPopulation;
  DepartmentPopulated: ClinicDepartmentPopulation;
  DoctorPopulated: DoctorProfilePopulation;
}>;

export interface IClinicDoctor<
  T extends ClinicDoctorPopuplation = ClinicDoctorPopuplation,
> extends MongoDoc {
  clinic: T["ClinicPopulated"] extends ClinicPopulation
    ? IClinic<T["ClinicPopulated"]> | null
    : string;
  department?: T["DepartmentPopulated"] extends ClinicDepartmentPopulation
    ? IClinicDepartment<T["DepartmentPopulated"]> | null
    : string;
  doctor: T["DoctorPopulated"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["DoctorPopulated"]> | null
    : string;
}

const AdminManageClinicsPage = () => {
  const { data, error, mutate } = useSWR<
    IClinic<{ User: Record<never, never> }>[]
  >(`${API}/auto/clinic`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="کلینیک ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup("CreateClinic", <CreateClinicPopup mutate={mutate} />),
            },
          ]}
        >
          <Table
            data={data}
            renderer={{
              slug: {
                name: "اسلاگ",
                value: (node) => node.slug,
                filter: "Text",
              },
              name: {
                name: "نام",
                filter: "Text",
                value: (node) => node.name || node._id,
                component: (node) => (
                  <InlineLink href={adminPath(`/clinic/${node._id}`)}>
                    {node.name || node._id}
                  </InlineLink>
                ),
              },
              user: {
                name: "یوزر",
                value: (node) => (node.user ? node.user.phone : "ندارد"),
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {getUserLabel(node.user)}
                    </InlineLink>
                  ) : (
                    ""
                  ),
                filter: "Text",
              },
              description: {
                name: "توضیحات",
                filter: "Text",
                value: (node) => node.description,
              },
              address: {
                name: "آدرس",
                value: (node) => node.address,
                filter: "Text",
              },
              phone: {
                name: "تلفن",
                filter: "Text",
                value: (node) => node.phone,
              },
              province: {
                name: "استان",
                value: (node) =>
                  provinces.find((p) => p.slug === node.province)?.name,
                filter: "Multi",
              },
              city: {
                name: "شهر",
                value: (node) => cities.find((c) => c.slug === node.city)?.name,
                filter: "Multi",
              },
              lat: {
                name: "عرض جغرافیایی",
                filter: "Number",
                value: (node) => node.lat,
              },
              lng: {
                name: "طول جغرافیایی",
                value: (node) => node.lng,
                filter: "Number",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    _id={node._id}
                    mutate={mutate}
                    modelName="clinic"
                  />
                ),
              },
              active: {
                name: "فعال؟",
                value: (node) => booleanToValue[`${node.active}`],
                component: (node) => <BooleanToIcon value={node.active} />,
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      variant="Info"
                      href={adminPath(`/clinic/${node._id}`)}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteClinic",
                          <DeleteClinicPopup mutate={mutate} node={node} />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
            name="AdminManageClinics"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageClinicsPage;
