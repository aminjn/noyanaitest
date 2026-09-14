import classes from "./ChatsSidebar.module.css";
import useBotChats, { IBotChat } from "./useBotChats";
import useLocale from "../Hooks/useLocale";
import Ixon from "../UI/Ixon";
import Link from "next/link";
import PlusIcon from "../Icons/PlusIcon";
import XMarkIcon from "../Icons/XMarkIcon";
import Loading from "../Admin/UI/Loading";
import WizardSidebarItem from "./WizardSidebarItem";
import { Fragment } from "react";
import { ContentKey } from "../Enums/contentKeys";
import EditSquareIcon from "../Icons/EditSquareIcon";

// Buckets chats by createdAt for the sidebar's date-grouped list, mirroring
// the today/yesterday/last-7-days/last-30-days/older grouping common in chat
// UIs (ChatGPT, Claude, etc).
type ChatDateGroup = "today" | "yesterday" | "lastWeek" | "lastMonth" | "older";

const chatDateGroupOrder: ChatDateGroup[] = [
  "today",
  "yesterday",
  "lastWeek",
  "lastMonth",
  "older",
];

const chatDateGroupLabelKeys: Record<ChatDateGroup, ContentKey> = {
  today: "today",
  yesterday: "yesterday",
  lastWeek: "lastWeek",
  lastMonth: "lastMonth",
  older: "older",
};

const startOfDay = (value: Date | string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getChatDateGroup = (createdAt: Date | string): ChatDateGroup => {
  const dayDiff = Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(createdAt).getTime()) /
      MS_PER_DAY,
  );
  if (dayDiff <= 0) return "today";
  if (dayDiff === 1) return "yesterday";
  if (dayDiff <= 7) return "lastWeek";
  if (dayDiff <= 30) return "lastMonth";
  return "older";
};

// Chats arrive newest-first (BotChat.find().sort({ createdAt: -1 })), so each
// group's items stay in that order too.
const groupChatsByDate = (chats: IBotChat[]) => {
  const grouped = new Map<ChatDateGroup, IBotChat[]>();
  for (const chat of chats) {
    const group = getChatDateGroup(chat.createdAt);
    const existing = grouped.get(group);
    if (existing) existing.push(chat);
    else grouped.set(group, [chat]);
  }
  return chatDateGroupOrder
    .map((group) => ({ group, chats: grouped.get(group) }))
    .filter(
      (entry): entry is { group: ChatDateGroup; chats: IBotChat[] } =>
        !!entry.chats?.length,
    );
};

const ChatsSidebar = ({
  activeChatId,
  onClose,
}: {
  activeChatId?: string;
  onClose?: () => void;
}) => {
  const { data, mutate } = useBotChats();
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <button
        type="button"
        className={classes.close}
        aria-label={getContent("close")}
        onClick={onClose}
      >
        <Ixon width="1.125rem">
          <XMarkIcon />
        </Ixon>
      </button>
      <div className={classes.header}>
        <Link href="/wizard" className={classes.newChat} onClick={onClose}>
          <span>{getContent("newChat")}</span>
          <Ixon width="1.125rem">
            <EditSquareIcon />
          </Ixon>
        </Link>
      </div>
      {data ? (
        <Fragment>
          {!!data.length ? (
            <div className={classes.list}>
              {groupChatsByDate(data).map(({ group, chats }) => (
                <div key={group} className={classes.group}>
                  <p className={classes.groupLabel}>
                    {getContent(chatDateGroupLabelKeys[group])}
                  </p>
                  {chats.map((chat) => (
                    <WizardSidebarItem
                      key={chat._id}
                      chat={chat}
                      isActive={chat._id === activeChatId}
                      mutate={mutate}
                      onNavigate={onClose}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className={classes.empty}>{getContent("noChatYetMessage")}</p>
          )}
        </Fragment>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default ChatsSidebar;
