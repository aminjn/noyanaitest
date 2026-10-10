"use client";

import { ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import classes from "./Notification.module.css";
import NotificationContext, { INotification, NotificationStatus } from "../Store/NotificationContext";
import ErrorIcon from "../Icons/ErrorIcon";
import NotifyIcon from "../Icons/NotifyIcon";
import SuccessIcon from "../Icons/SuccessIcon";
import WarningIcon from "../Icons/WarningIcon";
import CloseIcon from "../Icons/CloseIcon";
import useScopedLocale from "../Hooks/useScopedLocale";

// how long each kind stays (an error needs reading, a success a glance)
const TTL: Record<NotificationStatus, number> = {
  Success: 4500,
  Notify: 6000,
  Warn: 8000,
  Error: 9000,
};
const LEAVE_MS = 220;

const iconMap: Record<NotificationStatus, ReactNode> = {
  Error: <ErrorIcon />,
  Notify: <NotifyIcon />,
  Success: <SuccessIcon />,
  Warn: <WarningIcon />,
};

// One message card: icon, the whole text (wrapped, never cut to a line),
// a close button and a bar showing the time left. Hover or touch pauses
// it; errors are announced at once to screen readers.
const Notification = ({ notification }: { notification: INotification }) => {
  const { dismissNotification } = useContext(NotificationContext);
  const getContent = useScopedLocale(["common"]);
  const ttl = TTL[notification.status] ?? 6000;
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const left = useRef(ttl);
  const startedAt = useRef(Date.now());

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => dismissNotification(notification.id), LEAVE_MS);
  }, [dismissNotification, notification.id]);

  useEffect(() => {
    if (paused || leaving) return;
    startedAt.current = Date.now();
    const t = setTimeout(close, left.current);
    return () => {
      clearTimeout(t);
      left.current = Math.max(0, left.current - (Date.now() - startedAt.current));
    };
  }, [paused, leaving, close]);

  const urgent = notification.status === "Error" || notification.status === "Warn";
  return (
    <div
      className={`${classes.card} ${classes[notification.status]} ${leaving ? classes.leaving : ""}`}
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <span className={classes.icon} aria-hidden>
        {iconMap[notification.status]}
      </span>
      <p className={classes.text}>{notification.message}</p>
      <button type="button" className={classes.close} onClick={close} aria-label={getContent("close")}>
        <CloseIcon />
      </button>
      <span
        className={classes.bar}
        style={{ animationDuration: `${ttl}ms`, animationPlayState: paused ? "paused" : "running" }}
        aria-hidden
      />
    </div>
  );
};
export default Notification;
