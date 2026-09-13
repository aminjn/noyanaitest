"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IUser, MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { getUserLabel } from "../Lib/LabelGetters";
import { adminPath } from "@/Components/helpers/adminPath";
import InlineLink from "../UI/InlineLink";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { FormRenderer } from "../UI/CreateForm";
import MutateUserAlertPopup from "./MutateUserAlertPopup";

// Every entry here is one event a staff account (role !== "user", i.e.
// "admin"/"notadmin") can be alerted about. Kept in sync with
// `userAlertEvents` in Models/UserAlert.ts on noyanai-back - adding an
// event to both arrays (and a label here) is the only change needed for a
// push/SMS toggle pair to show up in this admin page. Each event also gets
// its own SMS pattern field on AdminManageSmsPatternsPage.tsx (2026-09
// audit finding: staff alerts used to all share one generic pattern) - see
// that file's smsPatternNameForEvent, which mirrors the backend's
// Models/UserAlert.ts helper of the same name.
export const userAlertEvents = [
  "newTicket",
  "newWithdrawalRequest",
  "newBecomeDoctorRequest",
  "newBecomePharmacyRequest",
  "newBecomeClinicRequest",
  "newBecomeParaClinicRequest",
  "newBecomeHospitalRequest",
  "newBecomeInsuranceRequest",
  "newClinicAdditionRequest",
  "newPharmacyAdditionRequest",
  "newHospitalAdditionRequest",
  "newInsuranceAdditionRequest",
] as const;

export type UserAlertEvent = (typeof userAlertEvents)[number];

export const userAlertEventLabels: Record<UserAlertEvent, string> = {
  newTicket: "تیکت جدید",
  newWithdrawalRequest: "درخواست برداشت جدید",
  newBecomeDoctorRequest: "درخواست پزشک شدن",
  newBecomePharmacyRequest: "درخواست داروخانه شدن",
  newBecomeClinicRequest: "درخواست کلینیک شدن",
  newBecomeParaClinicRequest: "درخواست پاراکلینیک شدن",
  newBecomeHospitalRequest: "درخواست بیمارستان شدن",
  newBecomeInsuranceRequest: "درخواست بیمه شدن",
  newClinicAdditionRequest: "درخواست افزودن کلینیک",
  newPharmacyAdditionRequest: "درخواست افزودن داروخانه",
  newHospitalAdditionRequest: "درخواست افزودن بیمارستان",
  newInsuranceAdditionRequest: "درخواست افزودن بیمه",
};

const capitalize = <T extends string>(value: T) =>
  (value.charAt(0).toUpperCase() + value.slice(1)) as Capitalize<T>;

export type UserAlertToggleFields = {
  [K in UserAlertEvent as `pushNotificationOn${Capitalize<K>}`]: boolean;
} & {
  [K in UserAlertEvent as `sendSMSOn${Capitalize<K>}`]: boolean;
};

export type UserAlertPopulation = { UserPopulated?: boolean };

export interface IUserAlert<
  T extends UserAlertPopulation = UserAlertPopulation,
> extends MongoDoc,
    UserAlertToggleFields {
  user: T["UserPopulated"] extends true ? IUser : string;
}

export type FullUserAlert = IUserAlert<{ UserPopulated: true }>;

// Built once from userAlertEvents above, so the create/edit popup always has
// exactly one push + one SMS toggle per event without listing them by hand.
export const userAlertToggleFormRenderer =
  {} as FormRenderer<UserAlertToggleFields>;

for (const event of userAlertEvents) {
  const suffix = capitalize(event);
  const label = userAlertEventLabels[event];
  (userAlertToggleFormRenderer as Record<string, unknown>)[
    `pushNotificationOn${suffix}`
  ] = { title: `پوش نوتیفیکیشن - ${label}`, type: "bool" };
  (userAlertToggleFormRenderer as Record<string, unknown>)[
    `sendSMSOn${suffix}`
  ] = { title: `پیامک - ${label}`, type: "bool" };
}

const AdminManageUserAlertsPage = () => {
  const { data, error, mutate } = useSWR<FullUserAlert[]>(
    `${API}/auto/userAlert`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="تنظیمات اطلاع‌رسانی کاربران"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateUserAlert",
                  <MutateUserAlertPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageUserAlerts"
            data={data}
            renderer={{
              user: {
                name: "کاربر",
                value: (node) => getUserLabel(node.user),
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                    {getUserLabel(node.user)}
                  </InlineLink>
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/userAlert/${node._id}`)}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "Delete",
                          <DeleteShitPopup
                            mutate={mutate}
                            modelName="userAlert"
                            nodeId={node._id}
                          />,
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

export default AdminManageUserAlertsPage;
