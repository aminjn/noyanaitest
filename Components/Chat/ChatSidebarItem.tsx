import { useIntlLocale, usePathname } from "@/Components/i18n/navigation";
import useChatScope from "./useChatScope";
import { useMemo } from "react";
import { IUser } from "../Hooks/useUser";
import { IChat, getChatParticipantName } from "./ChatSidebar";
import classes from "./ChatSidebarItem.module.css";
import Link from "@/Components/i18n/Link";
import InitialAvatar from "../UI/InitialAvatar";
import { useParams } from "next/navigation";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "chat"];

const ChatSidebarItem = ({
  chat,
}: {
  chat: IChat<{ Participants: { Identity: Record<never, never> } }>;
}) => {
  const intlTag = useIntlLocale();
  const { selfId } = useChatScope();

  const getContent = useScopedLocale(LOCALE_NS);
  const params = useParams<{ nodeId?: string }>();
  const isActive = params?.nodeId === chat._id;
  // the same inbox serves patients (/dashboard) and doctors (/doctorpanel)
  const base = usePathname().startsWith("/doctorpanel") ? "/doctorpanel/chat" : "/dashboard/chat";

  const other = useMemo<IUser<{ Identity: Record<never, never> }> | undefined>(
    () => (Array.isArray(chat.participants) ? chat.participants : []).find((p) => p && p._id !== selfId),
    [chat.participants, selfId],
  );

  const title = useMemo(
    () => getChatParticipantName(other),
    [other],
  );


  const unread = Number(chat.unread) || 0;
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);

  return (
    <Link
      href={`${base}/${chat._id}`}
      className={`${classes.main} ${isActive ? classes.active : ""} ${unread ? classes.hasUnread : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      <InitialAvatar name={title || "?"} seed={other?._id || chat._id} size="3rem" />
      <div className={classes.info}>
        <span className={classes.name}>{title || getContent("chat")}</span>
        <span className={`${classes.status} ${chat.closedAt ? classes.closed : ""}`}>
          {getContent(chat.closedAt ? "close" : "open")}
        </span>
      </div>
      <span className={classes.side}>
        <span className={classes.date}>
          {isNaN(new Date(chat.createdAt).getTime())
            ? ""
            : new Date(chat.createdAt).toLocaleDateString(intlTag, { month: "short", day: "numeric" })}
        </span>
        {unread > 0 && (
          <span className={classes.unread} aria-label={getContent("chatUnreadN", [num.format(unread)])}>
            {unread > 99 ? num.format(99) + "+" : num.format(unread)}
          </span>
        )}
      </span>
    </Link>
  );
};

export default ChatSidebarItem;
