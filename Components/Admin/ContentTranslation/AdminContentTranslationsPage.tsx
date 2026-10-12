"use client";
import { useEffect, useState } from "react";
import Link from "@/Components/i18n/Link";
import useSWR from "swr";
import classes from "./AdminContentTranslations.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import useUser from "@/Components/Hooks/useUser";
import useNotification from "@/Components/Hooks/useNotification";
import Ixon from "@/Components/UI/Ixon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import Button from "@/Components/UI/Button";
import Loading from "../UI/Loading";
import ErrorMessage from "../UI/ErrorMessage";
import { Locale, localeNames } from "@/Components/i18n/locales";
import { LocaleStatus, modelTitle, segmentGroups, segmentTitle } from "./segments";
import { adminIntlTag, adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";

type QueueStatus = {
  ready: boolean;
  locales: Locale[];
  queue: { pending: number; failed: number; byModel: Record<string, number> };
  failures: { _id: string; model: string; doc: string; attempts: number; lastError?: string; updatedAt?: string }[];
  worker: {
    running: boolean;
    paused: boolean;
    translated: number;
    written: number;
    failed: number;
    lastError?: string;
    backoffUntil?: string;
  };
  scan: {
    running: boolean;
    startedAt?: string;
    finishedAt?: string;
    records: number;
    missing: Record<string, Partial<Record<Locale, number>>>;
    queued: number;
    error?: string;
  };
};

type Overview = {
  machine: boolean;
  locales: Locale[];
  segments: { segment: string; model: string; total: number }[];
};

type RecordsResponse = {
  total: number;
  page: number;
  limit: number;
  items: {
    _id: string;
    label: string;
    status: Partial<Record<Locale, LocaleStatus>>;
  }[];
};

const num = adminNumberFormat();
const when = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat(adminIntlTag(), { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(iso));
  } catch {
    return iso;
  }
};

