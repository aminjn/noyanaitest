"use client";

import { Fragment, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classes from "./DashboardNotificationsPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import Button from "@/Components/UI/Button";
import Pagination from "@/Components/UI/Pagination";
import Act from "@/Components/UI/Act";
import FormatDate from "@/Components/UI/FormatDate";
import Ixon from "@/Components/UI/Ixon";
import Bell01Icon from "@/Components/Icons/Bell01Icon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import DoubleCheckIcon from "@/Components/Icons/DoubleCheckIcon";
import PushNotificationToggle from "@/Components/Notification/PushNotificationToggle";

const NS: ContentNamespace[] = ["common", "dashboardNotification"];

// mirrors Lib/enums.ts `pageLimit` on the backend
const NOTIFICATIONS_PAGE_LIMIT = 25;

export const notificationSources = ["System", "Admin"] as const;

export type NotificationSource = (typeof notificationSources)[number];

export type NotificationPopulation = Population<{ CreatedBy: UserPopulation }>;

export interface INotification<
  T extends NotificationPopulation = NotificationPopulation,
> extends MongoDoc {
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

const NotificationItem = ({
  node,
  mutate,
}: {
  node: INotification<{ CreatedBy: Record<never, never> }>;
  mutate: () => unknown;
}) => {
  const [isMarking, setIsMarking] = useState<boolean>(false);
  const getContent = useScopedLocale(NS);

  const markRead = () => {
    if (!node.isRead && !isMarking) setIsMarking(true);
  };

  const itemClassName = `${classes.item} ${!node.isRead ? classes.unread : ""}`;

  const inner = (
    <Fragment>
      <span
        className={`${classes.dot} ${!node.isRead ? classes.dotActive : ""}`}
      />
      <div className={classes.body}>
        <div className={classes.itemHead}>
          <span className={classes.itemTitle}>{node.title}</span>
          <FormatDate className={classes.date} value={node.createdAt} />
        </div>
        <p className={classes.message}>{node.message}</p>
      </div>
      {!node.isRead && (
        <Button
          className={classes.readButton}
          mode="Inline"
          size="S"
          isLoading={isMarking}
          leadIcon={<CheckIcon />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            markRead();
          }}
        >
          {getContent("markAsRead")}
        </Button>
      )}
    </Fragment>
  );

  return (
    <Fragment>
      {node.link ? (
        <Link href={node.link} className={itemClassName} onClick={markRead}>
          {inner}
        </Link>
      ) : (
        <div className={itemClassName} onClick={markRead}>
          {inner}
        </div>
      )}
      <Act
        path={isMarking ? `${API}/user/notification/${node._id}/read` : null}
        method="POST"
        onDone={() => {
          setIsMarking(false);
          mutate();
          globalMutate(`${API}/user/notification/unread-count`);
        }}
      />
    </Fragment>
  );
};

const DashboardNotificationsPage = () => {
  const [page, setPage] = useState<number>(1);
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);

  const getContent = useScopedLocale(NS);
  const pathname = usePathname();

  const { data, error, mutate } = useSWR<{
    data: INotification<{ CreatedBy: Record<never, never> }>[];
    total: number;
    page: number;
    unreadCount: number;
  }>(
    `${API}/user/notification?page=${page}${unreadOnly ? "&unread=true" : ""}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.head}>
            <div className={classes.titleBox}>
              <h1 className={classes.title}>{getContent("notifications")}</h1>
              {!!data.unreadCount && (
                <span className={classes.unreadBadge}>{data.unreadCount}</span>
              )}
            </div>
            <div className={classes.headActions}>
              <PushNotificationToggle />
              <Button
                variant={unreadOnly ? "Primary" : "Disable"}
                mode="Fill"
                size="S"
                radius="High"
                onClick={() => {
                  setUnreadOnly((prev) => !prev);
                  setPage(1);
                }}
              >
                {getContent("unreadOnly")}
              </Button>
              <Button
                variant={data.unreadCount ? "Secondary" : "Disable"}
                mode="Outline"
                size="S"
                radius="High"
                leadIcon={<DoubleCheckIcon />}
                isLoading={isMarkingAll}
                onClick={() => {
                  if (!isMarkingAll && data.unreadCount) setIsMarkingAll(true);
                }}
              >
                {getContent("markAllAsRead")}
              </Button>
            </div>
          </div>

          {!!data.data.length ? (
            <div className={classes.list}>
              {data.data.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  node={notification}
                  mutate={mutate}
                />
              ))}
            </div>
          ) : (
            <div className={classes.nothing}>
              <Ixon width="2rem">
                <Bell01Icon />
              </Ixon>
              <span>{getContent("noNotificationsYet")}</span>
            </div>
          )}
          <Pagination
            className={classes.pagination}
            currentPage={page}
            pagesCount={Math.ceil(data.total / NOTIFICATIONS_PAGE_LIMIT)}
            makePath={() => pathname}
            onClickPage={setPage}
          />
          <Act
            path={isMarkingAll ? `${API}/user/notification/read-all` : null}
            method="POST"
            onDone={() => {
              setIsMarkingAll(false);
              mutate();
              globalMutate(`${API}/user/notification/unread-count`);
            }}
          />
        </div>
      )}
    </HandleLoading>
  );
};

export default DashboardNotificationsPage;
