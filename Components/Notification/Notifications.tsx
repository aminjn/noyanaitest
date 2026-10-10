"use client";

import { useContext } from "react";
import classes from "./Notifications.module.css";
import Notification from "./Notification";
import NotificationContext from "../Store/NotificationContext";

// The site's messages (success, error, info), 2026-10: a stack at the top
// centre of the screen, where the eye already is on a phone and nothing
// (an in-app browser's toolbar, the panels' bottom bar) covers it; the
// newest on top, at most four at once.
const Notifications = () => {
  const { notifications } = useContext(NotificationContext);
  if (!notifications.length) return null;
  return (
    <div className={classes.main}>
      {[...notifications]
        .reverse()
        .slice(0, 4)
        .map((notification) => (
          <Notification key={notification.id} notification={notification} />
        ))}
    </div>
  );
};
export default Notifications;
