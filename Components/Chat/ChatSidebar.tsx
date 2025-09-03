import useSWR from "swr";
import classes from "./ChatSidebar.module.css";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { IUser, MongoDoc } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import Loading from "../Admin/UI/Loading";
import { Fragment } from "react";
import useLocale from "../Hooks/useLocale";
import Link from "next/link";
import ChatSidebarItem from "./ChatSidebarItem";

export type ChatPopuplation = Population<{
  Messages: MessagePopulation;
  Participants: boolean;
}>;
export interface IChat<T extends ChatPopuplation = ChatPopuplation>
  extends MongoDoc {
  participants: T["Participants"] extends true ? IUser[] : string[];
  createdAt: Date;
  messages: T["Messages"] extends MessagePopulation
    ? IMessage<T["Messages"]>[]
    : never;
  opensAt: Date;
  closedAt?: Date;
}

export type MessagePopulation = Population<{
  Sender: boolean;
  Chat: ChatPopuplation;
  Read: boolean;
  File: UserFilePopulation;
}>;

export interface IMessage<T extends MessagePopulation = MessagePopulation>
  extends MongoDoc {
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
export interface IUserFile<T extends UserFilePopulation = UserFilePopulation>
  extends MongoDoc {
  chat?: T["Chat"] extends ChatPopuplation ? IChat<T["Chat"]> : string;
  readers?: T["Readers"] extends true ? IUser[] : string[];
  file: string;
  createdAt: Date;
}

const ChatSidebar = () => {
  const { data } = useSWR<IChat<{ Participants: true }>[]>(
    `${API}/chat`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { refreshInterval: 1000 }
  );

  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <input />
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
