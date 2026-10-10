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
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];
import { Dispatch, SetStateAction, useState } from "react";
import NotificationModal from "./NotificationModal";
const NotificationButton = ({
  isOpen,
  close,
  open,
}: {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}) => {
  const { user } = useUser();
  const getContent = useScopedLocale(LOCALE_NS);

  const { data } = useSWR<number>(
    `${API}/user/notification/unread-count`,
    (url: string) => fetcher({ url }).then((res) => res.data.count),
  );

  if (!user) return null;
  return (
    <div className={classes.main}>
      <IconWithCountButton count={data} onClick={() => open()} label={getContent("notifications")}>
        <Bell01Icon />
      </IconWithCountButton>
      {isOpen && <NotificationModal close={close} />}
    </div>
  );
};

export default NotificationButton;
