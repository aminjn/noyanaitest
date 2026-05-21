"use client";
import { useParams } from "next/navigation";
import useUser, { MongoDoc } from "../Hooks/useUser";
import classes from "./WizardPage.module.css";
import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { BotChatPopulation, IBotChat } from "./useBotChats";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { Fragment, useCallback, useState } from "react";
import Form from "../UI/Form";
import Ixon from "../UI/Ixon";
import AirPodsIcon from "../Icons/AirPodsIcon";
import useLocale from "../Hooks/useLocale";
import { tsmRegular } from "../UI/Typography";
import useNotification from "../Hooks/useNotification";
import useProgress from "../Hooks/useProgress";
import ChatsSidebar from "./ChatsSidebar";

export const botChatMessageRoles = ["user", "assistant"] as const;

export type BotChatMessageRole = (typeof botChatMessageRoles)[number];

export type BotChatMessagePopulation = Population<{ Chat: BotChatPopulation }>;
export interface IBotChatMessage<
  T extends BotChatMessagePopulation = BotChatMessagePopulation,
> extends MongoDoc {
  chat: T["Chat"] extends BotChatPopulation ? IBotChat<T["Chat"]> : string;
  content: string;
  role: BotChatMessageRole;
  createdAt: Date;
}

const Message = ({ node }: { node: IBotChatMessage }) => {
  return (
    <p
      className={`${classes.message} ${node.role === "user" ? classes.userMessage : ""}`}
    >
      {node.content}
    </p>
  );
};

const WizardPage = () => {
  const { user } = useUser();
  const { nodeId } = useParams<{ nodeId?: string }>();
  const { data, mutate } = useSWR<IBotChatMessage[]>(
    nodeId ? `${API}/wizard/chat/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const [prompt, setPrompt] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  const push = useProgress();

  const [incomingStream, setIncomingStream] = useState<string>("");

  const pushNotification = useNotification();

  const onSend = useCallback(async () => {
    if (!prompt.trim() || isSending) return;
    setIsSending(true);
    const response = await fetch(
      `${API}/wizard/prompt${nodeId ? `/${nodeId}` : ""}?prompt=${prompt}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const reader = response.body?.getReader();
    if (!reader) return pushNotification("Could't Get Reader", "Error");
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: "))
          setIncomingStream(
            (prev) => prev + JSON.parse(line.replace("data: ", "")),
          );
        if (line.startsWith("chatId: "))
          push(`/wizard/${JSON.parse(line.replace("chatId: ", ""))}`);
      }
    }
    mutate();
    setIsSending(false);
  }, [prompt, isSending, pushNotification, push, mutate, nodeId]);

  const getContent = useLocale();

  if (!user) return <p>Please Login To Gain Access</p>;
  return (
    <div className={classes.container}>
      <ChatsSidebar />
      <div className={classes.main}>
        {(!!data?.length || !!incomingStream) && (
          <div className={classes.messages}>
            {!!data?.length &&
              data.map((message) => (
                <Message node={message} key={message._id} />
              ))}
            {!!incomingStream && (
              <Fragment>
                <Message
                  node={{
                    content: prompt,
                    role: "user",
                    chat: "",
                    createdAt: new Date(),
                    _id: "",
                  }}
                />
                <Message
                  node={{
                    _id: "",
                    chat: "",
                    content: incomingStream,
                    createdAt: new Date(),
                    role: "assistant",
                  }}
                />
              </Fragment>
            )}
          </div>
        )}
        <div
          className={`${classes.prompt} ${!!incomingStream || !!data?.length ? classes.down : ""}`}
        >
          <textarea
            className={`${classes.input} ${tsmRegular}`}
            onChange={(e) => setPrompt(e.target.value)}
          />
          {!prompt && (
            <span className={`${classes.placeholder} ${tsmRegular}`}>
              {getContent("writeYourPrompt")}
            </span>
          )}
          <Form className={classes.send} onSubmit={onSend}>
            <button type="submit">
              <Ixon width="1.25rem">
                <AirPodsIcon />
              </Ixon>
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default WizardPage;
