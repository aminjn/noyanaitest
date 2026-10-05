"use client";
import AiLocked, { aiGateOf, AiGateInfo } from "@/Components/Ai/AiLocked";
import { useParams } from "next/navigation";
import useUser, { MongoDoc } from "../Hooks/useUser";
import classes from "./WizardPage.module.css";
import useSWR, { mutate as mutateGlobal } from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import Form from "../UI/Form";
import Ixon from "../UI/Ixon";
import SendIcon from "../Icons/SendIcon";
import BarsIcon from "../Icons/BarsIcon";
import AiIcon from "../Icons/AiIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { tsmRegular } from "../UI/Typography";
import useNotification from "../Hooks/useNotification";
import useProgress from "../Hooks/useProgress";
import ChatsSidebar from "./ChatsSidebar";
import LoginRequired from "../UI/LoginRequired";
import Loading from "../Admin/UI/Loading";
import { IBotChat, wizardChatsKey } from "./useBotChats";
import ProUpsellCard from "../Pro/ProUpsellCard";
import { PRO_ME_URL, useMyPro } from "../Pro/useProData";
import { ContentKey } from "../Enums/contentKeys";
import { useIntlLocale } from "../i18n/navigation";

const NS: ContentNamespace[] = ["common", "wizardPage"];

export const botChatMessageRoles = ["user", "assistant"] as const;

export type BotChatMessageRole = (typeof botChatMessageRoles)[number];

export interface IBotChatMessage extends MongoDoc {
  chat: string;
  content: string;
  role: BotChatMessageRole;
  createdAt: Date;
}

const Message = ({ node }: { node: IBotChatMessage }) => {
  return (
    <div
      className={`${classes.message} ${
        node.role === "user" ? classes.userMessage : classes.assistantMessage
      }`}
    >
      <p className={`${classes.messageContent} ${tsmRegular}`}>
        {node.content}
      </p>
    </div>
  );
};

const TypingIndicator = ({ label }: { label: string }) => (
  <div className={`${classes.message} ${classes.assistantMessage}`}>
    <div className={classes.typing} role="status" aria-label={label}>
      <span />
      <span />
      <span />
    </div>
  </div>
);

