"use client";
import { TEHRAN_TZ, tehranTodayYmd, tehranYmd } from "@/Components/helpers/tehranTime";

import { Fragment, useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import Link from "@/Components/i18n/Link";
import { usePathname, useIntlLocale } from "@/Components/i18n/navigation";
import classes from "./DashboardNotificationsPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import Pagination from "@/Components/UI/Pagination";
import Act from "@/Components/UI/Act";
import Ixon from "@/Components/UI/Ixon";
import Bell01Icon from "@/Components/Icons/Bell01Icon";
import SparkIcon from "@/Components/Icons/SparkIcon";
import InitialAvatar from "@/Components/UI/InitialAvatar";
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

// "2 hours ago" for the last day, then the clock time (the day is the
// group heading)
const useWhen = () => {
  const intlTag = useIntlLocale();
  return useMemo(() => {
    const rel = new Intl.RelativeTimeFormat(intlTag, { numeric: "auto", style: "short" });
    const time = new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, hour: "2-digit", minute: "2-digit" });
    return (value: Date | string) => {
      const d = new Date(value);
      const mins = Math.round((Date.now() - d.getTime()) / 6e4);
      if (mins < 60) return rel.format(-Math.max(mins, 0), "minute");
      if (mins < 24 * 60) return rel.format(-Math.round(mins / 60), "hour");
      return time.format(d);
    };
  }, [intlTag]);
};

const NotificationItem = ({
  node,
  mutate,
}: {
  node: INotification<{ CreatedBy: Record<never, never> }>;
  mutate: () => unknown;
}) => {
  const [isMarking, setIsMarking] = useState<boolean>(false);
  const getContent = useScopedLocale(NS);
  const when = useWhen();

  const markRead = () => {
    if (!node.isRead && !isMarking) setIsMarking(true);
  };

  const itemClassName = `${classes.item} ${!node.isRead ? classes.unread : ""}`;
  const fromAdmin = node.source === "Admin";

  const inner = (
    <Fragment>
      {fromAdmin ? (
        <InitialAvatar name={getContent("support")} seed="support" size="2.5rem" />
      ) : (
        <span className={`${classes.sourceIcon} glassIcon tone-violet`} aria-hidden>
          <Ixon width="1.125rem">
            <SparkIcon />
          </Ixon>
        </span>
      )}
      <div className={classes.body}>
        <span className={classes.itemTitle}>{node.title}</span>
        {!!node.message && <p className={classes.message}>{node.message}</p>}
        <span className={classes.source}>
          {getContent(fromAdmin ? "support" : "nfSystem")}
          {!!node.createdAt && <span className={classes.date}>{when(node.createdAt)}</span>}
        </span>
      </div>
      {!node.isRead && (
        <button
          type="button"
          className={classes.readButton}
          aria-label={getContent("markAsRead")}
          title={getContent("markAsRead")}
          disabled={isMarking}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            markRead();
          }}
        >
          <span className={classes.dot} aria-hidden />
          <Ixon width="1rem">
            <CheckIcon />
          </Ixon>
        </button>
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

// the Tehran day (Components/helpers/tehranTime.ts)
const dayKey = (d: Date) => tehranYmd(d);

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

  const intlTag = useIntlLocale();
  const groups = useMemo(() => {
    const list = Array.isArray(data?.data) ? data.data : [];
    const rel = new Intl.RelativeTimeFormat(intlTag, { numeric: "auto" });
    const day = new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "long", day: "numeric", month: "long" });
    const today = dayKey(new Date());
    const yesterday = tehranTodayYmd(-1);
    const out: { key: string; label: string; items: typeof list }[] = [];
    for (const n of list) {
      const d = new Date(n.createdAt);
      const key = dayKey(d);
      let g = out.find((x) => x.key === key);
      if (!g) {
        const label = key === today ? rel.format(0, "day") : key === yesterday ? rel.format(-1, "day") : day.format(d);
        g = { key, label, items: [] };
        out.push(g);
      }
      g.items.push(n);
    }
    return out;
  }, [data, intlTag]);

  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <header className={classes.head}>
            <h1 className={classes.title}>{getContent("notifications")}</h1>
            <div className={classes.tabs} role="tablist">
              {[false, true].map((u) => (
                <button
                  key={String(u)}
                  type="button"
                  role="tab"
                  aria-selected={unreadOnly === u}
                  className={`${classes.tab} ${unreadOnly === u ? classes.tabOn : ""}`}
                  onClick={() => {
                    setUnreadOnly(u);
                    setPage(1);
                  }}
                >
                  {getContent(u ? "nfUnreadTab" : "all")}
                  {u && !!data.unreadCount && (
                    <span className={classes.unreadBadge}>{num.format(data.unreadCount)}</span>
                  )}
                </button>
              ))}
            </div>
            <div className={classes.headActions}>
              <PushNotificationToggle />
              {!!data.unreadCount && (
                <button
                  type="button"
                  className={classes.markAll}
                  disabled={isMarkingAll}
                  onClick={() => {
                    if (!isMarkingAll) setIsMarkingAll(true);
                  }}
                >
                  <Ixon width="1rem">
                    <DoubleCheckIcon />
                  </Ixon>
                  {getContent("markAllAsRead")}
                </button>
              )}
            </div>
          </header>

          {groups.length ? (
            <div className={classes.feed}>
              {groups.map((g) => (
                <section key={g.key} className={classes.group}>
                  <h2 className={classes.groupTitle}>{g.label}</h2>
                  <div className={classes.list}>
                    {g.items.map((notification) => (
                      <NotificationItem key={notification._id} node={notification} mutate={mutate} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className={classes.nothing}>
              <span className={`${classes.nothingIcon} glassIcon tone-violet`}>
                <Ixon width="1.75rem">
                  <Bell01Icon />
                </Ixon>
              </span>
              <span>{getContent(unreadOnly ? "nfAllRead" : "noNotificationsYet")}</span>
            </div>
          )}
          {data.total > NOTIFICATIONS_PAGE_LIMIT && (
            <Pagination
              className={classes.pagination}
              currentPage={page}
              pagesCount={Math.ceil(data.total / NOTIFICATIONS_PAGE_LIMIT)}
              makePath={() => pathname}
              onClickPage={setPage}
            />
          )}
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
