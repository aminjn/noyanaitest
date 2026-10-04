"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import classes from "./AdminManageMigrationPage.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import { API } from "@/Components/config";
import { fetcher, FetchMethod } from "@/Components/helpers/fetcher";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import Input from "@/Components/UI/Input";
import ToggleInput from "@/Components/UI/ToggleInput";
import Box from "@/Components/Admin/UI/Box";
import Table from "@/Components/Admin/UI/Table";
import MapJobProgress from "@/Components/Admin/AppConfig/MapJobProgress";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";

// Old-site import (backend Services/oldSiteImport.ts): one button runs every
// collection in order as a background job; the page polls its progress and
// shows the counts. The same import runs on the server with
// deploy/arvan/import-old.sh. Re-running never duplicates.

const JOB_URL = `${API}/migrate/all`;

type Node = { key: string; title: string; importOnly?: boolean };

const nodes: Node[] = [
  { key: "doctor", get title() { return ta("پزشکان"); } },
  { key: "user", get title() { return ta("کاربران"); }, importOnly: true },
  { key: "blog", get title() { return ta("مقالات"); } },
  { key: "disease", get title() { return ta("بیماری‌ها"); } },
  { key: "drug", get title() { return ta("داروها"); } },
  { key: "speciality", get title() { return ta("تخصص‌ها"); } },
  { key: "symptom", get title() { return ta("علائم"); } },
  { key: "part", get title() { return ta("اعضای بدن"); } },
];

// the counts table also lists what an import makes on the side
const countLabels: Record<string, string> = {
  get doctorProfile() { return ta("پروفایل‌های پزشکان"); },
  get blogCategory() { return ta("دسته‌های مقالات"); },
};
const collectionTitle = (key: string) =>
  nodes.find((n) => n.key === key)?.title || countLabels[key] || key;

type Counts = {
  total: number;
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
  errors: number;
  messages?: string[];
};

type ImportJob = {
  id: string;
  status: "running" | "done" | "failed";
  phase: string;
  total: number;
  processed: number;
  startedAt: string;
  finishedAt?: string;
  source?: "panel" | "cli";
  error?: { message: string };
  result?: {
    counts?: Record<string, Counts>;
    files?: { downloaded: number; present: number; kept: number; failed: number; failures?: string[] };
    notes?: string[];
  };
};

type ImportSettings = { filesBaseUrl: string; downloadFiles: boolean };

const payloadOf = (settings: ImportSettings) => ({
  ...(settings.filesBaseUrl.trim() && { filesBaseUrl: settings.filesBaseUrl.trim() }),
  downloadFiles: settings.downloadFiles,
});

const useImportJob = () =>
  useSWR<ImportJob | null>(
    JOB_URL,
    (url: string) =>
      fetcher({ url }).then((res) => {
        const job = res?.data;
        return job && typeof job === "object" && typeof job.status === "string" ? (job as ImportJob) : null;
      }),
    { refreshInterval: (latest) => (latest?.status === "running" ? 1500 : 0) },
  );

type MigrationAction = {
  key: string;
  method: FetchMethod;
  title: string;
  description: string;
  danger: boolean;
};

const actions: MigrationAction[] = [
  {
    key: "import",
    method: "POST",
    get title() {
      return ta("انتقال از دیتابیس قدیم");
    },
    get description() {
      return ta("رکوردهای این بخش (و بخش‌هایی که به آن‌ها وصل‌اند) از دیتابیس قدیم منتقل یا به‌روز می‌شوند. اجرای دوباره رکورد تکراری نمی‌سازد.");
    },
    danger: false,
  },
  {
    key: "drop",
    method: "PUT",
    get title() {
      return ta("حذف رکوردهای منتقل‌شده");
    },
    get description() {
      return ta("فقط رکوردهایی که از دیتابیس قدیم منتقل شده‌اند (و هنوز به آن متصل‌اند) حذف می‌شوند.");
    },
    danger: true,
  },
  {
    key: "purge",
    method: "PATCH",
    get title() {
      return ta("قطع اتصال از دیتابیس قدیم");
    },
    get description() {
      return ta("اتصال رکوردهای منتقل‌شده به دیتابیس قدیم حذف می‌شود؛ بعد از آن دیگر با «حذف رکوردهای منتقل‌شده» پاک نمی‌شوند.");
    },
    danger: true,
  },
  {
    key: "dropAll",
    method: "DELETE",
    get title() {
      return ta("حذف همه رکوردها");
    },
    get description() {
      return ta("همه رکوردهای این بخش در دیتابیس جدید حذف می‌شوند، چه منتقل‌شده چه ساخته‌شده در پنل.");
    },
    danger: true,
  },
];

