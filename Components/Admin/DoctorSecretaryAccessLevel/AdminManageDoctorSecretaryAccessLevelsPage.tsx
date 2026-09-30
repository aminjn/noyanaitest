"use client";

import useSWR from "swr";
import classes from "./AdminManageDoctorSecretaryAccessLevelsPage.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import CreateDoctorSecretaryAccessLevelPopup from "./CreateDoctorSecreatryAccessLevelPopup";
import Table from "../UI/Table";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import IconLink from "../UI/IconLink";
import DeleteDoctorSecretaryAccessLevelPopup from "./DeleteDoctorSecretaryAccessLevelPopup";
import { Dictionary } from "@/Components/DoctorPanel/Clinic/DoctorJoinClinicsTab";
import { ta } from "@/Components/Admin/i18n/adminText";

export type IDoctorSecretaryAccessLevel = MongoDoc & {
  name?: string;
  owner?: IDoctorProfile;
} & Partial<Record<DoctorSecretaryAction, boolean>>;

export const doctorSecretaryActions = [
  "readClinics",
  "leaveClinics",
  "joinClinic",
  "mutateJoinClinic",
  "clinicAddition",
  "readCalendar",
  "mutateCalendar",
  "readSettings",
  "mutateSettings",
] as const;

export type DoctorSecretaryAction = (typeof doctorSecretaryActions)[number];

export const doctorSecretaryActionCategories = [
  "clinic",
  "calendar",
  "settings",
] as const;

export type DoctorSecretaryActionCategory =
  (typeof doctorSecretaryActionCategories)[number];

export const doctorSecretaryActionCategoriesDict: Dictionary<DoctorSecretaryActionCategory> =
  { get clinic() {
  return ta("کلینیک");
}, get calendar() {
  return ta("تقویم نوبت دهی");
}, get settings() {
  return ta("تنظیمات");
} };

export const categorizedDoctorSecretaryActions: Record<
  DoctorSecretaryActionCategory,
  DoctorSecretaryAction[]
> = {
  clinic: [
    "clinicAddition",
    "joinClinic",
    "leaveClinics",
    "mutateJoinClinic",
    "readClinics",
  ],
  calendar: ["readCalendar", "mutateCalendar"],
  settings: ["readSettings", "mutateSettings"],
} as const;

export const doctorSecretaryActionDict: Dictionary<DoctorSecretaryAction> = {
  get clinicAddition() {
  return ta("درخواست اضافه کردن کلینیک");
},
  get joinClinic() {
  return ta("درخواست عضویت در کلینیک");
},
  get leaveClinics() {
  return ta("خروج از کلینیک");
},
  get mutateJoinClinic() {
  return ta("آپدیت درخواست عضویت در کلینیک");
},
  get readClinics() {
  return ta("دریافت کلینیک ها");
},
  get mutateCalendar() {
  return ta("آپدیت تقویم");
},
  get readCalendar() {
  return ta("دریافت تقویم");
},
  get mutateSettings() {
  return ta("آپدیت تنظیمات");
},
  get readSettings() {
  return ta("دریافت تنظیمات");
},
};

const AdminManageDoctorSecretaryAccessLevelsPage = () => {
  //TODO: should only get $eq : null
  const { data, error, mutate } = useSWR<IDoctorSecretaryAccessLevel[]>(
    `${API}/auto/doctorsecretaryaccesslevel`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("دسترسی های پیش فرض منشی دکتر")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "CreateDoctorSecretaryAccessLevel",
                  <CreateDoctorSecretaryAccessLevelPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            name="AdminManageDoctorSecretaryAccessLevels"
            data={data}
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              permissions: {
                name: ta("تعداد دسترسی ها"),
                value: (node) =>
                  doctorSecretaryActions.filter((action) => node[action])
                    .length,
                filter: "Number",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(
                        `/doctorsecretaryaccesslevel/${node._id}`
                      )}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteDoctorSecretaryAccessLevel",
                          <DeleteDoctorSecretaryAccessLevelPopup
                            mutate={mutate}
                            node={node}
                          />
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

export default AdminManageDoctorSecretaryAccessLevelsPage;
