"use client";
import useSWR from "swr";
import classes from "./TicketPage.module.css";
import {
  ITicket,
  ticketStatusesContentKeyDict,
  ticketSubjectContentKeyDict,
} from "./SupportPage";
import { useParams } from "next/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useLocale from "@/Components/Hooks/useLocale";
import useForm from "@/Components/Hooks/useForm";
import Badge from "@/Components/UI/Badge";
import Button from "@/Components/UI/Button";
import Form from "@/Components/UI/Form";
import Ixon from "@/Components/UI/Ixon";
import FormatDate from "@/Components/UI/FormatDate";
import SendIcon from "@/Components/Icons/SendIcon";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import { useEffect, useMemo, useRef } from "react";

type FullTicket = ITicket<{ Messages: Record<never, never> }>;
type TicketMessageItem = FullTicket["messages"][number];

const TicketMessageBubble = ({ message }: { message: TicketMessageItem }) => {
  return (
    <div
      className={`${classes.message} ${
        !message.isAdmin ? classes.selfMessage : ""
      }`}
    >
      <p className={classes.messageContent}>{message.content}</p>
      <FormatDate className={classes.messageDate} value={message.submittedAt} />
    </div>
  );
};

const CloseTicketAction = ({
  nodeId,
  mutate,
}: {
  nodeId: string;
  mutate: () => unknown;
}) => {
  const getContent = useLocale();

  const { submit, isLoading } = useForm<Record<string, never>>({
    path: `${API}/support/${nodeId}`,
    method: "PUT",
    successCb: () => mutate(),
  });

  return (
    <Button
      variant="Error"
      mode="Outline"
      size="S"
      isLoading={isLoading}
      onClick={() => submit()}
    >
      {getContent("closeTicket")}
    </Button>
  );
};

const MessageSender = ({
  nodeId,
  mutate,
}: {
  nodeId: string;
  mutate: () => unknown;
}) => {
  const getContent = useLocale();

  const textRef = useRef<HTMLTextAreaElement>(null);

  const { setInput, submit, reset, isLoading } = useForm<{
    content: string;
  }>({
    path: `${API}/support/${nodeId}`,
    method: "POST",
    hasProblem: (inp) =>
      !inp.content?.trim() && getContent("missingMessageErrorMessage"),
    successCb: () => {
      mutate();
      reset();
      if (textRef.current) textRef.current.value = "";
    },
  });

  return (
    <Form className={classes.footer} onSubmit={submit}>
      <textarea
        ref={textRef}
        className={classes.textInput}
        placeholder={getContent("writeYourMessage")}
        rows={1}
        onChange={(e) =>
          setInput((prev) => ({ ...prev, content: e.target.value }))
        }
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button
        type="submit"
        className={classes.send}
        disabled={isLoading}
        aria-label={getContent("sendMessage")}
      >
        <Ixon width="1.25rem">
          <SendIcon />
        </Ixon>
      </button>
    </Form>
  );
};

const InnerTicket = ({
  ticket,
  mutate,
}: {
  ticket: FullTicket;
  mutate: () => unknown;
}) => {
  const getContent = useLocale();

  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(
    () =>
      [...ticket.messages].sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
      ),
    [ticket.messages],
  );

  const isClosed = ticket.status === "Closed";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <Button
          href="/dashboard/support"
          mode="Inline"
          size="S"
          leadIcon={<ArrowLeftIcon />}
        >
          {getContent("backToList")}
        </Button>
        {!isClosed && <CloseTicketAction nodeId={ticket._id} mutate={mutate} />}
      </div>

      <div className={classes.card}>
        <div className={classes.cardHeader}>
          <div className={classes.headerInfo}>
            <span className={classes.title}>{ticket.title}</span>
            <FormatDate className={classes.date} value={ticket.submittedAt} />
          </div>
          <div className={classes.badges}>
            <Badge mode="Outline">
              {getContent(ticketSubjectContentKeyDict[ticket.subject])}
            </Badge>
            <Badge mode="Outline" color="Secondary">
              {getContent(ticketStatusesContentKeyDict[ticket.status])}
            </Badge>
          </div>
        </div>

        <div className={classes.body}>
          {!!messages.length ? (
            <>
              {messages.map((message) => (
                <TicketMessageBubble key={message._id} message={message} />
              ))}
              <div ref={bottomRef} />
            </>
          ) : (
            <p className={classes.empty}>{getContent("noMessagesYet")}</p>
          )}
        </div>

        {isClosed && (
          <p className={classes.closedNotice}>
            {getContent("ticketClosedNotice")}
          </p>
        )}

        <MessageSender nodeId={ticket._id} mutate={mutate} />
      </div>
    </div>
  );
};

const TicketPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<FullTicket>(
    `${API}/support/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { refreshInterval: 5000 },
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && <InnerTicket ticket={data} mutate={mutate} />}
    </HandleLoading>
  );
};

export default TicketPage;
