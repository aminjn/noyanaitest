"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import FormatDate from "@/Components/UI/FormatDate";
import { useEffect, useState } from "react";
import Button from "@/Components/UI/Button";
import InlineLink from "../UI/InlineLink";
import useNotification from "@/Components/Hooks/useNotification";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import supportClasses from "../Support/support.module.css";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import RequestInfoGrid from "../BecomeRequest/RequestInfoGrid";
import { displayPhone, faDateTime } from "../User/userShared";
import {
  ContactRequestStatus,
  contactRequestStatusDict,
  contactRequestStatuses,
  contactRequestSubjectDict,
  IContactRequest,
} from "./AdminManageContactRequestsPage";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminManageContactRequestPage.module.css";

// Handling: a staff note, the status, and "convert to ticket" - the message
// becomes a ticket of the account with the same phone (then the answer
// reaches the user in their panel). Without such an account the note is
// kept and support calls back. Who handled it is recorded by the server.
const ContactHandling = ({
  data,
  mutate,
}: {
  data: IContactRequest;
  mutate: () => unknown;
}) => {
  const pushNotification = useNotification();
  const push = useProgress();
  const hasAccess = useAccessLevel();
  const [note, setNote] = useState(data.internalNote || "");
  const [status, setStatus] = useState<ContactRequestStatus>(data.status || "pending");
  const [saving, setSaving] = useState<"" | "save" | "convert">("");
  useEffect(() => {
    setNote(data.internalNote || "");
    setStatus(data.status || "pending");
  }, [data.internalNote, data.status]);

  const canEdit = hasAccess("ContactRequest", "update");
  const ticketId = typeof data.ticket === "string" ? data.ticket : data.ticket?._id;
  const handledBy =
    data.handledBy && typeof data.handledBy === "object"
      ? data.handledBy.username || displayPhone(data.handledBy.phone)
      : "";

  const save = async () => {
    setSaving("save");
    try {
      await fetcher({
        url: `${API}/admin/support/contact/${data._id}`,
        method: "POST",
        bodyParser: "JSON",
        payload: { internalNote: note, status },
      });
      pushNotification(ta("ذخیره شد"), "Success");
      await mutate();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setSaving("");
    }
  };

  const convert = async () => {
    setSaving("convert");
    try {
      const res = await fetcher({
        url: `${API}/admin/support/contact/${data._id}/convert`,
        method: "POST",
        bodyParser: "JSON",
        payload: note ? { internalNote: note } : {},
      });
      pushNotification(ta("تیکت ساخته شد"), "Success");
      const id = res?.data?.data?._id;
      if (id) push(adminPath(`/ticket/${id}`));
      else await mutate();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
      await mutate();
    } finally {
      setSaving("");
    }
  };

  return (
    <div className={supportClasses.panel}>
      <span className={supportClasses.panelTitle}>{ta("رسیدگی")}</span>
      {(handledBy || data.handledAt) && (
        <p className={supportClasses.hint}>
          {ta("آخرین رسیدگی: ${1}", [
            [handledBy, data.handledAt ? faDateTime.format(new Date(data.handledAt)) : ""]
              .filter(Boolean)
              .join(" · "),
          ])}
        </p>
      )}
      {ticketId && (
        <InlineLink href={adminPath(`/ticket/${ticketId}`)}>{ta("مشاهده‌ی تیکت")}</InlineLink>
      )}
      <label className={supportClasses.field}>
        <span>{ta("یادداشت داخلی")}</span>
        <textarea
          className={supportClasses.textarea}
          value={note}
          maxLength={5000}
          disabled={!canEdit}
          onChange={(e) => setNote(e.target.value)}
          placeholder={ta("مثلاً: تماس گرفته شد، پاسخ نداد...")}
        />
      </label>
      <label className={supportClasses.field}>
        <span>{ta("وضعیت")}</span>
        <select
          className={supportClasses.select}
          value={status}
          disabled={!canEdit}
          onChange={(e) => setStatus(e.target.value as ContactRequestStatus)}
        >
          {contactRequestStatuses.map((s) => (
            <option key={s} value={s}>
              {contactRequestStatusDict[s]}
            </option>
          ))}
        </select>
      </label>
      {canEdit && (
        <div className={supportClasses.actions}>
          <Button size="M" onClick={save} isLoading={saving === "save"}>
            {ta("ثبت")}
          </Button>
          {!ticketId && hasAccess("Ticket", "write") && (
            <Button
              size="M"
              variant="Neutral"
              onClick={convert}
              isLoading={saving === "convert"}
            >
              {ta("تبدیل به تیکت")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// A visitor's contact-form message: what they wrote is shown as read-only
// facts; staff handle it below (or delete it).
const AdminManageContactRequestPage = () => {
  const params = useParams<{ nodeId: string }>();
  const nodeId = params?.nodeId;
  const { data, error, mutate } = useSWR<IContactRequest | null>(
    nodeId ? `${API}/auto/contactRequest/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res?.data?.data ?? null),
  );

  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={data.name || ta("بدون نام")}
          actions={[
            {
              title: ta("حذف"),
              danger: true,
              action: () =>
                setPopup(
                  "DeleteContactRequest",
                  <DeleteShitPopup
                    modelName="contactRequest"
                    nodeId={data._id}
                    mutate={() => push(adminPath("/contactRequest"))}
                  />,
                ),
            },
          ]}
        >
          <div className={classes.main}>
            <RequestInfoGrid
              items={[
                { label: ta("نام"), value: data.name },
                {
                  label: ta("شماره"),
                  value: data.phone ? (
                    <a href={`tel:${displayPhone(data.phone)}`} dir="ltr">
                      {displayPhone(data.phone)}
                    </a>
                  ) : undefined,
                },
                {
                  label: ta("ایمیل"),
                  value: data.email ? (
                    <a href={`mailto:${data.email}`} dir="ltr">
                      {data.email}
                    </a>
                  ) : undefined,
                },
                {
                  label: ta("موضوع"),
                  value: data.subject
                    ? contactRequestSubjectDict[data.subject] || data.subject
                    : undefined,
                },
                {
                  label: ta("زمان ثبت"),
                  value: data.submittedAt ? (
                    <FormatDate value={data.submittedAt} />
                  ) : undefined,
                },
                { label: ta("پیام"), value: data.content, wide: true },
              ]}
            />
            <ContactHandling data={data} mutate={mutate} />
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageContactRequestPage;
