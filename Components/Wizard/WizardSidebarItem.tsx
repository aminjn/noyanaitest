import Link from "next/link";
import { useState } from "react";
import classes from "./WizardSidebarItem.module.css";
import { IBotChat } from "./useBotChats";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useNotification from "../Hooks/useNotification";
import useProgress from "../Hooks/useProgress";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import Ixon from "../UI/Ixon";
import TrashIcon from "../Icons/TrashIcon";
import CheckIcon from "../Icons/CheckIcon";
import XMarkIcon from "../Icons/XMarkIcon";
import FormatDate from "../UI/FormatDate";

const NS: ContentNamespace[] = ["common", "wizardPage"];

const WizardSidebarItem = ({
  chat,
  isActive,
  mutate,
  onNavigate,
}: {
  chat: IBotChat;
  isActive: boolean;
  mutate: () => unknown;
  onNavigate?: () => void;
}) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const push = useProgress();

  const [isConfirmingDelete, setIsConfirmingDelete] =
    useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const onDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await fetcher({ url: `${API}/wizard/chat/${chat._id}`, method: "DELETE" });
      await mutate();
      if (isActive) push("/wizard");
    } catch (err) {
      pushNotification(
        err instanceof Error ? err.message : getContent("unknownErrorOccured"),
        "Error",
      );
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div
      className={`${classes.main} ${isActive ? classes.active : ""}`}
    >
      <Link
        href={`/wizard/${chat._id}`}
        className={classes.link}
        onClick={onNavigate}
      >
        <span className={classes.name}>{chat.name || getContent("chat")}</span>
        <FormatDate
          className={classes.date}
          value={chat.createdAt}
          time={false}
        />
      </Link>
      {isConfirmingDelete ? (
        <div className={classes.confirm}>
          <span className={classes.confirmText}>
            {getContent("sureDeleteThisChat")}
          </span>
          <button
            type="button"
            className={classes.confirmYes}
            aria-label={getContent("delete")}
            disabled={isDeleting}
            onClick={onDelete}
          >
            <Ixon width="0.875rem">
              <CheckIcon />
            </Ixon>
          </button>
          <button
            type="button"
            className={classes.confirmNo}
            onClick={() => setIsConfirmingDelete(false)}
          >
            <Ixon width="0.875rem">
              <XMarkIcon />
            </Ixon>
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={classes.delete}
          aria-label={getContent("delete")}
          onClick={() => setIsConfirmingDelete(true)}
        >
          <Ixon width="1rem">
            <TrashIcon />
          </Ixon>
        </button>
      )}
    </div>
  );
};

export default WizardSidebarItem;
