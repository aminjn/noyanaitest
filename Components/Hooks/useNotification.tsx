import { useContext, useEffect } from "react";
import NotificationContext from "../Store/NotificationContext";

const useNotification = (init?: string) => {
  const { pushNotification } = useContext(NotificationContext);
  useEffect(() => {
    if (init) pushNotification(init);
  }, [init, pushNotification]);
  return pushNotification;
};
export default useNotification;
