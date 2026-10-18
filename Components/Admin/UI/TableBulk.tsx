"use client";

import { isValidElement, ReactNode, useCallback, useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import Button from "@/Components/UI/Button";
import ConfirmationPopup from "./ConfirmationPopup";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./Table.module.css";

// Bulk and quick edits for every admin list (2026-10, the owner's rule: a
// list of records is edited in place, one row or many at once). The grid
// finds the list's own endpoint by itself: the SWR entry its rows came
// from (`${API}/auto/<model>`), so no page has to wire anything. With it:
//  - a yes/no column (its renderer key is the record's boolean field and
//    its cell is a plain BooleanToIcon) toggles with one click;
//  - selected rows get the same yes/no fields set at once, or are deleted.
// Every write goes through the record's ordinary endpoint (POST to edit,
// PUT to delete), so the backend's rules, hooks and permissions apply to
// each row as they do to the record's own form.

type Row = { _id?: string } & Record<string, unknown>;
type Column = { name: string; value?: (node: never) => unknown };

const AUTO_LIST = /\/auto\/([A-Za-z0-9_-]+)\/?(\?.*)?$/;
const CONCURRENCY = 4;
const numbers = adminNumberFormat();

// the auto list (endpoint + SWR key) the rows were loaded from
export const useBulkSource = (data: unknown) => {
  const { cache } = useSWRConfig();
  const first = Array.isArray(data) ? (data.find((r) => r && typeof r === "object" && "_id" in r) as Row | undefined) : undefined;
  return useMemo(() => {
    if (!first?._id) return null;
    for (const key of Array.from((cache as unknown as Map<string, unknown>).keys())) {
      if (typeof key !== "string" || !key.startsWith(API)) continue;
      const match = key.match(AUTO_LIST);
      if (!match) continue;
      const entry = cache.get(key) as { data?: unknown } | undefined;
      if (Array.isArray(entry?.data) && entry!.data.includes(first))
        return { key, base: `${API}/auto/${match[1]}` };
    }
    return null;
  }, [cache, first]);
};

// the renderer keys that are the records' own yes/no fields
export const booleanFields = (renderer: Record<string, Column>, data: unknown) => {
  const rows = (Array.isArray(data) ? data : []).filter((r) => r && typeof r === "object").slice(0, 50) as Row[];
  if (!rows.length) return [] as string[];
  const labels = [booleanToValue.true, booleanToValue.false];
  return Object.keys(renderer).filter((key) => {
    if (key === "actions" || key === "_id") return false;
    const column = renderer[key];
    if (!column?.value) return false;
    let typed = false;
    for (const row of rows) {
      const own = row[key];
      if (own !== undefined && own !== null && typeof own !== "boolean") return false;
      if (typeof own === "boolean") typed = true;
      let shown: unknown;
      try {
        shown = column.value(row as never);
      } catch {
        return false;
      }
      if (typeof shown !== "boolean" && !labels.includes(shown as string)) return false;
    }
    return typed;
  });
};

// writes `rows` one by one (a few at a time); the count of failures
const runAll = async (rows: Row[], write: (row: Row) => Promise<unknown>) => {
  let failed = 0;
  const queue = [...rows];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let row = queue.shift(); row; row = queue.shift()) {
        try {
          await write(row);
        } catch {
          failed++;
        }
      }
    }),
  );
  return failed;
};

export const useBulkActions = (source: { key: string; base: string } | null) => {
  const { mutate } = useSWRConfig();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);
  const report = useCallback(
    (total: number, failed: number) => {
      if (total - failed) pushNotification(ta("${1} مورد انجام شد", [numbers.format(total - failed)]), "Success");
      if (failed) pushNotification(ta("${1} مورد انجام نشد (دسترسی یا قانون همان بخش)", [numbers.format(failed)]), "Error");
    },
    [pushNotification],
  );
  const setField = useCallback(
    async (rows: Row[], field: string, value: boolean) => {
      if (!source || !rows.length) return;
      setBusy(true);
      const failed = await runAll(rows, (row) =>
        fetcher({ url: `${source.base}/${row._id}`, method: "POST", payload: { [field]: value } }),
      );
      setBusy(false);
      await mutate(source.key);
      if (rows.length > 1 || failed) report(rows.length, failed);
      return failed;
    },
    [source, mutate, report],
  );
  const remove = useCallback(
    async (rows: Row[]) => {
      if (!source || !rows.length) return;
      setBusy(true);
      const failed = await runAll(rows, (row) => fetcher({ url: `${source.base}/${row._id}`, method: "PUT" }));
      setBusy(false);
      await mutate(source.key);
      report(rows.length, failed);
      return failed;
    },
    [source, mutate, report],
  );
  return { busy, setField, remove };
};

// a yes/no cell that toggles on click (only a plain BooleanToIcon: a cell
// with its own switch keeps it)
export const QuickToggle = ({
  cell,
  row,
  field,
  onToggle,
}: {
  cell: ReactNode;
  row: Row;
  field: string;
  onToggle: (row: Row, field: string, value: boolean) => unknown;
}) => {
  const [saving, setSaving] = useState(false);
  if (!isValidElement(cell) || cell.type !== BooleanToIcon || !row?._id) return <>{cell}</>;
  const value = !!row[field];
  return (
    <button
      type="button"
      className={classes.quickToggle}
      title={ta("تغییر وضعیت")}
      disabled={saving}
      onClick={async (e) => {
        e.stopPropagation();
        setSaving(true);
        try {
          await onToggle(row, field, !value);
        } finally {
          setSaving(false);
        }
      }}
    >
      <BooleanToIcon value={value} />
    </button>
  );
};

export const BulkBar = ({
  selected,
  fields,
  titles,
  busy,
  onSet,
  onRemove,
  onClear,
}: {
  selected: Row[];
  fields: string[];
  titles: Record<string, string>;
  busy: boolean;
  onSet: (field: string, value: boolean) => unknown;
  onRemove: () => unknown;
  onClear: () => unknown;
}) => {
  const { setPopup, closePopup } = usePopup();
  if (!selected.length) return null;
  return (
    <div className={classes.bulkBar} role="toolbar" aria-label={ta("${1} مورد انتخاب شده", [numbers.format(selected.length)])}>
      <span className={classes.bulkCount}>{ta("${1} مورد انتخاب شده", [numbers.format(selected.length)])}</span>
      {fields.map((field) => (
        <span key={field} className={classes.bulkField}>
          <span className={classes.bulkFieldName}>{ta(titles[field] || field)}</span>
          <Button size="S" variant="Neutral" isLoading={busy} onClick={busy ? undefined : () => onSet(field, true)}>
            {booleanToValue.true}
          </Button>
          <Button size="S" variant="Neutral" isLoading={busy} onClick={busy ? undefined : () => onSet(field, false)}>
            {booleanToValue.false}
          </Button>
        </span>
      ))}
      <span className={classes.bulkEnd}>
        <Button
          size="S"
          variant="Error"
          isLoading={busy}
          onClick={
            busy
              ? undefined
              : () =>
                  setPopup(
                    "TableBulkDelete",
                    <ConfirmationPopup
                      message={ta("${1} مورد حذف شود؟ این کار برگشت‌پذیر نیست.", [numbers.format(selected.length)])}
                      onConfirm={() => {
                        closePopup();
                        onRemove();
                      }}
                    />,
                  )
          }
        >
          {ta("حذف انتخاب‌شده‌ها")}
        </Button>
        <Button size="S" variant="Neutral" onClick={onClear}>
          {ta("لغو انتخاب")}
        </Button>
      </span>
    </div>
  );
};
