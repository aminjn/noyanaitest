"use client";

import useSWR from "swr";
import classes from "./AdminManageAccessLevelsPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import CreateAccessLevelPopup from "./CreateAccessLevelPopup";
import Table from "../UI/Table";
import { IUser, MongoDoc } from "@/Components/Hooks/useUser";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteAccessLevelPopup from "./DeleteAccessLevelPopup";
import {
  IUserAccessLevel,
  UserAccessLevelPopulation,
} from "./AccessLevelAdminsTab";

export const accessOperations = [
  "readAll",
  "readOne",
  "write",
  "update",
  "delete",
] as const;

export type AccessOperation = (typeof accessOperations)[number];

export const accessLevelOperationsDict: { [key in AccessOperation]: string } = {
  delete: "حذف",
  readAll: "خواندن همه",
  readOne: "خواندن یکی",
  update: "به روز رسانی",
  write: "نوشتن",
};

type Access = { [key in AccessOperation]?: boolean };

export const accessLevelModels = [
  "BecomeDoctorRequest",
  "BecomeClinicRequest",
  "BecomePharmacyRequest",
  "BecomeInsuranceRequest",
  "Blog",
  "BlogCategory",
  "BlogMedia",
  "Comment",
  "Doctor",
  "DoctorProfile",
  "GalleryItem",
  "InlineAdvertisement",
  "Sepciality",
  "TextContent",
  "User",
  "Clinic",
  "ClinicDepartment",
  "ClinicDoctor",
  "DoctorJoinClinic",
  "ClinicAdditionRequest",
  "DoctorSeretaryAccessLevel",
  "Insurance",
  "InsuranceAdditionRequest",
  "Pharmacy",
  "CallRoom",
  "Redirection",
  "ShortLink",
  "Disease",
  "Drug",
  "Symptom",
  "Part",
  "DoctorFaq",
  "Hospital",
  "HospitalDepartment",
  "HospitalDoctor",
  "DoctorJoinHospital",
  "HospitalAdditionRequest",
  "BecomeHospitalRequest",
  "ParaClinic",
  "BecomeParaClinicRequest",
  "PharmacyAdditionRequest",
] as const;

export type AccessLevelModel = (typeof accessLevelModels)[number];

export const accessLevelModelDict: { [key in AccessLevelModel]: string } = {
  BecomeDoctorRequest: "درخواست پزشک شدن",
  BecomeClinicRequest: "درخواست کلینیک شدن",
  BecomeInsuranceRequest: "درخواست بیمه شدن",
  BecomePharmacyRequest: "درخواست داروخانه شدن",
  Blog: "مقالات",
  BlogCategory: "دسته بندی مقالات",
  BlogMedia: "مولتی مدیا وبلاگ",
  Comment: "نظرات",
  Doctor: "پزشک",
  DoctorProfile: "پروفایل پزشک",
  GalleryItem: "گالری پزشک",
  InlineAdvertisement: "تبلیغات",
  Sepciality: "تخصص ها",
  TextContent: "دیکشنری",
  User: "کاربر",
  Clinic: "کلینیک",
  ClinicDepartment: "دپارتمان کلینیک",
  ClinicDoctor: "ارتباط بین پزشک و کلینیک",
  DoctorJoinClinic: "درخواست عضویت پزشکان در کلینیک",
  ClinicAdditionRequest: "درخواست اضافه شدن کلینیک",
  DoctorSeretaryAccessLevel: "دسترسی پیش فرض منشی دکتر",
  Insurance: "بیمه",
  InsuranceAdditionRequest: "درخواست اضافه شدن بیمه",
  Pharmacy: "داروخانه و آزمایشگاه",
  CallRoom: "تماس",
  ShortLink: "لینک کوتاه",
  Redirection: "انتقالات",
  Disease: "بیماری",
  Drug: "دارو",
  Symptom: "علائم",
  Part: "اعضای بدن",
  DoctorFaq: "سوالات متداول پزشکان",
  Hospital: "بیمارستان",
  HospitalDepartment: "دپارتمان بیمارستان",
  HospitalDoctor: "ارتباط بین پزشک و بیمارستان",
  DoctorJoinHospital: "درخواست عضویت پزشکان در بیمارستان",
  HospitalAdditionRequest: "درخواست اضافه شدن بیمارستان",
  BecomeHospitalRequest: "درخواست بیمارستان شدن",
  ParaClinic: "پاراکلینیک",
  BecomeParaClinicRequest: "درخواست پاراکلینیک شدن",
  PharmacyAdditionRequest: "درخواست اضافه شدن داروخانه",
};

type AccessLevelPopuplation = { AdminsPopulated?: UserAccessLevelPopulation };

export type IAccessLevel<
  T extends AccessLevelPopuplation = AccessLevelPopuplation
> = MongoDoc & {
  name: string;
} & {
  [key in AccessLevelModel]?: Access;
} & (T["AdminsPopulated"] extends UserAccessLevelPopulation
    ? {
        admins: IUserAccessLevel<T["AdminsPopulated"]>[];
      }
    : { admins?: never });

const AdminManageAccessLevelsPage = () => {
  const { data, error, mutate } = useSWR<IAccessLevel[]>(
    `${API}/auto/accesslevel`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="سطوح دسترسی"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateAccessLevel",
                  <CreateAccessLevelPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            name="AdminManageAccessLevels"
            data={data}
            renderer={{
              name: {
                name: "نام",
                component: (node) => (
                  <InlineLink href={adminPath(`/accesslevel/${node._id}`)}>
                    {node.name || node._id}
                  </InlineLink>
                ),
                value: (node) => node.name,
                filter: "Text",
              },
              ...accessLevelModels.reduce(
                (acc, model) => ({
                  ...acc,
                  [model]: {
                    name: accessLevelModelDict[model],
                    value: (node: IAccessLevel) =>
                      accessOperations
                        .filter((op) => node[model]?.[op])
                        .map((op) => accessLevelOperationsDict[op])
                        .join(" - "),
                    filter: "Multi",
                  },
                }),
                {}
              ),
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/accesslevel/${node._id}`)}
                      title="ویرایش"
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title="حذف"
                      onClick={() =>
                        setPopup(
                          "DeleteAccessLevel",
                          <DeleteAccessLevelPopup mutate={mutate} node={node} />
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
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

export default AdminManageAccessLevelsPage;
