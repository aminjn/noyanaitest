import { ReactNode, useContext, useEffect, useState } from "react";
import classes from "./Notification.module.css";
import { useTimer } from "react-timer-hook";
import NotificationContext, {
  INotification,
  NotificationStatus,
} from "../Store/NotificationContext";
import ErrorIcon from "../Icons/ErrorIcon";
import NotifyIcon from "../Icons/NotifyIcon";
import SuccessIcon from "../Icons/SuccessIcon";
import WarningIcon from "../Icons/WarningIcon";

const NOTIFICATION_TTL = 5000 as const;

const DISMISS_ANIMATION_DURATION = 300 as const;

const MAX_NOTIFICATIONS = 6 as const;

const iconMap: { [key in NotificationStatus]: ReactNode } = {
  Error: <ErrorIcon />,
  Notify: <NotifyIcon />,
  Success: <SuccessIcon />,
  Warn: <WarningIcon />,
};

const Notification = (props: {
  notification: INotification;
  index: number;
}) => {
  const notificationCTX = useContext(NotificationContext);
  const [isDismissing, setIsDismissing] = useState<boolean>(false);

  const { totalSeconds, pause, resume, restart } = useTimer({
    expiryTimestamp: new Date(),
    onExpire: () => setTimeout(() => setIsDismissing(true), 1000),
  });

  useEffect(() => {
    const then = new Date();
    then.setMilliseconds(then.getMilliseconds() + NOTIFICATION_TTL + 1);
    restart(then);
  }, [restart]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isDismissing)
      setTimeout(
        () => notificationCTX.dismissNotification(props.notification.id),
        DISMISS_ANIMATION_DURATION
      );
    return () => timer && clearTimeout(timer);
  }, [isDismissing, notificationCTX, props.notification.id]);

  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      className={`${classes.main} ${
        props.index > MAX_NOTIFICATIONS ? classes.hidden : ""
      }`}
      onClick={() => setIsDismissing(true)}
      style={{ transform: `translateY(${-100 * props.index}%)` }}
      key={props.notification.id}
    >
      <p
        className={`${classes.content} ${classes[props.notification.status]} ${
          isDismissing ? classes.dismissing : ""
        }`}
      >
        <span className={classes.icon}>
          {iconMap[props.notification.status]}
        </span>
        <span className={classes.text}>{props.notification.message}</span>
        <span className={classes.bar}>
          <span
            className={classes.fill}
            style={{
              right: `${(totalSeconds * 100000) / NOTIFICATION_TTL}%`,
            }}
          />
        </span>
      </p>
    </div>
  );
};
export default Notification;
