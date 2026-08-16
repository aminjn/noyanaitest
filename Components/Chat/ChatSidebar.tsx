import useSWR from "swr";
import classes from "./ChatSidebar.module.css";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import Loading from "../Admin/UI/Loading";
import { Fragment, useRef } from "react";
import useLocale from "../Hooks/useLocale";
import ChatSidebarItem from "./ChatSidebarItem";
import Ixon from "../UI/Ixon";
import SearchIcon from "../Icons/SearchIcon";
import ChatBubbleIcon from "../Icons/ChatBubbleIcon";
import Link from "next/link";

export type ChatPopuplation = Population<{
  Messages: MessagePopulation;
  Participants: UserPopulation;
}>;
export interface IChat<
  T extends ChatPopuplation = ChatPopuplation,
> extends MongoDoc {
  participants: T["Participants"] extends UserPopulation
    ? IUser<T["Participants"]>[]
    : string[];
  createdAt: Date;
  messages: T["Messages"] extends MessagePopulation
    ? IMessage<T["Messages"]>[]
    : never;
  opensAt: Date;
  closedAt?: Date;
}

export const getChatParticipantName = (
  participant?: IUser<{ Identity: Record<never, never> }>,
): string | undefined => {
  if (!participant) return undefined;
  const identity = participant.identity;
  if (identity) {
    const fullName = `${identity.givenName || ""} ${
      identity.lastName || ""
    }`.trim();
    if (fullName) return fullName;
  }
  return participant.username;
};

export type MessagePopulation = Population<{
  Sender: boolean;
  Chat: ChatPopuplation;
  Read: boolean;
  File: UserFilePopulation;
}>;

export interface IMessage<
  T extends MessagePopulation = MessagePopulation,
> extends MongoDoc {
  chat: T["Chat"] extends ChatPopuplation ? IChat<T["Chat"]> : string;
  sender: T["Sender"] extends true ? IUser : string;
  message?: string;
  file?: T["File"] extends UserFilePopulation ? IUserFile : string;
  createdAt: Date;
  readBy: T["Read"] extends true ? IUser[] : string[];
}

export type UserFilePopulation = Population<{
  Chat: ChatPopuplation;
  Readers: boolean;
}>;
export interface IUserFile<
  T extends UserFilePopulation = UserFilePopulation,
> extends MongoDoc {
  chat?: T["Chat"] extends ChatPopuplation ? IChat<T["Chat"]> : string;
  readers?: T["Readers"] extends true ? IUser[] : string[];
  file: string;
  createdAt: Date;
}

const ChatSidebar = () => {
  const { data } = useSWR<
    IChat<{ Participants: { Identity: Record<never, never> } }>[]
  >(`${API}/chat`, (url: string) => fetcher({ url }).then((res) => res.data), {
    refreshInterval: 1000,
  });

  const getContent = useLocale();

  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <div className={classes.main}>
      <div className={classes.top}>
        <div className={classes.search}>
          <Ixon className={classes.searchIcon} width="1.5rem">
            <SearchIcon />
          </Ixon>
          <input
            ref={searchRef}
            className={classes.searchInput}
            placeholder={getContent("searchOrStartNewChat")}
          />
        </div>
        <div className={classes.tabs}>
          <Link
            className={`${classes.tab} ${classes.active}`}
            href={"/dashboard/support"}
          >
            {getContent("support")}
          </Link>
        </div>
      </div>
      {data ? (
        <Fragment>
          {!!data.length ? (
            <div className={classes.list}>
              {data.map((chat) => (
                <ChatSidebarItem key={chat._id} chat={chat} />
              ))}
            </div>
          ) : (
            <p>{getContent("noChatYetMessage")}</p>
          )}
        </Fragment>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default ChatSidebar;
