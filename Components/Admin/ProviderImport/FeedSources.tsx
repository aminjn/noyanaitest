"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import { adminIntlTag, adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import Input from "@/Components/UI/Input";
import SelectInput from "@/Components/UI/SelectInput";
import ToggleInput from "@/Components/UI/ToggleInput";
import Box from "@/Components/Admin/UI/Box";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import usePopup from "@/Components/Hooks/usePopup";
import classes from "./ProviderImport.module.css";

// «اتصال خودکار (API)»: a contracted partner's live feed (backend
// Services/providerImportFeed.ts). The admin pastes the feed's address once
// (its key stays on the server, shown masked); the server reads it on its
// schedule or on «همگام‌سازی الان» - only what changed since the last run,
// page by page - and each run lands in «ورود گروهی (JSON)»'s history with
// its report, through the same partner template as an uploaded file.
//
// Benchmark: Doctolib and Docplanner sync a partner directory through a
// scheduled incremental API rather than file drops; NoyanAI does the same
// and keeps the file upload for one-off sources.

const BASE = `${API}/admin/import/feeds`;
const numbers = adminNumberFormat();

type Feed = {
  _id: string;
  name: string;
  url: string;
  enabled: boolean;
  intervalHours: number;
  syncedUntil?: string;
  syncing?: boolean;
  lastRun?: { at: string; status: "done" | "empty" | "failed"; records?: number; error?: string };
};

const INTERVALS = (): Record<string, string> => ({
  "0": ta("فقط دستی"),
  "6": ta("هر ۶ ساعت"),
  "12": ta("هر ۱۲ ساعت"),
  "24": ta("روزی یک بار"),
  "168": ta("هفته‌ای یک بار"),
});

const when = (iso?: string) =>
  iso ? new Date(iso).toLocaleString(adminIntlTag(), { timeZone: "Asia/Tehran", dateStyle: "medium", timeStyle: "short" }) : "";

const FeedForm = ({ feed, onSaved, onCancel }: { feed?: Feed; onSaved: () => void; onCancel?: () => void }) => {
  const pushNotification = useNotification();
  const [name, setName] = useState(feed?.name || "");
  const [url, setUrl] = useState(feed?.url || "");
  const [interval, setInterval] = useState(String(feed?.intervalHours ?? 24));
  const [enabled, setEnabled] = useState(feed?.enabled ?? true);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!name.trim() || !url.trim() || saving) return;
    setSaving(true);
    try {
      await fetcher({
        url: BASE,
        method: "POST",
        payload: { ...(feed ? { _id: feed._id } : {}), name: name.trim(), url: url.trim(), enabled, intervalHours: Number(interval) },
      });
      pushNotification(ta("منبع ذخیره شد"), "Success");
      onSaved();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className={classes.feedForm}>
      <Input title={ta("نام منبع")} defaultValue={name} onChange={(e) => setName(e.target.value)} />
      <Input
        title={ta("آدرس داده‌ها (همراه کلید)")}
        defaultValue={url}
        onChange={(e) => setUrl(e.target.value)}
        inputMode="url"
      />
      <SelectInput title={ta("زمان‌بندی")} options={INTERVALS()} defaultValue={interval} onChange={(e) => setInterval(e.target.value)} />
      <ToggleInput title={ta("فعال")} value={enabled} onChange={() => setEnabled((v) => !v)} />
      <div className={classes.actionsRow}>
        <Button size="M" variant={name.trim() && url.trim() ? "Primary" : "Disable"} isLoading={saving} onClick={save}>
          {feed ? ta("ذخیره") : ta("افزودن منبع")}
        </Button>
        {!!onCancel && (
          <Button size="M" variant="Neutral" onClick={onCancel}>
            {ta("انصراف")}
          </Button>
        )}
      </div>
    </div>
  );
};

const DeleteFeedPopup = ({ feed, onDone }: { feed: Feed; onDone: () => unknown }) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [loading, setLoading] = useState(false);
  const remove = async () => {
    setLoading(true);
    try {
      await fetcher({ url: `${BASE}/${feed._id}`, method: "DELETE" });
      onDone();
      closePopup();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setLoading(false);
    }
  };
  return <ConfirmationPopup message={ta("منبع «${1}» حذف شود؟ پروفایل‌هایی که از آن وارد شده‌اند می‌مانند.", [feed.name])} onConfirm={remove} isLoading={loading} />;
};

