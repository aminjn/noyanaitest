"use client";

import { useCallback, useMemo, useState } from "react";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./support.module.css";

// Review moderation shared by comments and doctor feedback (2026-10 audit,
// Docplanner / Doctolib review queues): approve or reject one or many at
// once; a rejection always carries its reason, stored on the record.
// Backend: POST /admin/support/<kind>/moderate.

// blogs: a provider's submitted article (approve = publish)
export type ModerationKind = "comments" | "doctorfeedback" | "blogs";
export type ModerationStatus = "Pending" | "Approved" | "Rejected";

const num = adminNumberFormat();

export const moderate = (
  kind: ModerationKind,
  ids: string[],
  status: ModerationStatus,
  reason?: string,
) =>
  fetcher({
    url: `${API}/admin/support/${kind}/moderate`,
    method: "POST",
    bodyParser: "JSON",
    payload: { ids, status, ...(reason ? { reason } : {}) },
  });

export const RejectReasonPopup = ({
  kind,
  ids,
  onDone,
}: {
  kind: ModerationKind;
  ids: string[];
  onDone: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!reason.trim())
      return pushNotification(ta("برای رد کردن، دلیل آن را بنویسید"), "Warn");
    setSaving(true);
    try {
      await moderate(kind, ids, "Rejected", reason.trim());
      pushNotification(ta("${1} مورد رد شد", [num.format(ids.length)]), "Success");
      closePopup();
      await onDone();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PopupCard title={ta("دلیل رد")}>
      <div className={classes.stack}>
        <p className={classes.hint}>
          {ids.length > 1
            ? ta("این دلیل برای هر ${1} مورد ثبت می‌شود.", [num.format(ids.length)])
            : ta("دلیل رد در سابقه‌ی این مورد ثبت می‌شود.")}
        </p>
        <textarea
          className={classes.textarea}
          value={reason}
          maxLength={500}
          onChange={(e) => setReason(e.target.value)}
          placeholder={ta("مثلاً: توهین‌آمیز، تبلیغاتی، بی‌ربط به ویزیت...")}
        />
        <div className={classes.actions}>
          <Button variant="Error" onClick={submit} isLoading={saving}>
            {ta("رد کردن")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup()}>
            {ta("انصراف")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

// Selection over a list: a checkbox column and a bar with bulk actions.
export const useModeration = <T extends { _id: string; status?: string }>({
  kind,
  rows,
  mutate,
}: {
  kind: ModerationKind;
  rows: T[];
  mutate: () => unknown;
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const { setPopup } = usePopup();
  const pushNotification = useNotification();

  const list = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const toggle = useCallback(
    (id: string) =>
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [],
  );
  const clear = useCallback(() => setSelected(new Set()), []);
  const done = useCallback(async () => {
    clear();
    await mutate();
  }, [clear, mutate]);

  const approve = async (ids: string[]) => {
    if (!ids.length || busy) return;
    setBusy(true);
    try {
      await moderate(kind, ids, "Approved");
      pushNotification(ta("${1} مورد تایید و منتشر شد", [num.format(ids.length)]), "Success");
      await done();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };

  const reject = (ids: string[]) => {
    if (!ids.length) return;
    setPopup("RejectReason", <RejectReasonPopup kind={kind} ids={ids} onDone={done} />);
  };

  const pendingIds = list.filter((r) => (r.status || "Pending") === "Pending").map((r) => r._id);
  const ids = Array.from(selected).filter((id) => list.some((r) => r._id === id));

  const checkboxColumn = {
    name: ta("انتخاب"),
    width: 72,
    value: (node: T) => (selected.has(node._id) ? "1" : ""),
    component: (node: T) => (
      <input
        type="checkbox"
        className={classes.checkbox}
        aria-label={ta("انتخاب")}
        checked={selected.has(node._id)}
        onChange={() => toggle(node._id)}
      />
    ),
  };

  const bar = (
    <div className={classes.bulkBar}>
      <span className={classes.bulkCount}>
        {ids.length
          ? ta("${1} مورد انتخاب شده", [num.format(ids.length)])
          : ta("چند مورد را انتخاب کنید تا یک‌جا تایید یا رد شوند")}
      </span>
      {!!pendingIds.length && (
        <Button size="S" variant="Neutral" onClick={() => setSelected(new Set(pendingIds))}>
          {ta("انتخاب همه‌ی در انتظار (${1})", [num.format(pendingIds.length)])}
        </Button>
      )}
      {!!ids.length && (
        <>
          <Button size="S" variant="Success" onClick={() => approve(ids)} isLoading={busy}>
            {ta("تایید انتخاب‌شده‌ها")}
          </Button>
          <Button size="S" variant="Error" onClick={() => reject(ids)}>
            {ta("رد انتخاب‌شده‌ها")}
          </Button>
          <Button size="S" variant="Neutral" onClick={clear}>
            {ta("لغو انتخاب")}
          </Button>
        </>
      )}
    </div>
  );

  // rows carry the selection so the grid re-renders the checkboxes
  const tableRows = list.map((r) => ({ ...r, __selected: selected.has(r._id) }));

  return { bar, checkboxColumn, tableRows, approve, reject, busy };
};
