"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import pageClasses from "./AdminManageTicketPage.module.css";
import classes from "./support.module.css";
import {
  TicketStatus,
  ticketStatusDict,
  ticketStatuses,
  ticketSubjectDict,
} from "@/Components/Dashboard/Support/SupportPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import FormatDate from "@/Components/UI/FormatDate";
import Form from "@/Components/UI/Form";
import Ixon from "@/Components/UI/Ixon";
import Button from "@/Components/UI/Button";
import SendIcon from "@/Components/Icons/SendIcon";
import useForm from "@/Components/Hooks/useForm";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import useNotification from "@/Components/Hooks/useNotification";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import DeleteTicketPopup from "./DeleteTicketPopup";
import { useEffect, useMemo, useRef, useState } from "react";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import {
  AdminTicketDetail,
  AdminTicketMessage,
  PriorityBadge,
  TicketPriority,
  WaitingBadge,
  formatHours,
  hoursSince,
  supportUserLabel,
  ticketPriorities,
  ticketPriorityDict,
  useSupportStaff,
} from "./supportShared";

const num = adminNumberFormat();

const TicketMessageBubble = ({ message }: { message: AdminTicketMessage }) => (
  <div className={`${pageClasses.message} ${message.isAdmin ? pageClasses.selfMessage : ""}`}>
    <p className={pageClasses.messageContent}>{message.content}</p>
    <FormatDate className={pageClasses.messageDate} value={message.submittedAt} />
  </div>
);