const statusBadge = (feed: Feed) => {
  if (feed.syncing) return <Badge color="Info">{ta("در حال همگام‌سازی")}</Badge>;
  if (!feed.lastRun) return <Badge color="Secondary">{ta("هنوز اجرا نشده")}</Badge>;
  if (feed.lastRun.status === "failed") return <Badge color="Error">{ta("ناموفق")}</Badge>;
  if (feed.lastRun.status === "empty") return <Badge color="Secondary">{ta("تغییری نبود")}</Badge>;
  return <Badge color="Success">{ta("${1} رکورد وارد شد", [numbers.format(feed.lastRun.records || 0)])}</Badge>;
};

const FeedSources = () => {
  const pushNotification = useNotification();
  const { data, mutate } = useSWR<Feed[]>(
    BASE,
    (url: string) => fetcher({ url }).then((r) => (Array.isArray(r.data) ? r.data : [])),
    // a run in progress is followed until it ends
    { refreshInterval: (rows) => (rows?.some((f) => f?.syncing) ? 4000 : 0) },
  );
  const [editing, setEditing] = useState<string | null>(null);
  const { setPopup } = usePopup();
  const [busy, setBusy] = useState<string | null>(null);
  const feeds = Array.isArray(data) ? data.filter((f) => f && f._id) : [];

  const sync = async (feed: Feed) => {
    setBusy(feed._id);
    try {
      await fetcher({ url: `${BASE}/${feed._id}/sync`, method: "POST" });
      await mutate();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className={classes.main}>
      <Box className={classes.section}>
        <h3 className={classes.sectionTitle}>{ta("اتصال خودکار (API)")}</h3>
        <p className={classes.hint}>
          {ta("آدرس داده‌های شریک را یک بار وارد کنید؛ سرور خودش طبق زمان‌بندی (یا با «همگام‌سازی الان») فقط تغییرات بعد از آخرین اجرا را صفحه‌به‌صفحه می‌خواند و با همان قالب شریک وارد می‌کند. پزشک یا مرکز تکراری ساخته نمی‌شود و پروفایل ادعاشده فقط در فیلدهای خالی پر می‌شود. گزارش هر اجرا در تاریخچه‌ی «ورود گروهی (JSON)» است. کلید فقط روی سرور می‌ماند.")}
        </p>
        {feeds.length ? (
          <ul className={classes.feedList}>
            {feeds.map((feed) =>
              editing === feed._id ? (
                <li key={feed._id} className={classes.feedRow}>
                  <FeedForm
                    feed={feed}
                    onCancel={() => setEditing(null)}
                    onSaved={() => {
                      setEditing(null);
                      mutate();
                    }}
                  />
                </li>
              ) : (
                <li key={feed._id} className={classes.feedRow}>
                  <div className={classes.feedHead}>
                    <strong dir="auto">{feed.name}</strong>
                    {statusBadge(feed)}
                    {!feed.enabled && <Badge color="Secondary">{ta("غیرفعال")}</Badge>}
                  </div>
                  <code className={classes.feedAddress} dir="ltr">
                    {feed.url}
                  </code>
                  <p className={classes.fieldMeta}>
                    {INTERVALS()[String(feed.intervalHours)] || ta("هر ${1} ساعت", [numbers.format(feed.intervalHours)])}
                    {!!feed.lastRun?.at && <> · {ta("آخرین اجرا: ${1}", [when(feed.lastRun.at)])}</>}
                    {!!feed.syncedUntil && <> · {ta("همگام تا ${1}", [when(feed.syncedUntil)])}</>}
                  </p>
                  {feed.lastRun?.status === "failed" && !!feed.lastRun.error && <p className={classes.feedError}>{feed.lastRun.error}</p>}
                  <div className={classes.rowActions}>
                    <Button size="S" isLoading={busy === feed._id || !!feed.syncing} onClick={feed.syncing ? undefined : () => sync(feed)}>
                      {ta("همگام‌سازی الان")}
                    </Button>
                    <Button size="S" variant="Neutral" onClick={() => setEditing(feed._id)}>
                      {ta("ویرایش")}
                    </Button>
                    <Button size="S" variant="Neutral" onClick={feed.syncing ? undefined : () => setPopup("DeleteImportFeed", <DeleteFeedPopup feed={feed} onDone={mutate} />)}>
                      {ta("حذف")}
                    </Button>
                  </div>
                </li>
              ),
            )}
          </ul>
        ) : (
          <p className={classes.hint}>{ta("هنوز منبعی وصل نشده است.")}</p>
        )}
      </Box>
      <Box className={classes.section}>
        <h3 className={classes.sectionTitle}>{ta("منبع تازه")}</h3>
        <FeedForm key={feeds.length} onSaved={() => mutate()} />
      </Box>
    </div>
  );
};

export default FeedSources;
