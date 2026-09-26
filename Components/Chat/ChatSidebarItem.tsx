import { useMemo } from "react";
import useUser, { IUser } from "../Hooks/useUser";
import { IChat, getChatParticipantName } from "./ChatSidebar";
import classes from "./ChatSidebarItem.module.css";
import Link from "@/Components/i18n/Link";
import HostedImage from "../UI/HostedImage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "chat"];

const ChatSidebarItem = ({
  chat,
}: {
  chat: IChat<{ Participants: { Identity: Record<never, never> } }>;
}) => {
  const { user } = useUser();

  const getContent = useScopedLocale(LOCALE_NS);

  const other = useMemo<IUser<{ Identity: Record<never, never> }> | undefined>(
    () => chat.participants.find((p) => p._id !== user?._id),
    [chat.participants, user?._id],
  );

  const title = useMemo(
    () => getChatParticipantName(other),
    [other],
  );


  return (
    <Link href={`/dashboard/chat/${chat._id}`} className={classes.main}>
      <div className={classes.image}>
        {
          //TODO: add image later
        }
        <HostedImage
          alt={title || "chat"}
          src={undefined}
          style={{ objectFit: "cover" }}
          sizes="10rem"
          fill
        />
      </div>
      <div className={classes.info}>
        <span className={classes.name}>{title || getContent("chat")}</span>
        <span className={classes.status}>
          {getContent("status")} :{" "}
          {getContent(chat.closedAt ? "close" : "open")}
        </span>
      </div>
      <div className={classes.last}>
        <span className={classes.date}>
          {new Date(chat.createdAt).toLocaleString("fa-IR", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            minute: "numeric",
            hour: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
};

export default ChatSidebarItem;
