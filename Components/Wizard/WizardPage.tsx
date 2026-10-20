"use client";
import AiLocked, { aiGateOf, AiGateInfo } from "@/Components/Ai/AiLocked";
import { useParams } from "next/navigation";
import useUser, { MongoDoc } from "../Hooks/useUser";
import classes from "./WizardPage.module.css";
import useSWR, { mutate as mutateGlobal } from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { Fragment, KeyboardEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
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
import { markAiUsed } from "../Ai/aiDiscovery";
import { WIZARD_ASK_EVENT } from "./WizardHeroAsk";
import Link from "../i18n/Link";
import WizardMessageText, { hideMachineLines } from "./WizardMessageText";
import WizardNearbyDoctors from "./WizardNearbyDoctors";

const NS: ContentNamespace[] = ["common", "wizardPage"];

export const botChatMessageRoles = ["user", "assistant"] as const;

export type BotChatMessageRole = (typeof botChatMessageRoles)[number];

export interface IBotChatMessage extends MongoDoc {
  chat: string;
  content: string;
  role: BotChatMessageRole;
  createdAt: Date;
  // what an assessment named (backend Lib/wizardTriage.ts)
  meta?: {
    // the answers the patient can tap under a question
    options?: string[];
    urgency?: "emergency" | "soon" | "routine";
    speciality?: { _id: string; name: string; slug?: string };
    diseases?: { _id: string; name: string; slug?: string }[];
  };
}

// the message opens with a question (its first or second line ends in «؟»)
const opensWithQuestion = (content: string) =>
  String(content || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 2)
    .some((l) => /[?؟][\s"'»)!.…]*$/.test(l));

// an assessment (not a question): it named a specialty or how urgent. A reply
// that opens with a question waits for the answer, whatever else it says;
// condition names alone are only links in the text.
const isAssessment = (node: IBotChatMessage) =>
  node.role === "assistant" &&
  !!(node.meta?.speciality || node.meta?.urgency) &&
  (node.meta?.urgency === "emergency" || !opensWithQuestion(node.content));

const URGENCY_KEY: Record<"emergency" | "soon" | "routine", ContentKey> = {
  emergency: "wizUrgencyEmergency",
  soon: "wizUrgencySoon",
  routine: "wizUrgencyRoutine",
};

const Avatar = () => (
  <span className={classes.avatar} aria-hidden="true">
    <Ixon width="1rem">
      <AiIcon />
    </Ixon>
  </span>
);

// Design A (2026-10, benchmark Ada): the patient's words in a filled bubble,
// the assistant's as plain text beside its avatar, the answers to tap under
// its question, and the assessment as one card: how urgent, the conditions
// (links to their pages), what to do, who to see.
const Message = ({
  node,
  onPick,
  getContent,
}: {
  node: IBotChatMessage;
  // the quick replies are live (the last question only)
  onPick?: (answer: string) => unknown;
  getContent: (key: ContentKey, params?: string[]) => string;
}) => {
  if (node.role === "user")
    return (
      <div className={`${classes.message} ${classes.userMessage}`}>
        <p className={`${classes.messageContent} ${tsmRegular}`}>{node.content}</p>
      </div>
    );
  const meta = node.meta;
  const body = <WizardMessageText text={node.content} links={meta?.diseases} />;
  return (
    <div className={`${classes.message} ${classes.assistantMessage}`}>
      <Avatar />
      <div className={classes.assistantColumn}>
        {isAssessment(node) ? (
          <div className={`${classes.assessCard} ${tsmRegular}`}>
            <div className={classes.assessHead}>
              <strong>{getContent("wizAssessTitle")}</strong>
              {!!meta?.urgency && (
                <span className={`${classes.urgency} ${classes[`urgency_${meta.urgency}`]}`}>
                  {getContent(URGENCY_KEY[meta.urgency])}
                </span>
              )}
            </div>
            {!!meta?.diseases?.length && (
              <div className={classes.assessChips}>
                <span className={classes.assessLabel}>{getContent("wizPossible")}</span>
                {meta.diseases
                  .filter((d) => d.slug)
                  .map((d) => (
                    <Link key={d._id} href={`/disease/${d.slug}`} className={classes.diseaseChip}>
                      {d.name}
                    </Link>
                  ))}
              </div>
            )}
            <div className={classes.assistantText}>{body}</div>
            {!!meta?.speciality && (
              <div className={classes.assessSpecialist}>
                <span>{getContent("wizSpecialistSuggested")}</span>
                <strong>{meta.speciality.name}</strong>
              </div>
            )}
          </div>
        ) : (
          <div className={`${classes.assistantText} ${tsmRegular}`}>{body}</div>
        )}
        {!!onPick && !!meta?.options?.length && (
          <div className={classes.quickReplies}>
            {meta.options.map((answer) => (
              <button key={answer} type="button" className={classes.quickReply} onClick={() => onPick(answer)}>
                {answer}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = ({ label }: { label: string }) => (
  <div className={`${classes.message} ${classes.assistantMessage}`}>
    <Avatar />
    <div className={classes.typing} role="status" aria-label={label}>
      <span />
      <span />
      <span />
    </div>
  </div>
);

// `landing`: what a visitor who is not signed in sees on /wizard (the
// server-rendered WizardLanding, the page search engines index)
const WizardPage = ({ landing }: { landing?: ReactNode }) => {
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
  const [streamMeta, setStreamMeta] = useState<IBotChatMessage["meta"]>(undefined);
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

  // the assistant was reached: the AI entry drops its "new" dot
  useEffect(() => markAiUsed(), []);

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

  // the question typed on the landing waits in the composer after sign-in
  useEffect(() => {
    const onAsk = (e: Event) => {
      const q = (e as CustomEvent<string>).detail;
      if (typeof q === "string" && q) setPrompt(q.slice(0, 500));
    };
    window.addEventListener(WIZARD_ASK_EVENT, onAsk);
    return () => window.removeEventListener(WIZARD_ASK_EVENT, onAsk);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [prompt]);

  // a tapped quick reply sends its own text; the form sends what was typed
  const onSend = useCallback(async (answer?: unknown) => {
    const message = (typeof answer === "string" ? answer : prompt).trim();
    if (!message || isSending) return;
    setIsSending(true);
    setSentPrompt(message);
    setIncomingStream("");
    setStreamMeta(undefined);
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
          else if (line.startsWith("meta: ")) {
            try {
              setStreamMeta(JSON.parse(line.replace("meta: ", "")));
            } catch {
              /* links only */
            }
          } else if (line.startsWith("chatId: "))
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

  if (!user) return landing && !nodeId ? <>{landing}</> : <LoginRequired />;

  const isLoadingHistory = !!nodeId && !data && !isSending;
  // the last assessment's specialty: its doctors near the patient, right under it
  const list = Array.isArray(data) ? data : [];
  let nearbyAt = list.length - 1;
  while (nearbyAt >= 0 && !(isAssessment(list[nearbyAt]) && list[nearbyAt].meta?.speciality)) nearbyAt--;
  const nearbySpeciality = nearbyAt >= 0 ? list[nearbyAt].meta?.speciality : undefined;
  const hasMessages = !!data?.length || isSending;
  // «سؤال ۲ از ۴»: the questions asked since the last assessment
  const sinceAssessment = (() => {
    const list = Array.isArray(data) ? data : [];
    let i = list.length - 1;
    while (i >= 0 && !isAssessment(list[i])) i--;
    return list.slice(i + 1);
  })();
  const asked = sinceAssessment.filter((m) => m.role === "assistant").length;
  const showProgress = asked > 0 && !!data?.length && !isAssessment(data[data.length - 1]);

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
          {showProgress && (
            <span className={classes.progress}>
              <span>
                {getContent("wizProgress", [
                  new Intl.NumberFormat(intlTag).format(Math.min(asked, 4)),
                  new Intl.NumberFormat(intlTag).format(4),
                ])}
              </span>
              <span className={classes.progressTrack} aria-hidden="true">
                <span className={classes.progressFill} style={{ width: `${(Math.min(asked, 4) / 4) * 100}%` }} />
              </span>
            </span>
          )}
        </div>
        <div className={classes.body}>
          {isLoadingHistory ? (
            <Loading />
          ) : hasMessages ? (
            <div className={classes.messages}>
              {data?.map((message, i) => (
                <Fragment key={message._id}>
                  <Message
                    node={message}
                    getContent={getContent}
                    onPick={!isSending && i === data.length - 1 ? onSend : undefined}
                  />
                  {i === nearbyAt && !!nearbySpeciality && (
                    <WizardNearbyDoctors key={nearbySpeciality._id} speciality={nearbySpeciality} />
                  )}
                </Fragment>
              ))}
              {isSending && (
                <Message
                  getContent={getContent}
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
              {!!hideMachineLines(incomingStream) && (
                <Message
                  getContent={getContent}
                  node={{
                    _id: "pending-assistant",
                    __v: 0,
                    chat: "",
                    content: incomingStream,
                    createdAt: new Date(),
                    role: "assistant",
                    meta: streamMeta,
                  }}
                />
              )}
              {isSending && !hideMachineLines(incomingStream) && (
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
