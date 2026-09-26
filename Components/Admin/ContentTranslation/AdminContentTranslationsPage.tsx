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
import { LocaleStatus, segmentGroups, segmentTitle } from "./segments";

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

type BulkJob = {
  running: boolean;
  startedAt: string;
  finishedAt?: string;
  segment?: string;
  processed: number;
  total: number;
  written: number;
  errors: { segment: string; id: string; error: string }[];
} | null;

const num = new Intl.NumberFormat("fa-IR");

const BulkPanel = ({ machine }: { machine: boolean }) => {
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);
  const { data: job, mutate } = useSWR<BulkJob>(
    `${API}/auto/_translations/bulk`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
    { refreshInterval: (latest) => (latest?.running ? 3000 : 0) },
  );

  const start = async () => {
    setBusy(true);
    try {
      await fetcher({ url: `${API}/auto/_translations/bulk`, method: "POST", payload: {} });
      mutate();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };
  const stop = async () => {
    await fetcher({ url: `${API}/auto/_translations/bulk`, method: "DELETE" });
    mutate();
  };

  const percent = job?.total ? Math.min(100, Math.round((job.processed / job.total) * 100)) : 0;

  return (
    <section className={classes.card}>
      <div className={classes.bulkHead}>
        <div>
          <h2 className={classes.cardTitle}>ترجمه خودکار همه محتوا</h2>
          <p className={classes.note}>
            {machine
              ? "همه رکوردها به ۱۴ زبان ترجمه می‌شوند؛ ترجمه‌های دستی دست نمی‌خورند و ترجمه‌های خودکارِ قدیمی (بعد از تغییر متن فارسی) دوباره ساخته می‌شوند."
              : "ترجمه خودکار روی سرور تنظیم نشده است (ANTHROPIC_API_KEY یا TRANSLATION_OLLAMA_MODEL). تا آن زمان ترجمه‌ها را دستی وارد کنید."}
          </p>
        </div>
        {machine &&
          (job?.running ? (
            <Button size="M" mode="Outline" variant="Error" onClick={stop}>
              توقف
            </Button>
          ) : (
            <Button size="M" onClick={start} isLoading={busy}>
              شروع ترجمه خودکار
            </Button>
          ))}
      </div>
      {job && (
        <div className={classes.progress}>
          <div className={classes.bar}>
            <span style={{ width: `${percent}%` }} />
          </div>
          <span className={classes.note}>
            {job.running
              ? `در حال ترجمه «${segmentTitle(job.segment || "")}» — ${num.format(job.processed)} از ${num.format(job.total)} رکورد`
              : `آخرین اجرا: ${num.format(job.processed)} رکورد، ${num.format(job.written)} فیلد ترجمه شد`}
            {job.errors.length > 0 && ` · ${num.format(job.errors.length)} خطا`}
          </span>
          {!job.running && job.errors.length > 0 && (
            <details className={classes.errors}>
              <summary>خطاها</summary>
              <ul>
                {job.errors.map((e, i) => (
                  <li key={i}>
                    <code>{`${e.segment} ${e.id}`}</code> {e.error}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
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
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const params = new URLSearchParams({ page: String(page), limit: "30", ...(query && { q: query }) });
  const { data, error, isValidating } = useSWR<RecordsResponse>(
    `${API}/auto/${segment}/_translations?${params}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
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
        <h1 className={classes.title}>ترجمه محتوا</h1>
        <span className={classes.subtitle}>
          متن‌های پایگاه داده (مقالات، بیماری‌ها، داروها، پزشکان، مراکز و…) به ۱۴ زبان سایت. هر
          فیلدی که ترجمه نداشته باشد، در آن زبان فارسی نمایش داده می‌شود.
        </span>
      </header>

      {user?.role === "admin" && <BulkPanel machine={overview.machine} />}

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
              placeholder="جستجو..."
            />
          </div>
          <div className={classes.legend}>
            <span className={`${classes.dot} ${classes.done}`} /> کامل
            <span className={`${classes.dot} ${classes.partial}`} /> ناقص یا قدیمی
            <span className={classes.dot} /> ترجمه نشده
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
                    <th aria-label="ویرایش" />
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
                          ترجمه‌ها
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.items.length === 0 && <p className={classes.empty}>موردی پیدا نشد</p>}
            </div>
            {data.total > data.limit && (
              <div className={classes.pagination}>
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  قبلی
                </button>
                <span>{`صفحه ${num.format(page)} از ${num.format(pages)}`}</span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  بعدی
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