// The automatic translation of the content (backend Services/autoTranslate.ts):
// every new or edited record is queued and translated into the enabled site
// languages by the platform AI; the backfill button queues whatever is still
// missing (and retries the failures); with no AI provider the queue only
// fills, and this card says how much waits.
const AutoTranslatePanel = ({ segments }: { segments: Overview["segments"] }) => {
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);
  const { data: status, mutate } = useSWR<QueueStatus>(
    `${API}/auto/_translations/bulk`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { refreshInterval: (latest) => (latest?.scan?.running || (latest?.ready && latest?.queue?.pending) ? 4000 : 0) },
  );
  const segmentOf = (model: string) => segments.find((s) => s.model === model)?.segment;
  const titleOf = (model: string) => {
    const segment = segmentOf(model);
    return segment ? segmentTitle(segment) : modelTitle(model);
  };

  const call = async (method: "POST" | "DELETE") => {
    setBusy(true);
    try {
      await fetcher({ url: `${API}/auto/_translations/bulk`, method, ...(method === "POST" && { payload: {} }) });
      mutate();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };

  if (!status) return null;
  const queue = status.queue || { pending: 0, failed: 0, byModel: {} };
  const scan = status.scan || { running: false, records: 0, missing: {}, queued: 0 };
  const failures = Array.isArray(status.failures) ? status.failures : [];
  const locales = Array.isArray(status.locales) ? status.locales : [];
  const missingByLocale = locales.map((l) => ({
    locale: l,
    count: Object.values(scan.missing || {}).reduce((sum, row) => sum + (Number(row?.[l]) || 0), 0),
  }));
  const missingByModel = Object.entries(scan.missing || {})
    .map(([model, row]) => ({ model, count: Math.max(0, ...Object.values(row || {}).map((n) => Number(n) || 0)) }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  const waiting = Math.max(Number(scan.records) || 0, Number(queue.pending) || 0);

  return (
    <section className={classes.card}>
      <div className={classes.bulkHead}>
        <div>
          <h2 className={classes.cardTitle}>{ta("ترجمه‌ی خودکار محتوا")}</h2>
          <p className={classes.note}>
            {ta("هر رکورد تازه یا ویرایش‌شده (از فرم‌ها، ساخت سریع در فیلدها، ورود گروهی یا انتقال از سایت قدیم) خودکار به زبان‌های فعال سایت ترجمه می‌شود. ترجمه‌هایی که دستی نوشته شده‌اند هرگز جایگزین نمی‌شوند.")}
          </p>
        </div>
        <div className={classes.bulkActions}>
          {status.ready && !scan.running && (
            status.worker?.paused ? (
              <Button size="M" mode="Outline" onClick={() => call("POST")} isLoading={busy}>
                {ta("ادامه")}
              </Button>
            ) : queue.pending > 0 ? (
              <Button size="M" mode="Outline" variant="Error" onClick={() => call("DELETE")} isLoading={busy}>
                {ta("توقف")}
              </Button>
            ) : null
          )}
          <Button size="M" onClick={() => call("POST")} isLoading={busy || scan.running} disabled={scan.running}>
            {ta("بررسی و ترجمه‌ی موارد ناقص")}
          </Button>
        </div>
      </div>

      {!status.ready && (
        <p className={classes.warning} role="alert">
          {waiting > 0
            ? ta("ترجمه‌ی خودکار تنظیم نشده است: ${1} رکورد ترجمه‌ی ناقص دارند و تا آن زمان به فارسی نمایش داده می‌شوند. در «تنظیمات سیستم ← هوش مصنوعی» ارائه‌دهنده و «ترجمه‌ی خودکار محتوا» را روشن کنید؛ صف خودکار شروع می‌شود.", [num.format(waiting)])
            : ta("ترجمه‌ی خودکار تنظیم نشده است. در «تنظیمات سیستم ← هوش مصنوعی» ارائه‌دهنده و «ترجمه‌ی خودکار محتوا» را روشن کنید.")}
        </p>
      )}

      <div className={classes.stats}>
        <span>{ta("در صف: ${1}", [num.format(queue.pending || 0)])}</span>
        <span>{ta("ناموفق: ${1}", [num.format(queue.failed || 0)])}</span>
        <span>{ta("ترجمه‌شده از آخرین راه‌اندازی: ${1}", [num.format(status.worker?.translated || 0)])}</span>
        {status.worker?.paused && <span className={classes.paused}>{ta("متوقف شده")}</span>}
      </div>
      {status.ready && !!status.worker?.backoffUntil && (
        <p className={classes.warning} role="status">
          {ta("ارائه‌دهنده‌ی هوش مصنوعی پاسخ نداد؛ صف تا ${1} صبر می‌کند و خودکار ادامه می‌دهد.", [when(status.worker.backoffUntil)])}
          {status.worker.lastError && (
            <>
              {" "}
              <code dir="ltr">{status.worker.lastError}</code>
            </>
          )}
        </p>
      )}

      <div className={classes.progress}>
        <span className={classes.note}>
          {scan.running
            ? ta("در حال بررسی همه‌ی رکوردها…")
            : scan.finishedAt
              ? ta("آخرین بررسی: ${1} — ${2} رکورد ترجمه‌ی ناقص داشتند", [when(scan.finishedAt), num.format(scan.records || 0)])
              : ta("هنوز بررسی نشده است")}
        </span>
        {!!missingByLocale.length && !scan.running && (
          <div className={classes.chips}>
            {missingByLocale.map(({ locale, count }) => (
              <span key={locale} className={classes.chip} title={localeNames[locale]}>
                {`${locale.toUpperCase()} ${num.format(count)}`}
              </span>
            ))}
          </div>
        )}
        {scan.error && <span className={classes.errors}>{scan.error}</span>}
      </div>

      {missingByModel.length > 0 && (
        <details className={classes.details}>
          <summary>{ta("ناقص به تفکیک بخش")}</summary>
          <ul>
            {missingByModel.map(({ model, count }) => (
              <li key={model}>
                <span>{titleOf(model)}</span>
                <span>{num.format(count)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {failures.length > 0 && (
        <details className={classes.errors}>
          <summary>{ta("ترجمه‌های ناموفق (${1})", [num.format(queue.failed || failures.length)])}</summary>
          <ul>
            {failures.map((f) => {
              const segment = segmentOf(f.model);
              return (
                <li key={f._id}>
                  {segment ? (
                    <Link href={adminPath(`/translations/${segment}/${f.doc}`)} className={classes.link}>
                      {titleOf(f.model)}
                    </Link>
                  ) : (
                    <span>{titleOf(f.model)}</span>
                  )}{" "}
                  <code dir="ltr">{f.doc}</code> {f.lastError || ""}
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
};

const AdminContentTranslationsPage = () => {
  const { user } = useUser();
  const [segment, setSegment] = useState("blog");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: overview, error: overviewError } = useSWR<Overview>(
    `${API}/auto/_translations`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const params = new URLSearchParams({ page: String(page), limit: "30", ...(query && { q: query }) });
  const { data, error, isValidating } = useSWR<RecordsResponse>(
    `${API}/auto/${segment}/_translations?${params}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { keepPreviousData: true },
  );

  const available = new Set(overview?.segments.map((s) => s.segment));
  const targetLocales = overview?.locales || [];
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  if (overviewError) return <ErrorMessage message={overviewError.message} />;
  if (!overview) return <Loading />;

  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <h1 className={classes.title}>{ta("ترجمه محتوا")}</h1>
        <span className={classes.subtitle}>
          {ta("متن‌های پایگاه داده (مقالات، بیماری‌ها، داروها، پزشکان، مراکز و…) به زبان‌های فعال سایت. هر فیلدی که ترجمه نداشته باشد، در آن زبان فارسی نمایش داده می‌شود.")}
        </span>
      </header>

      {user?.role === "admin" && <AutoTranslatePanel segments={overview.segments || []} />}

      <section className={classes.card}>
        <div className={classes.toolbar}>
          <select
            className={classes.select}
            value={segment}
            onChange={(e) => {
              setSegment(e.target.value);
              setPage(1);
            }}
          >
            {segmentGroups.map((group) => (
              <optgroup key={group.title} label={group.title}>
                {Object.entries(group.segments)
                  .filter(([key]) => available.has(key))
                  .map(([key, title]) => (
                    <option key={key} value={key}>
                      {title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          <div className={classes.search}>
            <Ixon width="1.1rem" className={classes.searchIcon}>
              <SearchIcon />
            </Ixon>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ta("جستجو...")}
            />
          </div>
          <div className={classes.legend}>
            <span className={`${classes.dot} ${classes.done}`} /> {ta("کامل")}
            <span className={`${classes.dot} ${classes.partial}`} /> {ta("ناقص یا قدیمی")}
            <span className={classes.dot} /> {ta("ترجمه نشده")}
          </div>
        </div>

        {error && !data ? (
          <ErrorMessage message={error.message} />
        ) : !data ? (
          <Loading />
        ) : (
          <>
            <div className={`${classes.tableWrap} ${isValidating ? classes.stale : ""}`}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{segmentTitle(segment)}</th>
                    {targetLocales.map((l) => (
                      <th key={l} className={classes.localeHead} title={localeNames[l]}>
                        {l.toUpperCase()}
                      </th>
                    ))}
                    <th aria-label={ta("ویرایش")} />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item._id}>
                      <td className={classes.labelCell}>{item.label || "—"}</td>
                      {targetLocales.map((l) => (
                        <td key={l} className={classes.localeCell}>
                          <span
                            title={localeNames[l]}
                            className={`${classes.dot} ${item.status[l] ? classes[item.status[l]!] : ""}`}
                          />
                        </td>
                      ))}
                      <td>
                        <Link
                          href={adminPath(`/translations/${segment}/${item._id}`)}
                          className={classes.link}
                        >
                          {ta("ترجمه‌ها")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.items.length === 0 && <p className={classes.empty}>{ta("موردی پیدا نشد")}</p>}
            </div>
            {data.total > data.limit && (
              <div className={classes.pagination}>
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {ta("قبلی")}
                </button>
                <span>{ta("صفحه ${1} از ${2}", [num.format(page), num.format(pages)])}</span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {ta("بعدی")}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default AdminContentTranslationsPage;