const WizardPage = () => {
  const { user } = useUser();
  const { nodeId } = useParams<{ nodeId?: string }>();

  const { data: chat } = useSWR<IBotChat>(
    nodeId ? `${API}/wizard/chat/${nodeId}/details` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { data, mutate } = useSWR<IBotChatMessage[]>(
    nodeId ? `${API}/wizard/chat/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [prompt, setPrompt] = useState<string>("");
  const [sentPrompt, setSentPrompt] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [incomingStream, setIncomingStream] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  // the day's free messages are used up (429, 2026-10 «پرو»)
  const [limitReached, setLimitReached] = useState<boolean>(false);
  // the AI policy's refusal (2026-10): locked by plan, quota used up and
  // when it opens again, or switched off
  const [gate, setGate] = useState<AiGateInfo | null>(null);
  const { data: pro } = useMyPro();
  const intlTag = useIntlLocale();

  const push = useProgress();
  const pushNotification = useNotification();
  const getContent = useScopedLocale(NS);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [data, incomingStream, isSending]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [nodeId]);

  // a new chat opened from a disease / symptom / directory page arrives with
  // its question typed (/wizard?q=...), for the visitor to finish and send
  useEffect(() => {
    if (nodeId) return;
    try {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) {
        setPrompt(q.slice(0, 500));
        textareaRef.current?.focus();
      }
    } catch {
      // no prefill
    }
  }, [nodeId]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [prompt]);

  const onSend = useCallback(async () => {
    const message = prompt.trim();
    if (!message || isSending) return;
    setIsSending(true);
    setSentPrompt(message);
    setIncomingStream("");
    setPrompt("");
    let capturedChatId: string | undefined;
    try {
      const response = await fetch(
        `${API}/wizard/prompt${nodeId ? `/${nodeId}` : ""}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: message }),
        },
      );
      if (!response.ok) {
        const errBody = await response.json().catch(() => undefined);
        if (response.status === 429) {
          setLimitReached(true);
          setPrompt(message);
        }
        const refused = aiGateOf(errBody);
        if (refused) {
          setGate(refused);
          setPrompt(message);
        }
        pushNotification(
          errBody?.message || getContent("unknownErrorOccured"),
          "Error",
        );
        return;
      }
      const reader = response.body?.getReader();
      if (!reader) {
        pushNotification(getContent("unknownErrorOccured"), "Error");
        return;
      }
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: "))
            setIncomingStream(
              (prev) => prev + JSON.parse(line.replace("data: ", "")),
            );
          else if (line.startsWith("chatId: "))
            capturedChatId = JSON.parse(line.replace("chatId: ", ""));
          else if (line.startsWith("errorMessage: "))
            pushNotification(
              JSON.parse(line.replace("errorMessage: ", "")),
              "Error",
            );
        }
      }
      await mutate();
      mutateGlobal(wizardChatsKey);
      mutateGlobal(PRO_ME_URL);
      // the chat's title (only for its first exchange) finishes generating
      // shortly after the answer itself - one more revalidate picks it up
      // without having to poll the sidebar continuously.
      setTimeout(() => mutateGlobal(wizardChatsKey), 1800);
    } catch (err) {
      pushNotification(getContent("connectionError"), "Error");
    } finally {
      setSentPrompt("");
      setIncomingStream("");
      setIsSending(false);
      if (capturedChatId && !nodeId) push(`/wizard/${capturedChatId}`);
    }
  }, [prompt, isSending, nodeId, mutate, push, pushNotification, getContent]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend],
  );

  if (!user) return <LoginRequired />;

  const isLoadingHistory = !!nodeId && !data && !isSending;
  const hasMessages = !!data?.length || isSending;

  return (
    <div className={classes.container}>
      <div
        className={`${classes.sidebarBackdrop} ${
          isSidebarOpen ? classes.sidebarBackdropOpen : ""
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div
        className={`${classes.sidebarWrap} ${
          isSidebarOpen ? classes.sidebarWrapOpen : ""
        }`}
      >
        <ChatsSidebar
          activeChatId={nodeId}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
      <div className={classes.main}>
        <div className={classes.header}>
          <button
            type="button"
            className={classes.menuToggle}
            aria-label={getContent("menu")}
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            <Ixon width="1.25rem">
              <BarsIcon />
            </Ixon>
          </button>
          <Ixon width="1.5rem" className={classes.headerIcon}>
            <AiIcon />
          </Ixon>
          <span className={classes.headerTitle}>
            {chat?.name || getContent("aiAssistant")}
          </span>
        </div>
        <div className={classes.body}>
          {isLoadingHistory ? (
            <Loading />
          ) : hasMessages ? (
            <div className={classes.messages}>
              {data?.map((message) => (
                <Message node={message} key={message._id} />
              ))}
              {isSending && (
                <Message
                  node={{
                    _id: "pending-user",
                    __v: 0,
                    chat: "",
                    content: sentPrompt,
                    createdAt: new Date(),
                    role: "user",
                  }}
                />
              )}
              {!!incomingStream && (
                <Message
                  node={{
                    _id: "pending-assistant",
                    __v: 0,
                    chat: "",
                    content: incomingStream,
                    createdAt: new Date(),
                    role: "assistant",
                  }}
                />
              )}
              {isSending && !incomingStream && (
                <TypingIndicator label={getContent("aiIsTyping")} />
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className={classes.empty}>
              <Ixon width="3rem" className={classes.emptyIcon}>
                <AiIcon />
              </Ixon>
              <p className={classes.emptyMessage}>
                {getContent("askMeAnythingMessage")}
              </p>
            </div>
          )}
        </div>
        {/* «پرو»: the free tier's daily limit and the way past it */}
        {!!gate && <AiLocked profile="user" gate={gate} />}
        {limitReached && !pro?.active && (
          <ProUpsellCard moment="ai" className={classes.proCard} />
        )}
        {!limitReached && !!pro?.ai.limit && pro.ai.remaining !== null && pro.ai.remaining <= 5 && (
          <p className={classes.allowance}>
            {getContent("proAiRemaining", [
              new Intl.NumberFormat(intlTag).format(pro.ai.remaining),
            ])}
          </p>
        )}
        <Form className={classes.composer} onSubmit={onSend}>
          <textarea
            ref={textareaRef}
            className={`${classes.input} ${tsmRegular}`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={getContent("writeYourPrompt")}
            rows={1}
          />
          <button
            type="submit"
            className={classes.send}
            disabled={!prompt.trim() || isSending}
            aria-label={getContent("sendMessage")}
          >
            <Ixon width="1.125rem">
              <SendIcon />
            </Ixon>
          </button>
        </Form>
      </div>
    </div>
  );
};

export default WizardPage;
