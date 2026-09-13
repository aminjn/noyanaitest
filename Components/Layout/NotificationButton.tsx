import useSWR from "swr";
import useProgress from "../Hooks/useProgress";
import useUser from "../Hooks/useUser";
import Bell01Icon from "../Icons/Bell01Icon";
import Ixon from "../UI/Ixon";
import classes from "./NotificationButton.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { t2xsRegular } from "../UI/Typography";
import IconWithCountButton from "../UI/IconWithCountButton";
import { Dispatch, SetStateAction, useState } from "react";
import NotificationModal from "./NotificationModal";
const NotificationButton = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { user } = useUser();

  const { data } = useSWR<number>(
    `${API}/user/notification/unread-count`,
    (url: string) => fetcher({ url }).then((res) => res.data.count),
  );

  if (!user) return null;
  return (
    <div className={classes.main}>
      <IconWithCountButton count={data} onClick={() => setIsOpen(true)}>
        <Bell01Icon />
      </IconWithCountButton>
      {isOpen && <NotificationModal close={() => setIsOpen(false)} />}
    </div>
  );
};

export default NotificationButton;
