import { useMemo } from "react";
import useUser, { IUser } from "../Hooks/useUser";
import { IChat } from "./ChatSidebar";
import classes from "./ChatSidebarItem.module.css";
import useLocale from "../Hooks/useLocale";
import Link from "next/link";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";

const ChatSidebarItem = ({ chat }: { chat: IChat<{ Participants: true }> }) => {
  const { user } = useUser();

  const getContent = useLocale();

  const other = useMemo<IUser | undefined>(
    () => chat.participants.find((p) => p._id !== user?._id),
    [chat.participants, user?._id]
  );

  return (
    <Link href={`/chat/${chat._id}`} className={classes.main}>
      <div className={classes.image}>
        {
          //TODO: add image later
        }
        <Image
          alt={other?.userName || "chat"}
          src={imagePath("")}
          style={{ objectFit: "cover" }}
          sizes="10rem"
          fill
        />
      </div>
      <div className={classes.info}>
        <span className={classes.name}>
          {other?.userName || getContent("chat")}
        </span>
        <span className={classes.status}>
          {getContent("status")} :{" "}
          {getContent(chat.closedAt ? "close" : "open")}
        </span>
      </div>
      <div className={classes.last}>
        <span className={classes.date} >
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
