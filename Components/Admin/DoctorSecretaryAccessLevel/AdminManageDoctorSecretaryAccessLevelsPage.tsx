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
import Garbageicon from "@/Components/Icons/GarbageIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import IconLink from "../UI/IconLink";
import DeleteDoctorSecretaryAccessLevelPopup from "./DeleteDoctorSecretaryAccessLevelPopup";
import { Dictionary } from "@/Components/DoctorPanel/Clinic/DoctorJoinClinicsTab";

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
] as const;

export type DoctorSecretaryAction = (typeof doctorSecretaryActions)[number];

export const doctorSecretaryActionCategories = ["clinic", "calendar"] as const;

export type DoctorSecretaryActionCategory =
  (typeof doctorSecretaryActionCategories)[number];

export const doctorSecretaryActionCategoriesDict: Dictionary<DoctorSecretaryActionCategory> =
  { clinic: "کلینیک", calendar: "تقویم نوبت دهی" };

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
};

export const doctorSecretaryActionDict: Dictionary<DoctorSecretaryAction> = {
  clinicAddition: "درخواست اضافه کردن کلینیک",
  joinClinic: "درخواست عضویت در کلینیک",
  leaveClinics: "خروج از کلینیک",
  mutateJoinClinic: "آپدیت درخواست عضویت در کلینیک",
  readClinics: "دریافت کلینیک ها",
  mutateCalendar: "آپدیت تقویم",
  readCalendar: "دریافت تقویم",
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
          title="دسترسی های پیش فرض منشی دکتر"
          actions={[
            {
              title: "جدید",
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
              name: { name: "نام", value: (node) => node.name, filter: "Set" },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(
                        `/doctorsecretaryaccesslevel/${node._id}`
                      )}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
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
                      <Garbageicon />
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