const ReplySender = ({ ticketId, mutate }: { ticketId: string; mutate: () => unknown }) => {
  const textRef = useRef<HTMLTextAreaElement>(null);

  // the server marks every staff reply as support's (autoRouter editSchema)
  const { setInput, submit, reset, isLoading } = useForm<{ content: string }>({
    path: `${API}/auto/ticketmessage`,
    method: "POST",
    decorators: { ticket: ticketId },
    hasProblem: (inp) => !inp.content?.trim() && ta("متن پاسخ را وارد کنید"),
    successCb: () => {
      mutate();
      reset();
      if (textRef.current) textRef.current.value = "";
    },
  });

  return (
    <Form className={pageClasses.footer} onSubmit={submit}>
      <textarea
        ref={textRef}
        className={pageClasses.textInput}
        placeholder={ta("پاسخ خود را بنویسید...")}
        rows={1}
        onChange={(e) => setInput((prev) => ({ ...prev, content: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button
        type="submit"
        className={pageClasses.send}
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

// status, priority and assignee: each saved as soon as it changes
const HandlingPanel = ({
  ticket,
  mutate,
  canEdit,
}: {
  ticket: AdminTicketDetail;
  mutate: () => unknown;
  canEdit: boolean;
}) => {
  const { data: staff } = useSupportStaff();
  const pushNotification = useNotification();
  const [saving, setSaving] = useState(false);

  const save = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      await fetcher({
        url: `${API}/admin/support/tickets/${ticket._id}`,
        method: "PATCH",
        bodyParser: "JSON",
        payload,
      });
      pushNotification(ta("ذخیره شد"), "Success");
      await mutate();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setSaving(false);
    }
  };

  const assigneeId = ticket.assignee?._id || "";
  const staffList = Array.isArray(staff) ? staff : [];

  return (
    <div className={classes.panel}>
      <span className={classes.panelTitle}>{ta("رسیدگی")}</span>
      <label className={classes.field}>
        <span>{ta("وضعیت")}</span>
        <select
          className={classes.select}
          value={ticket.status}
          disabled={!canEdit || saving}
          onChange={(e) => save({ status: e.target.value as TicketStatus })}
        >
          {ticketStatuses.map((s) => (
            <option key={s} value={s}>
              {ticketStatusDict[s]}
            </option>
          ))}
        </select>
      </label>
      <label className={classes.field}>
        <span>{ta("اولویت")}</span>
        <select
          className={classes.select}
          value={ticket.priority || "normal"}
          disabled={!canEdit || saving}
          onChange={(e) => save({ priority: e.target.value as TicketPriority })}
        >
          {ticketPriorities.map((p) => (
            <option key={p} value={p}>
              {ticketPriorityDict[p]}
            </option>
          ))}
        </select>
      </label>
      <label className={classes.field}>
        <span>{ta("مسئول")}</span>
        <select
          className={classes.select}
          value={assigneeId}
          disabled={!canEdit || saving}
          onChange={(e) => save({ assignee: e.target.value || null })}
        >
          <option value="">{ta("بدون مسئول")}</option>
          {assigneeId && !staffList.some((s) => s._id === assigneeId) && (
            <option value={assigneeId}>{supportUserLabel(ticket.assignee)}</option>
          )}
          {staffList.map((s) => (
            <option key={s._id} value={s._id}>
              {supportUserLabel(s)}
            </option>
          ))}
        </select>
      </label>
      <div className={classes.facts}>
        <div className={classes.fact}>
          <span>{ta("منتظر")}</span>
          <span>
            <WaitingBadge timing={ticket} />
          </span>
        </div>
        <div className={classes.fact}>
          <span>{ta("عمر تیکت")}</span>
          <span>{formatHours(ticket.ageHours || hoursSince(ticket.submittedAt))}</span>
        </div>
        <div className={classes.fact}>
          <span>{ta("اولین پاسخ")}</span>
          <span>
            {ticket.firstResponseAt
              ? formatHours(
                  (new Date(ticket.firstResponseAt).getTime() - new Date(ticket.submittedAt).getTime()) /
                    3600_000,
                )
              : ta("هنوز پاسخی داده نشده")}
          </span>
        </div>
        {ticket.slaDueAt && (
          <div className={classes.fact}>
            <span>{ta("مهلت پاسخ")}</span>
            <span>
              <FormatDate value={ticket.slaDueAt} />
            </span>
          </div>
        )}
        {ticket.openedBy && (
          <div className={classes.fact}>
            <span>{ta("باز شده توسط پشتیبانی")}</span>
            <span>{supportUserLabel(ticket.openedBy)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const UserPanel = ({ ticket }: { ticket: AdminTicketDetail }) => {
  const user = ticket.submittedBy;
  const ctx = ticket.context || { otherTickets: [], reservations: 0, orders: 0 };
  const others = Array.isArray(ctx.otherTickets) ? ctx.otherTickets : [];
  return (
    <div className={classes.panel}>
      <span className={classes.panelTitle}>{ta("کاربر")}</span>
      {user?._id ? (
        <div className={classes.links}>
          <InlineLink href={adminPath(`/user/${user._id}`)}>{supportUserLabel(user)}</InlineLink>
          <span className={classes.muted}>
            {ta("${1} نوبت، ${2} سفارش", [num.format(ctx.reservations || 0), num.format(ctx.orders || 0)])}
          </span>
          <InlineLink href={adminPath(`/user/${user._id}`)}>
            {ta("نوبت‌ها، سفارش‌ها و تراکنش‌های کاربر")}
          </InlineLink>
        </div>
      ) : (
        <span className={classes.muted}>—</span>
      )}
      {!!others.length && (
        <div className={classes.links}>
          <span className={classes.muted}>{ta("تیکت‌های دیگر این کاربر")}</span>
          {others.map((t) => (
            <InlineLink key={t._id} href={adminPath(`/ticket/${t._id}`)}>
              {`${t.title || ta("بدون عنوان")} (${ticketStatusDict[t.status] || t.status})`}
            </InlineLink>
          ))}
        </div>
      )}
    </div>
  );
};

// staff-only notes: never shown to the user (select:false on the server)
const NotesPanel = ({
  ticket,
  mutate,
  canEdit,
}: {
  ticket: AdminTicketDetail;
  mutate: () => unknown;
  canEdit: boolean;
}) => {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const pushNotification = useNotification();
  const notes = Array.isArray(ticket.internalNotes) ? ticket.internalNotes : [];

  const add = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await fetcher({
        url: `${API}/admin/support/tickets/${ticket._id}/notes`,
        method: "POST",
        bodyParser: "JSON",
        payload: { content: text.trim() },
      });
      setText("");
      await mutate();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={classes.panel}>
      <span className={classes.panelTitle}>{ta("یادداشت داخلی")}</span>
      <p className={classes.hint}>{ta("فقط کارکنان این یادداشت‌ها را می‌بینند.")}</p>
      {!!notes.length && (
        <div className={classes.notes}>
          {notes.map((note) => (
            <div key={note._id} className={classes.note}>
              {note.content}
              <span className={classes.noteMeta}>
                {supportUserLabel(note.author)} · <FormatDate value={note.at} />
              </span>
            </div>
          ))}
        </div>
      )}
      {canEdit && (
        <>
          <textarea
            className={classes.textarea}
            value={text}
            maxLength={5000}
            onChange={(e) => setText(e.target.value)}
            placeholder={ta("یادداشت برای همکاران...")}
          />
          <div className={classes.actions}>
            <Button size="S" onClick={add} isLoading={saving}>
              {ta("افزودن یادداشت")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const InnerAdminTicket = ({ ticket, mutate }: { ticket: AdminTicketDetail; mutate: () => unknown }) => {
  const { setPopup } = usePopup();
  const push = useProgress();
  const hasAccess = useAccessLevel();
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(
    () =>
      [...(Array.isArray(ticket.messages) ? ticket.messages : [])].sort(
        (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
      ),
    [ticket.messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const canEdit = hasAccess("Ticket", "update");

  return (
    <WithTitle
      title={ta("تیکت: ${1}", [ticket.title || ta("بدون عنوان")])}
      actions={
        hasAccess("Ticket", "delete")
          ? [
              {
                title: ta("حذف"),
                danger: true,
                action: () =>
                  setPopup(
                    "DeleteTicket",
                    <DeleteTicketPopup ticket={ticket} mutate={() => push(adminPath("/ticket"))} />,
                  ),
              },
            ]
          : undefined
      }
    >
      <div className={classes.toolbar}>
        <PriorityBadge priority={ticket.priority} />
        <span className={classes.pill}>{ticketStatusDict[ticket.status] || ticket.status}</span>
        <span className={classes.muted}>
          {ticketSubjectDict[ticket.subject] || ticket.subject} · <FormatDate value={ticket.submittedAt} />
        </span>
      </div>
      <div className={classes.ticketLayout}>
        <div className={pageClasses.card}>
          <div className={pageClasses.body}>
            {!!messages.length ? (
              <>
                {messages.map((message) => (
                  <TicketMessageBubble key={message._id} message={message} />
                ))}
                <div ref={bottomRef} />
              </>
            ) : (
              <p className={pageClasses.empty}>{ta("هنوز پیامی ثبت نشده است")}</p>
            )}
          </div>
          {hasAccess("Ticket", "write") && <ReplySender ticketId={ticket._id} mutate={mutate} />}
        </div>
        <div className={classes.side}>
          <HandlingPanel ticket={ticket} mutate={mutate} canEdit={canEdit} />
          <UserPanel ticket={ticket} />
          <NotesPanel ticket={ticket} mutate={mutate} canEdit={canEdit} />
        </div>
      </div>
    </WithTitle>
  );
};

const AdminManageTicketPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<AdminTicketDetail>(
    params?.nodeId ? `${API}/admin/support/tickets/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
    { refreshInterval: 10_000 },
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && <InnerAdminTicket ticket={data} mutate={mutate} />}
    </HandleLoading>
  );
};

export default AdminManageTicketPage;
