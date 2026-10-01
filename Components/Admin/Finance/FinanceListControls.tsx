"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import DateInput from "@/Components/UI/DateInput";
import Ixon from "@/Components/UI/Ixon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import DownloadIcon from "@/Components/Icons/DownloadIcon";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./FinanceListControls.module.css";

// Server-paged money lists (2026-10): the filters live on the server
// (search, status, a second select, date range), one page of rows is loaded
// at a time, and the CSV export asks the server for the whole filter
// (`?format=csv`, capped there). Used by the finance pages, invoices and the
// subscriptions tab. Like Doctolib Pro / Practo Ray back-office lists.

export const FINANCE_PAGE_SIZE = 50;

export type FinanceFilters = {
  q: string;
  status: string;
  // a second, page-specific select (line status, kind, purpose...)
  extra: string;
  from?: Date;
  to?: Date;
};

export type FinanceListResponse<T> = {
  rows: T[];
  total: number;
  page: number;
  limit: number;
  // anything else the endpoint answers (commissionTotal, counts...)
  body: Record<string, unknown>;
};

// Filter state + the query string it makes. `extraKey` names the second
// select's query parameter (e.g. "lineStatus").
export const useFinanceFilters = (
  initial: Partial<FinanceFilters> = {},
  extraKey = "extra",
) => {
  const [filters, setFilters] = useState<FinanceFilters>({
    q: "",
    status: "",
    extra: "",
    ...initial,
  });
  const [search, setSearch] = useState(initial.q || "");
  const [page, setPage] = useState(1);

  // a status picked from outside (e.g. a ?status= link) replaces the filter
  useEffect(() => {
    if (initial.status !== undefined)
      setFilters((f) => ({ ...f, status: initial.status || "" }));
    setPage(1);
  }, [initial.status]);

  // typing doesn't hit the server on every key
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => (f.q === search.trim() ? f : { ...f, q: search.trim() }));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const set = (patch: Partial<FinanceFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.extra) params.set(extraKey, filters.extra);
    if (filters.from) params.set("from", filters.from.toISOString());
    if (filters.to) {
      // the whole "to" day counts
      const end = new Date(filters.to);
      end.setHours(23, 59, 59, 999);
      params.set("to", end.toISOString());
    }
    return params;
  }, [filters, extraKey]);

  return { filters, set, search, setSearch, page, setPage, query };
};

// One page of a server-paged list. Never crashes on a non-array answer.
export const useFinanceList = <T,>(
  path: string,
  query: URLSearchParams,
  page: number,
  limit = FINANCE_PAGE_SIZE,
) => {
  const params = new URLSearchParams(query);
  params.set("page", String(page));
  params.set("limit", String(limit));
  return useSWR<FinanceListResponse<T>>(
    `${path}?${params}`,
    (url: string) =>
      fetcher({ url }).then((res) => ({
        rows: Array.isArray(res?.data) ? res.data : [],
        total: Number(res?.total) || 0,
        page: Number(res?.page) || page,
        limit: Number(res?.limit) || limit,
        body: res && typeof res === "object" ? res : {},
      })),
    { keepPreviousData: true },
  );
};

// Downloads `${path}?<filters>&format=csv` with the admin's session cookie.
const useCsvDownload = () => {
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);
  const download = async (path: string, query: URLSearchParams, name: string) => {
    const params = new URLSearchParams(query);
    params.set("format", "csv");
    setBusy(true);
    try {
      const res = await fetch(`${path}?${params}`, { credentials: "include" });
      if (!res.ok || !res.headers.get("content-type")?.includes("csv"))
        throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      pushNotification(ta("دریافت فایل خروجی ناموفق بود"), "Error");
    } finally {
      setBusy(false);
    }
  };
  return { download, busy };
};

type Select = { title: string; options: Record<string, string> };

export const FinanceFilterBar = ({
  state,
  status,
  extra,
  searchPlaceholder,
  exportPath,
  exportName,
  dates = true,
}: {
  state: ReturnType<typeof useFinanceFilters>;
  status?: Select;
  extra?: Select;
  searchPlaceholder: string;
  // the list endpoint; omitted = no export button
  exportPath?: string;
  exportName?: string;
  dates?: boolean;
}) => {
  const { filters, set, search, setSearch, query } = state;
  const { download, busy } = useCsvDownload();
  const select = (sel: Select, value: string, onChange: (v: string) => void) => (
    <label className={classes.select}>
      <span className={classes.selectTitle}>{sel.title}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{ta("همه")}</option>
        {Object.entries(sel.options).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className={classes.bar}>
      <div className={classes.search}>
        <Ixon width="1.05rem" className={classes.searchIcon}>
          <SearchIcon />
        </Ixon>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </div>
      {status && select(status, filters.status, (v) => set({ status: v }))}
      {extra && select(extra, filters.extra, (v) => set({ extra: v }))}
      {dates && (
        <div className={classes.dates}>
          <DateInput
            className={classes.date}
            title={ta("از تاریخ")}
            placeholder
            defaultValue={filters.from}
            onChange={(d) => set({ from: d })}
          />
          <DateInput
            className={classes.date}
            title={ta("تا تاریخ")}
            placeholder
            defaultValue={filters.to}
            onChange={(d) => set({ to: d })}
          />
          {(filters.from || filters.to) && (
            <button
              type="button"
              className={classes.linkBtn}
              onClick={() => set({ from: undefined, to: undefined })}
            >
              {ta("حذف بازه‌ی تاریخ")}
            </button>
          )}
        </div>
      )}
      {exportPath && (
        <button
          type="button"
          className={classes.exportBtn}
          disabled={busy}
          onClick={() => download(exportPath, query, exportName || "export")}
        >
          <Ixon width="1rem">
            <DownloadIcon />
          </Ixon>
          <span>{busy ? ta("در حال آماده‌سازی…") : ta("خروجی CSV (همه‌ی نتایج فیلتر)")}</span>
        </button>
      )}
    </div>
  );
};

export const FinancePager = ({
  total,
  page,
  limit,
  setPage,
  stale,
}: {
  total: number;
  page: number;
  limit: number;
  setPage: (page: number) => unknown;
  stale?: boolean;
}) => {
  const num = new Intl.NumberFormat(adminIntlTag());
  const pages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  return (
    <div className={`${classes.pager} ${stale ? classes.stale : ""}`}>
      <span className={classes.total}>
        {ta("${1} مورد", [num.format(total)])}
      </span>
      {pages > 1 && (
        <div className={classes.pageButtons}>
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            {ta("قبلی")}
          </button>
          <span>{ta("صفحه ${1} از ${2}", [num.format(page), num.format(pages)])}</span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            {ta("بعدی")}
          </button>
        </div>
      )}
    </div>
  );
};
