"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import {
  TicketSubject,
  ticketSubjectDict,
  ticketSubjects,
} from "@/Components/Dashboard/Support/SupportPage";
import { ta } from "@/Components/Admin/i18n/adminText";
import {
  SupportUser,
  TicketPriority,
  supportUserLabel,
  ticketPriorities,
  ticketPriorityDict,
} from "./supportShared";
import { displayPhone } from "../User/userShared";
import classes from "./support.module.css";

// "Open a ticket for this user" (2026-10 audit): a patient who phoned in, or
// a follow-up support starts. The first message is support's and notifies
// the user. Pass `user` to open it from that user's page.
const OpenTicketPopup = ({
  user: fixedUser,
  onCreated,
}: {
  user?: SupportUser;
  onCreated?: (ticketId: string) => unknown;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<SupportUser | undefined>(fixedUser);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<TicketSubject>("GeneralInquiry");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [content, setContent] = useState("");
  const [assignToMe, setAssignToMe] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: found } = useSWR<SupportUser[]>(
    !fixedUser && query.length >= 3
      ? `${API}/admin/users?limit=10&q=${encodeURIComponent(query)}`
      : null,
    (url: string) =>
      fetcher({ url }).then((res) => {
        const items = res?.data?.data?.items;
        return Array.isArray(items) ? items : [];
      }),
  );

  const submit = async () => {
    if (!user) return pushNotification(ta("کاربر را انتخاب کنید"), "Warn");
    if (!title.trim() || !content.trim())
      return pushNotification(ta("عنوان و متن پیام را بنویسید"), "Warn");
    setSaving(true);
    try {
      const res = await fetcher({
        url: `${API}/admin/support/tickets`,
        method: "POST",
        bodyParser: "JSON",
        payload: { user: user._id, title, subject, priority, content, assignToMe },
      });
      pushNotification(ta("تیکت باز شد و به کاربر خبر داده شد"), "Success");
      closePopup();
      const id = res?.data?.data?._id;
      if (id) onCreated?.(id);
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PopupCard title={ta("تیکت برای کاربر")} size="wide">
      <div className={classes.stack}>
        {fixedUser ? (
          <p className={classes.hint}>
            {ta("کاربر: ${1}", [supportUserLabel(fixedUser)])}
          </p>
        ) : (
          <div className={classes.field}>
            <span>{ta("کاربر")}</span>
            <input
              className={classes.search}
              style={{ maxWidth: "none" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ta("جستجو با موبایل، نام یا کد ملی...")}
            />
            <div className={classes.results}>
              {user && (
                <button type="button" className={`${classes.result} ${classes.resultActive}`}>
                  <span>{supportUserLabel(user)}</span>
                  <span dir="ltr">{displayPhone(user.phone)}</span>
                </button>
              )}
              {(Array.isArray(found) ? found : [])
                .filter((u) => u._id !== user?._id)
                .map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    className={classes.result}
                    onClick={() => setUser(u)}
                  >
                    <span>{supportUserLabel(u)}</span>
                    <span dir="ltr">{displayPhone(u.phone)}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
        <label className={classes.field}>
          <span>{ta("عنوان")}</span>
          <input
            className={classes.search}
            style={{ maxWidth: "none" }}
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <div className={classes.toolbar}>
          <label className={classes.field}>
            <span>{ta("موضوع")}</span>
            <select
              className={classes.select}
              value={subject}
              onChange={(e) => setSubject(e.target.value as TicketSubject)}
            >
              {ticketSubjects.map((s) => (
                <option key={s} value={s}>
                  {ticketSubjectDict[s]}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            <span>{ta("اولویت")}</span>
            <select
              className={classes.select}
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
            >
              {ticketPriorities.map((p) => (
                <option key={p} value={p}>
                  {ticketPriorityDict[p]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={classes.field}>
          <span>{ta("پیام پشتیبانی به کاربر")}</span>
          <textarea
            className={classes.textarea}
            value={content}
            maxLength={5000}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        <label className={classes.toolbar}>
          <input
            type="checkbox"
            className={classes.checkbox}
            checked={assignToMe}
            onChange={(e) => setAssignToMe(e.target.checked)}
          />
          <span className={classes.muted}>{ta("مسئول این تیکت خودم باشم")}</span>
        </label>
        <div className={classes.actions}>
          <Button onClick={submit} isLoading={saving}>
            {ta("باز کردن تیکت")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export default OpenTicketPopup;
