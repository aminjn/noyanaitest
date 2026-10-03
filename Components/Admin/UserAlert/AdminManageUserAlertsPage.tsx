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
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { getUserLabel } from "../Lib/LabelGetters";
import { adminPath } from "@/Components/helpers/adminPath";
import InlineLink from "../UI/InlineLink";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { FormRenderer } from "../UI/CreateForm";
import MutateUserAlertPopup from "./MutateUserAlertPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

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
  "newVisitDispute",
  "newSmsCampaign",
] as const;

export type UserAlertEvent = (typeof userAlertEvents)[number];

export const userAlertEventLabels: Record<UserAlertEvent, string> = {
  get newTicket() {
  return ta("تیکت جدید");
},
  get newWithdrawalRequest() {
  return ta("درخواست برداشت جدید");
},
  get newBecomeDoctorRequest() {
  return ta("درخواست پزشک شدن");
},
  get newBecomePharmacyRequest() {
  return ta("درخواست داروخانه شدن");
},
  get newBecomeClinicRequest() {
  return ta("درخواست کلینیک شدن");
},
  get newBecomeParaClinicRequest() {
  return ta("درخواست پاراکلینیک شدن");
},
  get newBecomeHospitalRequest() {
  return ta("درخواست بیمارستان شدن");
},
  get newBecomeInsuranceRequest() {
  return ta("درخواست بیمه شدن");
},
  get newClinicAdditionRequest() {
  return ta("درخواست افزودن کلینیک");
},
  get newPharmacyAdditionRequest() {
  return ta("درخواست افزودن داروخانه");
},
  get newHospitalAdditionRequest() {
  return ta("درخواست افزودن بیمارستان");
},
  get newInsuranceAdditionRequest() {
  return ta("درخواست افزودن بیمه");
},
  get newVisitDispute() {
  return ta("اعتراض بیمار به ویزیت حضوری");
},
  get newSmsCampaign() {
  return ta("کمپین پیامکی برای تأیید");
},
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
  ] = { get title() {
  return ta("پوش نوتیفیکیشن - ${1}", [label]);
}, type: "bool" };
  (userAlertToggleFormRenderer as Record<string, unknown>)[
    `sendSMSOn${suffix}`
  ] = { get title() {
  return ta("پیامک - ${1}", [label]);
}, type: "bool" };
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
          title={ta("تنظیمات اطلاع‌رسانی کاربران")}
          actions={[
            {
              title: ta("جدید"),
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
                name: ta("کاربر"),
                value: (node) => (node.user ? getUserLabel(node.user) : ""),
                filter: "Text",
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {getUserLabel(node.user)}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
              },
              push: {
                name: ta("پوش نوتیفیکیشن فعال"),
                value: (node) =>
                  userAlertEvents.filter(
                    (event) => node[`pushNotificationOn${capitalize(event)}`],
                  ).length,
                component: (node) =>
                  ta("${1} از ${2}", [userAlertEvents.filter(
                      (event) => node[`pushNotificationOn${capitalize(event)}`],
                    ).length, userAlertEvents.length]),
                filter: "Number",
              },
              sms: {
                name: ta("پیامک فعال"),
                value: (node) =>
                  userAlertEvents.filter(
                    (event) => node[`sendSMSOn${capitalize(event)}`],
                  ).length,
                component: (node) =>
                  ta("${1} از ${2}", [userAlertEvents.filter(
                      (event) => node[`sendSMSOn${capitalize(event)}`],
                    ).length, userAlertEvents.length]),
                filter: "Number",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/userAlert/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
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
