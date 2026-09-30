"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import classes from "./AdminManageTicketPage.module.css";
import {
  ITicket,
  ticketStatusDict,
  ticketSubjectDict,
} from "@/Components/Dashboard/Support/SupportPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import FormatDate from "@/Components/UI/FormatDate";
import Badge from "@/Components/UI/Badge";
import Form from "@/Components/UI/Form";
import Ixon from "@/Components/UI/Ixon";
import SendIcon from "@/Components/Icons/SendIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import useForm from "@/Components/Hooks/useForm";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import ChangeTicketStatusPopup from "./ChangeTicketStatusPopup";
import DeleteTicketPopup from "./DeleteTicketPopup";
import { useEffect, useMemo, useRef } from "react";
import { ta } from "@/Components/Admin/i18n/adminText";

type AdminTicket = ITicket<{
  SubmittedBy: Record<never, never>;
  Messages: Record<never, never>;
}>;
type AdminTicketMessage = AdminTicket["messages"][number];

const TicketMessageBubble = ({ message }: { message: AdminTicketMessage }) => {
  return (
    <div
      className={`${classes.message} ${
        message.isAdmin ? classes.selfMessage : ""
      }`}
    >
      <p className={classes.messageContent}>{message.content}</p>
      <FormatDate className={classes.messageDate} value={message.submittedAt} />
    </div>
  );
};

const ReplySender = ({
  ticketId,
  mutate,
}: {
  ticketId: string;
  mutate: () => unknown;
}) => {
  const textRef = useRef<HTMLTextAreaElement>(null);

  const { setInput, submit, reset, isLoading } = useForm<{ content: string }>({
    path: `${API}/auto/ticketmessage`,
    method: "POST",
    decorators: { ticket: ticketId, isAdmin: true },
    hasProblem: (inp) => !inp.content?.trim() && ta("متن پاسخ را وارد کنید"),
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
        placeholder={ta("پاسخ خود را بنویسید...")}
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
        aria-label={ta("ارسال پاسخ")}
      >
        <Ixon width="1.25rem">
          <SendIcon />
        </Ixon>
      </button>
    </Form>
  );
};

const InnerAdminTicket = ({
  ticket,
  mutate,
}: {
  ticket: AdminTicket;
  mutate: () => unknown;
}) => {
  const { setPopup } = usePopup();

  const push = useProgress();

  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(
    () =>
      [...(Array.isArray(ticket.messages) ? ticket.messages : [])].sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
      ),
    [ticket.messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <WithTitle
      title={ta("تیکت: ${1}", [ticket.title || ta("بدون عنوان")])}
      actions={[
        {
          title: ta("تغییر وضعیت"),
          icon: <EditIcon />,
          action: () =>
            setPopup(
              "ChangeTicketStatus",
              <ChangeTicketStatusPopup ticket={ticket} mutate={mutate} />,
            ),
        },
        {
          title: ta("حذف"),
          danger: true,
          action: () =>
            setPopup(
              "DeleteTicket",
              <DeleteTicketPopup
                ticket={ticket}
                mutate={() => push(adminPath("/ticket"))}
              />,
            ),
        },
      ]}
    >
      <List>
        <DataPair
          title={ta("کاربر")}
          value={
            ticket.submittedBy?._id ? (
              <InlineLink href={adminPath(`/user/${ticket.submittedBy._id}`)}>
                {ticket.submittedBy.phone || "—"}
              </InlineLink>
            ) : (
              "—"
            )
          }
        />
        <DataPair title={ta("موضوع")} value={ticketSubjectDict[ticket.subject] || ticket.subject || "—"} />
        <DataPair
          title={ta("وضعیت")}
          value={
            <Badge mode="Outline">
              {ticketStatusDict[ticket.status] || ticket.status || "—"}
            </Badge>
          }
        />
        <DataPair
          title={ta("زمان ثبت")}
          value={<FormatDate value={ticket.submittedAt} />}
        />
      </List>

      <div className={classes.card}>
        <div className={classes.body}>
          {!!messages.length ? (
            <>
              {messages.map((message) => (
                <TicketMessageBubble key={message._id} message={message} />
              ))}
              <div ref={bottomRef} />
            </>
          ) : (
            <p className={classes.empty}>{ta("هنوز پیامی ثبت نشده است")}</p>
          )}
        </div>
        <ReplySender ticketId={ticket._id} mutate={mutate} />
      </div>
    </WithTitle>
  );
};

const AdminManageTicketPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<AdminTicket>(
    params ? `${API}/auto/ticket/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
    { refreshInterval: 5000 },
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && <InnerAdminTicket ticket={data} mutate={mutate} />}
    </HandleLoading>
  );
};

export default AdminManageTicketPage;
