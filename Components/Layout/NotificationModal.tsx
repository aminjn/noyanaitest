import useSWR, { mutate as globalMutate } from "swr";
import Link from "next/link";
import classes from "./NotificationModal.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { INotification } from "../Admin/Notification/AdminManageNotificationsPage";
import Loading from "../Admin/UI/Loading";
import { Fragment, useEffect, useRef, useState } from "react";
import FormatDate from "../UI/FormatDate";
import Button from "../UI/Button";
import ChevronIcon from "../Icons/ChevronIcon";
import Ixon from "../UI/Ixon";
import Act from "../UI/Act";
import {
  t2xsRegular,
  tbaseBold,
  txsMedium,
  txsRegular,
} from "../UI/Typography";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const NotificationModalItem = ({
  not,
  mutate,
}: {
  not: INotification<{ CreatedBy: Record<never, never> }>;
  mutate: () => unknown;
}) => {
  const [isMarking, setIsMarking] = useState<boolean>(false);

  const markRead = () => {
    if (!not.isRead && !isMarking) setIsMarking(true);
  };

  const content = (
    <Fragment>
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
    </Fragment>
  );

  return (
    <Fragment>
      {not.link ? (
        <Link href={not.link} className={classes.item} onClick={markRead}>
          {content}
        </Link>
      ) : (
        <div className={classes.item} onClick={markRead}>
          {content}
        </div>
      )}
      <Act
        path={isMarking ? `${API}/user/notification/${not._id}/read` : null}
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

const NotificationModal = ({ close }: { close: () => unknown }) => {
  const { data, error, mutate } = useSWR<{
    data: INotification<{ CreatedBy: Record<never, never> }>[];
    total: number;
    page: number;
    unreadCount: number;
  }>(`${API}/user/notification?unread=true`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(LOCALE_NS);

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
          <div className={classes.content} onClickCapture={() => close()}>
            {data.data.map((not) => (
              <NotificationModalItem key={not._id} not={not} mutate={mutate} />
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
