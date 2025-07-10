"use client";

import { useContext } from "react";
import classes from "./Notifications.module.css";
import Notification from "./Notification";
import NotificationContext from "../Store/NotificationContext";
const Notifications = () => {
  const notificationCTX = useContext(NotificationContext);

  if (!notificationCTX.notifications.length) return;
  return (
    <div className={classes.main}>
      {notificationCTX.notifications.toReversed?.().map((notification, i) => (
        <Notification
          key={notification.id}
          notification={notification}
          index={i}
        />
      ))}
    </div>
  );
};
export default Notifications;
