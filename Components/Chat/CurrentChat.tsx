import { useParams } from "next/navigation";
import useSiteSettings from "@/Components/Hooks/useSiteSettings";
import useChatScope from "./useChatScope";
import classes from "./CurrentChat.module.css";
import useSWR from "swr";
import {
  getChatParticipantName,
  IChat,
  IMessage,
  IUserFile,
} from "./ChatSidebar";
import { API } from "../config";
import Loading from "../Admin/UI/Loading";
import { useMemo, useRef } from "react";
import useUser, { IUser } from "../Hooks/useUser";
import Button from "../UI/Button";
import InitialAvatar from "../UI/InitialAvatar";
import SparkIcon from "../Icons/SparkIcon";
import FormatDate from "../UI/FormatDate";
import { fetcher } from "../helpers/fetcher";
import Ixon from "../UI/Ixon";
import AttachmentIcon from "../Icons/AttachmentIcon";
import SendIcon from "../Icons/SendIcon";
import useForm from "../Hooks/useForm";
import Form from "../UI/Form";
import CloseIcon from "../Icons/CloseIcon";
import Link from "@/Components/i18n/Link";
import { usePathname } from "@/Components/i18n/navigation";
import useAnimateOnScroll from "../Hooks/useAnimateOnScroll";
import CheckIcon from "../Icons/CheckIcon";
import DoubleCheckIcon from "../Icons/DoubleCheckIcon";
import MicrophoneIcon from "../Icons/MicrophoneIcon";
import PlusSquareIcon from "../Icons/PlusSquareIcon";
import SmileIcon from "../Icons/SmileIcon";
import BarsIcon from "../Icons/BarsIcon";
import ChatIcon from "../Icons/ChatIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "chat"];

const MessageSender = ({
  chat,
  mutate,
}: {
  chat: IChat;
  mutate: () => unknown;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);

  const fileRef = useRef<HTMLInputElement>(null);

  const textRef = useRef<HTMLInputElement>(null);

  const { api } = useChatScope();

  const { input, setInput, submit, reset } = useForm<{
    message: string;
    file: File;
  }>({
    path: `${api}/${chat._id}`,
    method: "POST",
    hasProblem: (inp) => {
      if (!inp.message && !inp.file)
        return getContent("missingMessageOrFileErrorMessage");
    },
    successCb: () => {
      mutate();
      reset();
      if (fileRef.current) fileRef.current.value = "";
      if (textRef.current) textRef.current.value = "";
    },
  });

  const hasContent = !!input.message?.trim() || !!input.file;

  return (
    <Form className={classes.footer} onSubmit={submit}>
      {hasContent ? (
        <button
          type="submit"
          className={classes.send}
          aria-label={getContent("sendMessage")}
        >
          <Ixon>
            <SendIcon />
          </Ixon>
        </button>
      ) : (
        <Ixon width="1.625rem" className={classes.mic}>
          <MicrophoneIcon />
        </Ixon>
      )}
      <input
        type="text"
        className={classes.textInput}
        placeholder={getContent("writeYourMessage")}
        onChange={(e) =>
          setInput((prev) => ({ ...prev, message: e.target.value }))
        }
        ref={textRef}
      />
      <div className={classes.file}>
        <input
          className={classes.fileInput}
          type="file"
          onChange={(e) =>
            setInput((prev) => ({
              ...prev,
              file: e.target.files?.[0] || undefined,
            }))
          }
          ref={fileRef}
        />
        <Ixon>
          <PlusSquareIcon />
        </Ixon>
      </div>
      {input.file && (
        <div className={classes.chosenFile}>
          <button
            type="button"
            onClick={() => {
              setInput((prev) => ({ ...prev, file: undefined }));
              if (fileRef.current) {
                fileRef.current.value = "";
              }
            }}
            className={classes.clearFile}
          >
            <Ixon>
              <CloseIcon />
            </Ixon>
          </button>
          <span>{input.file.name}</span>
        </div>
      )}
    </Form>
  );
};

