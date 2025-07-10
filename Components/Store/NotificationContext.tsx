"use client";

import { createContext, ReactNode, useCallback, useState } from "react";

export const notificationStatuses = [
  "Success",
  "Notify",
  "Error",
  "Warn",
] as const;

export type NotificationStatus = (typeof notificationStatuses)[number];

export interface INotification {
  id: string;
  message: string;
  status: NotificationStatus;
}

const NotificationContext = createContext<{
  notifications: INotification[];
  pushNotification: (message: string, status?: NotificationStatus) => void;
  dismissNotification: (id: string) => void;
}>({
  notifications: [],
  pushNotification: () => {},
  dismissNotification: () => {},
});

export const NotificationContextProvider = (props: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const pushNotification = useCallback(
    (message: string, status: NotificationStatus = "Notify") =>
      setNotifications((prev) =>
        [
          ...prev,
          { id: `${new Date().getTime()}${Math.random()}`, message, status },
        ].slice(-6)
      ),
    []
  );

  const dismissNotification = useCallback(
    (id: string) =>
      setNotifications((prev) => {
        const temp = [...prev];
        return temp.filter((n) => n.id !== id);
      }),
    []
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, dismissNotification, pushNotification }}
    >
      {props.children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