// Destructive actions need the section name typed back, so a stray click
// (or a re-submitted request) can't wipe a collection.
const MigrationPopup = ({
  node,
  action,
  settings,
}: {
  node: Node;
  action: MigrationAction;
  settings: ImportSettings;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const { mutate } = useSWRConfig();
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmed = !action.danger || typed.trim() === node.title;

  const run = async () => {
    if (!confirmed || loading) return;
    setLoading(true);
    try {
      await fetcher({
        url: `${API}/migrate/${node.key}`,
        method: action.method,
        ...(action.key === "import" && { payload: payloadOf(settings), bodyParser: "JSON" as const }),
      });
      await mutate(JOB_URL);
      pushNotification(
        action.key === "import"
          ? ta("انتقال ${1} شروع شد؛ پیشرفت آن بالای صفحه نمایش داده می‌شود", [node.title])
          : ta("${1} (${2}) انجام شد", [action.title, node.title]),
        "Success",
      );
      closePopup();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
      setLoading(false);
    }
  };

  return (
    <div className={classes.popup}>
      <h3 className={classes.popupTitle}>{`${action.title}: ${node.title}`}</h3>
      <p className={classes.popupText}>{action.description}</p>
      {action.danger && (
        <label className={classes.confirmField}>
          <span>
            {ta("برای تایید، عبارت")} <strong>{node.title}</strong> {ta("را وارد کنید. این عملیات قابل بازگشت نیست.")}
          </span>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
        </label>
      )}
      <div className={classes.popupActions}>
        <Button
          variant={!confirmed ? "Disable" : action.danger ? "Error" : "Primary"}
          onClick={confirmed ? run : undefined}
          isLoading={loading}
        >
          {action.title}
        </Button>
        <Button variant="Neutral" onClick={() => closePopup()}>
          {ta("انصراف")}
        </Button>
      </div>
    </div>
  );
};

const ImportAllPanel = ({
  settings,
  setSettings,
}: {
  settings: ImportSettings;
  setSettings: (next: ImportSettings) => void;
}) => {
  const pushNotification = useNotification();
  const { data: job, mutate } = useImportJob();
  const [starting, setStarting] = useState(false);
  const running = job?.status === "running";
  const number = (n: unknown) => (typeof n === "number" ? n.toLocaleString(adminIntlTag()) : "0");

  const start = async () => {
    if (starting || running) return;
    setStarting(true);
    try {
      await fetcher({ url: JOB_URL, method: "POST", payload: payloadOf(settings), bodyParser: "JSON" });
      await mutate();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setStarting(false);
    }
  };

  const counts = job?.result?.counts && typeof job.result.counts === "object" ? job.result.counts : {};
  const rows = Object.entries(counts)
    .filter(([, c]) => c && typeof c === "object")
    .map(([key, c]) => ({ key, ...c }));
  const files = job?.result?.files;
  const notes = Array.isArray(job?.result?.notes) ? job!.result!.notes! : [];
  const messages = rows.flatMap((r) =>
    (Array.isArray(r.messages) ? r.messages : []).map((m) => `${collectionTitle(r.key)}: ${m}`),
  );

  return (
    <Box className={classes.allBox}>
      <h2 className={classes.cardTitle}>{ta("انتقال همه‌ی داده‌های سایت قدیم")}</h2>
      <p className={classes.subtitle}>
        {ta("همه‌ی بخش‌ها (اعضای بدن، تخصص‌ها، علائم، داروها، بیماری‌ها، کاربران، پزشکان و مقالات) به ترتیب و با ارتباط‌هایشان منتقل می‌شوند. اجرای دوباره رکورد تکراری نمی‌سازد و ویرایش‌هایی که این‌جا انجام شده حفظ می‌شود. روی سرور همین کار با deploy/arvan/import-old.sh انجام می‌شود.")}
      </p>
      <Input
        title={ta("آدرس فایل‌های سایت قدیم (اختیاری)")}
        type="url"
        inputMode="url"
        placeholder="https://noyanai.com/files"
        defaultValue={settings.filesBaseUrl}
        onChange={(e) => setSettings({ ...settings, filesBaseUrl: e.target.value })}
        readOnly={running}
        inputClass={classes.ltr}
      />
      <ToggleInput
        title={ta("دریافت تصویرها و فایل‌ها در پوشه‌ی فایل‌های همین سرور")}
        value={settings.downloadFiles}
        onChange={() => setSettings({ ...settings, downloadFiles: !settings.downloadFiles })}
        readOnly={running}
      />
      <div className={classes.allActions}>
        <Button size="M" onClick={start} isLoading={starting || running}>
          {ta("انتقال همه‌ی داده‌های سایت قدیم")}
        </Button>
      </div>
      {!!job && <MapJobProgress job={job} phaseText={(phase) => (nodes.some((n) => n.key === phase) ? collectionTitle(phase) : undefined)} />}
      {job?.source === "cli" && <p className={classes.subtitle}>{ta("آخرین اجرا از خط فرمان سرور بوده است.")}</p>}
      {!!rows.length && (
        <Table
          name="AdminOldImportCounts"
          data={rows}
          renderer={{
            key: { name: ta("بخش"), value: (row) => collectionTitle(row.key) },
            total: { name: ta("در دیتابیس قدیم"), value: (row) => row.total, filter: "Number" },
            created: { name: ta("ساخته‌شده"), value: (row) => row.created, filter: "Number" },
            updated: { name: ta("به‌روزشده"), value: (row) => row.updated, filter: "Number" },
            unchanged: { name: ta("بدون تغییر"), value: (row) => row.unchanged, filter: "Number" },
            skipped: { name: ta("رد شده"), value: (row) => row.skipped, filter: "Number" },
            errors: {
              name: ta("خطا"),
              value: (row) => row.errors,
              filter: "Number",
              component: (row) =>
                row.errors ? <Badge color="Error">{number(row.errors)}</Badge> : number(row.errors),
            },
          }}
        />
      )}
      {!!files && (
        <div className={classes.badges}>
          <Badge color="Success">{`${ta("فایل دریافت‌شده")}: ${number(files.downloaded)}`}</Badge>
          <Badge color="Info">{`${ta("فایل موجود از قبل")}: ${number(files.present)}`}</Badge>
          <Badge color="Secondary">{`${ta("مسیر یا آدرس نگه‌داشته‌شده")}: ${number(files.kept)}`}</Badge>
          <Badge color={files.failed ? "Warning" : "Secondary"}>{`${ta("دریافت ناموفق")}: ${number(files.failed)}`}</Badge>
        </div>
      )}
      {(!!messages.length || !!notes.length || !!files?.failures?.length) && (
        <details className={classes.details}>
          <summary>{ta("جزئیات ردیف‌های ردشده و خطاها")}</summary>
          <ul className={classes.messages}>
            {[...notes, ...messages, ...(files?.failures || [])].map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </details>
      )}
    </Box>
  );
};

const AdminManageMigrationPage = () => {
  const { setPopup } = usePopup();
  const [settings, setSettings] = useState<ImportSettings>({ filesBaseUrl: "", downloadFiles: true });

  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <h1 className={classes.title}>{ta("مهاجرت داده‌ها")}</h1>
        <p className={classes.subtitle}>
          {ta("انتقال داده از دیتابیس قدیم. عملیات قرمز داده حذف می‌کنند و قابل بازگشت نیستند.")}
        </p>
      </header>
      <ImportAllPanel settings={settings} setSettings={setSettings} />
      <div className={classes.grid}>
        {nodes.map((node) => (
          <section key={node.key} className={classes.card}>
            <h2 className={classes.cardTitle}>{node.title}</h2>
            <div className={classes.actions}>
              {actions
                .filter((action) => !node.importOnly || !action.danger)
                .map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    className={`${classes.action} ${action.danger ? classes.danger : ""}`}
                    onClick={() =>
                      setPopup(
                        `migrate-${node.key}-${action.key}`,
                        <MigrationPopup node={node} action={action} settings={settings} />,
                      )
                    }
                  >
                    {action.title}
                  </button>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default AdminManageMigrationPage;