const ChatMessage = ({ _id }: { _id: string }) => {
  const [messageRef, isVisible] = useAnimateOnScroll<HTMLDivElement>({});
  const { api, selfId } = useChatScope();

  const { data } = useSWR<IMessage & { uploads: IUserFile[] }>(
    isVisible ? `${api}/message/${_id}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { refreshInterval: 1000 },
  );

  const isSelf = useMemo<boolean>(
    () => data?.sender === selfId,
    [data?.sender, selfId],
  );

  return (
    <div
      className={`${classes.message} ${isSelf ? classes.selfMessage : ""}`}
      ref={messageRef}
    >
      {!!data?.uploads[0] && (
        <Link
          href={`/api/v1/notpublic/${data.uploads[0]._id}`}
          target="blank"
          className={classes.fileLink}
        >
          <Ixon width="1rem">
            <AttachmentIcon />
          </Ixon>
          <span>{data.uploads[0].file}</span>
        </Link>
      )}
      <p className={classes.messageContent}>{data?.message}</p>
      <div className={classes.messageFooter}>
        {isSelf && (
          <Ixon width="1rem">
            {data?.readBy.length === 2 ? <DoubleCheckIcon /> : <CheckIcon />}
          </Ixon>
        )}
        <FormatDate className={classes.messageDate} value={data?.createdAt} />
      </div>
    </div>
  );
};

const InnerChat = ({
  chat,
  mutate,
  onOpenSidebar,
}: {
  chat: IChat<{
    Participants: { Identity: Record<never, never> };
    Messages: Record<string, never>;
  }>;
  mutate: () => unknown;
  onOpenSidebar?: () => void;
}) => {
  const { selfId } = useChatScope();
  const isDoctorSide = usePathname().startsWith("/doctorpanel");
  const other = useMemo<IUser<{ Identity: Record<never, never> }> | undefined>(
    () => chat.participants.find((p) => p._id !== selfId),
    [chat, selfId],
  );

  const title = useMemo(() => getChatParticipantName(other), [other]);

  const getContent = useScopedLocale(LOCALE_NS);
  const { emergencyNumberText } = useSiteSettings();

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <button
          type="button"
          className={classes.menuToggle}
          aria-label={getContent("menu")}
          onClick={onOpenSidebar}
        >
          <Ixon width="1.25rem">
            <BarsIcon />
          </Ixon>
        </button>
        <InitialAvatar name={title || "?"} seed={other?._id || chat._id} size="2.75rem" />
        <div className={classes.details}>
          <span className={classes.name}>{title || getContent("chat")}</span>
          <FormatDate className={classes.date} value={chat.createdAt} />
        </div>
        <Button className={classes.action}>{getContent("closeChat")}</Button>
      </div>
      <div className={classes.body}>
        {/* the "call 115" note is for patients, not the doctor's side */}
        {!isDoctorSide && (
          <p className={classes.safety} role="note">
            <Ixon width="0.9rem">
              <SparkIcon />
            </Ixon>
            {getContent("chatUrgentNote", [emergencyNumberText])}
          </p>
        )}
        {!!chat.messages.length ? (
          chat.messages.map((message) => (
            <ChatMessage key={message._id} _id={message._id} />
          ))
        ) : (
          <p className={classes.noMessages}>{getContent("noMessagesYet")}</p>
        )}
      </div>
      <MessageSender chat={chat} mutate={mutate} />
    </div>
  );
};

const CurrentChat = ({ onOpenSidebar }: { onOpenSidebar?: () => void }) => {
  const params = useParams<{ nodeId?: string }>();
  const { api } = useChatScope();
  const { data, mutate } = useSWR<
    IChat<{
      Participants: { Identity: Record<never, never> };
      Messages: Record<string, never>;
    }>
  >(
    params.nodeId ? `${api}/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { refreshInterval: 1000 },
  );

  const getContent = useScopedLocale(LOCALE_NS);

  if (!params.nodeId)
    return (
      <div className={classes.main}>
        <div className={classes.emptyHeader}>
          <button
            type="button"
            className={classes.menuToggle}
            aria-label={getContent("menu")}
            onClick={onOpenSidebar}
          >
            <Ixon width="1.25rem">
              <BarsIcon />
            </Ixon>
          </button>
        </div>
        <div className={classes.empty}>
          <span className={classes.emptyIcon} aria-hidden>
            <Ixon width="1.75rem">
              <ChatIcon />
            </Ixon>
          </span>
          <p>{getContent("selectAChatFirstMessage")}</p>
          <button type="button" className={classes.emptyOpen} onClick={onOpenSidebar}>
            {getContent("chats")}
          </button>
        </div>
      </div>
    );
  if (!data) return <Loading />;
  return <InnerChat chat={data} mutate={mutate} onOpenSidebar={onOpenSidebar} />;
};

export default CurrentChat;
