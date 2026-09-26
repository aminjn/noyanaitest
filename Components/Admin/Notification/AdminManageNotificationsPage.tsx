"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { getUserLabel } from "../Lib/LabelGetters";
import MutateNotificationPopup from "./MutateNotificationPopup";
import DeleteNotificationPopup from "./DeleteNotificationPopup";

export const notificationSources = ["System", "Admin"] as const;

export type NotificationSource = (typeof notificationSources)[number];

export const notificationSourceDict: Record<NotificationSource, string> = {
  System: "سیستم",
  Admin: "ادمین",
};

export type NotificationPopulation = Population<{
  User: UserPopulation;
  CreatedBy: UserPopulation;
}>;

export interface INotification<
  T extends NotificationPopulation = NotificationPopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  title: string;
  message: string;
  source: NotificationSource;
  createdBy?: T["CreatedBy"] extends UserPopulation
    ? IUser<T["CreatedBy"]>
    : string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export type FullNotification = INotification<{
  User: Record<never, never>;
  CreatedBy: Record<never, never>;
}>;

const AdminManageNotificationsPage = () => {
  const { data, error, mutate } = useSWR<FullNotification[]>(
    `${API}/auto/notification`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="اعلان‌ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateNotification",
                  <MutateNotificationPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageNotifications"
            data={data}
            renderer={{
              title: {
                name: "عنوان",
                value: (node) => node.title,
                filter: "Text",
              },
              user: {
                name: "کاربر",
                value: (node) => (node.user ? getUserLabel(node.user) : ""),
                filter: "Text",
              },
              source: {
                name: "منبع",
                value: (node) => notificationSourceDict[node.source],
                filter: "Set",
              },
              isRead: {
                name: "خوانده شده",
                value: (node) => (node.isRead ? "بله" : "خیر"),
                filter: "Set",
              },
              createdAt: {
                name: "تاریخ ارسال",
                value: (node) => new Date(node.createdAt),
                filter: "Date",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title="ویرایش"
                      onClick={() =>
                        setPopup(
                          "MutateNotification",
                          <MutateNotificationPopup mutate={mutate} node={node} />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      title="حذف"
                      onClick={() =>
                        setPopup(
                          "DeleteNotification",
                          <DeleteNotificationPopup mutate={mutate} node={node} />,
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

export default AdminManageNotificationsPage;
