import useSWR from "swr";
import classes from "./NotificationModal.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { INotification } from "../Admin/Notification/AdminManageNotificationsPage";
import Loading from "../Admin/UI/Loading";
import { Fragment, useEffect, useRef } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import FormatDate from "../UI/FormatDate";
import Button from "../UI/Button";
import ChevronIcon from "../Icons/ChevronIcon";
import Ixon from "../UI/Ixon";
import {
  t2xsRegular,
  tbaseBold,
  txsMedium,
  txsRegular,
} from "../UI/Typography";
const NotificationModal = ({ close }: { close: () => unknown }) => {
  const { data, error, mutate } = useSWR<{
    data: INotification<{ CreatedBy: Record<never, never> }>[];
    total: number;
    page: number;
    unreadCount: number;
  }>(`${API}/user/notification?unread=true`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(["common"]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (
        !containerRef.current ||
        !e.target ||
        !containerRef.current.contains(e.target as Node)
      )
        return close();
    };
    setTimeout(() => window.addEventListener("click", listener, false), 10);
    return () => window.removeEventListener("click", listener, false);
  }, [close]);

  return (
    <div className={classes.main} ref={containerRef}>
      {!data ? (
        <Loading />
      ) : (
        <Fragment>
          <div className={classes.header}>
            <span className={`${tbaseBold}`}>
              {getContent("myNotifications")}
            </span>
            <span className={`${txsRegular}`}>({data.unreadCount})</span>
          </div>
          <div className={classes.content}>
            {data.data.map((not) => (
              <div key={not._id} className={classes.item}>
                <div className={classes.itemContent}>
                  <span className={`${classes.itemTitle} ${txsMedium}`}>
                    {not.title}
                  </span>
                  <span className={`${classes.itemMessage} ${t2xsRegular}`}>
                    {not.message}
                  </span>
                </div>
                <div className={classes.dateBox}>
                  <FormatDate
                    time={false}
                    value={not.createdAt}
                    className={`${classes.date} ${t2xsRegular}`}
                  />
                  <span className={classes.dot} />
                </div>
              </div>
            ))}
          </div>
          <div className={classes.footer}>
            <Button
              variant="Primary"
              mode="Inline"
              radius="Normal"
              size="S"
              tailIcon={
                <Ixon style={{ transform: "rotateZ(90deg)" }}>
                  <ChevronIcon />
                </Ixon>
              }
              href="/dashboard/notification"
              onClick={() => close()}
            >
              {getContent("seeAll")}
            </Button>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default NotificationModal;
