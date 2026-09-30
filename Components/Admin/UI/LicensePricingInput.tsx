"use client";

import { useState } from "react";
import ToggleInput from "@/Components/UI/ToggleInput";
import Ixon from "@/Components/UI/Ixon";
import PlusIcon from "@/Components/Icons/PlusIcon";
import TrashIcon from "@/Components/Icons/TrashIcon";
import { currencize } from "@/Components/helpers/currencize";
import { periodParts } from "@/Components/_Common/License/useLicensePeriodLabel";
import classes from "./LicensePricingInput.module.css";

// One way to buy a plan (backend Models/BaseLicensePricing.ts): the period
// lives on the option itself - no separate "license durations" list to fill
// in first (2026-09, owner request).
export interface ILicensePricingEntry {
  days: number;
  isActive: boolean;
  price: number;
  discount: number;
}

// the periods leaders sell (Doctolib Pro / Paziresh24: monthly, quarterly,
// half-year, yearly); anything else is a custom number of days
const presets = [
  { days: 30, label: "۱ ماهه" },
  { days: 90, label: "۳ ماهه" },
  { days: 180, label: "۶ ماهه" },
  { days: 365, label: "۱ ساله" },
];
const CUSTOM = "custom";

const faNum = new Intl.NumberFormat("fa-IR");
const periodText = (days: number) => {
  const { unit, count } = periodParts(days);
  const n = faNum.format(count);
  return unit === "years"
    ? `${n} ساله`
    : unit === "months"
      ? `${n} ماهه`
      : `${n} روزه`;
};

type Row = ILicensePricingEntry & { key: number; custom: boolean };

let rowKey = 0;
const toRow = (entry: Partial<ILicensePricingEntry>): Row => {
  const days = Number(entry.days) > 0 ? Number(entry.days) : 30;
  return {
    key: rowKey++,
    days,
    isActive: entry.isActive ?? true,
    price: Number(entry.price) || 0,
    discount: Number(entry.discount) || 0,
    custom: !presets.some((p) => p.days === days),
  };
};

const digitsOnly = (value: string) =>
  Number(
    value
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/\D/g, "") || 0,
  );

// Price options of a Base<Org>License plan: one card per period with its
// price, discount and the final amount, add / remove in place. Wired into
// CreateForm as the "licensePricing" field (admin-only, Persian).
const LicensePricingInput = ({
  title,
  defaultValue,
  onChange,
  readOnly,
}: {
  title?: string;
  defaultValue?: ILicensePricingEntry[];
  onChange?: (value: ILicensePricingEntry[]) => unknown;
  readOnly?: boolean;
}) => {
  const [rows, setRows] = useState<Row[]>(() =>
    Array.isArray(defaultValue) && defaultValue.length
      ? defaultValue.map(toRow)
      : [],
  );

  const commit = (next: Row[]) => {
    setRows(next);
    // saved shortest period first (the rows stay where the admin put them)
    onChange?.(
      [...next]
        .sort((a, b) => a.days - b.days)
        .map(({ days, isActive, price, discount }) => ({
          days,
          isActive,
          price,
          // a discount larger than the price would sell for less than zero
          discount: Math.min(discount, price),
        })),
    );
  };
  const update = (key: number, patch: Partial<Row>) =>
    commit(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const used = rows.map((r) => r.days);
  const duplicates = used.filter((d, i) => used.indexOf(d) !== i);
  const nextPreset = presets.find((p) => !used.includes(p.days));

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <div className={classes.headText}>
          {!!title && <legend className={classes.title}>{title}</legend>}
          <span className={classes.hint}>
            هر ردیف یک گزینه‌ی خرید همین پلن است؛ مدت، قیمت و تخفیف همین‌جا
            تعریف می‌شود.
          </span>
        </div>
        {!readOnly && (
          <button
            type="button"
            className={classes.add}
            onClick={() =>
              commit([
                ...rows,
                toRow({ days: nextPreset?.days || 30, isActive: true }),
              ])
            }
          >
            <Ixon width="1rem">
              <PlusIcon />
            </Ixon>
            افزودن مدت
          </button>
        )}
      </div>
      {!rows.length && (
        <p className={classes.empty}>
          هنوز گزینه‌ای برای خرید این پلن تعریف نشده است.
        </p>
      )}
      <div className={classes.rows}>
        {rows.map((row) => {
          const off = Math.min(row.discount, row.price);
          const final = row.price - off;
          const percent =
            row.price > 0 ? Math.round((off / row.price) * 100) : 0;
          const isDuplicate = duplicates.includes(row.days);
          return (
            <div
              key={row.key}
              className={`${classes.row} ${row.isActive ? "" : classes.inactive} ${isDuplicate ? classes.error : ""}`}
            >
              <label className={classes.cell}>
                <span className={classes.label}>مدت</span>
                <select
                  className={classes.input}
                  disabled={readOnly}
                  value={row.custom ? CUSTOM : String(row.days)}
                  onChange={(e) =>
                    e.target.value === CUSTOM
                      ? update(row.key, { custom: true })
                      : update(row.key, {
                          custom: false,
                          days: Number(e.target.value),
                        })
                  }
                >
                  {presets.map((p) => (
                    <option key={p.days} value={p.days}>
                      {p.label}
                    </option>
                  ))}
                  <option value={CUSTOM}>تعداد روز دلخواه</option>
                </select>
              </label>
              {row.custom && (
                <label className={classes.cell}>
                  <span className={classes.label}>تعداد روز</span>
                  <input
                    className={classes.input}
                    inputMode="numeric"
                    disabled={readOnly}
                    value={row.days || ""}
                    onChange={(e) =>
                      update(row.key, {
                        days: Math.min(3650, digitsOnly(e.target.value)),
                      })
                    }
                  />
                </label>
              )}
              <label className={classes.cell}>
                <span className={classes.label}>قیمت (تومان)</span>
                <input
                  className={classes.input}
                  inputMode="numeric"
                  disabled={readOnly}
                  value={row.price ? currencize(row.price) : ""}
                  placeholder="۰"
                  onChange={(e) =>
                    update(row.key, { price: digitsOnly(e.target.value) })
                  }
                />
              </label>
              <label className={classes.cell}>
                <span className={classes.label}>تخفیف (تومان)</span>
                <input
                  className={classes.input}
                  inputMode="numeric"
                  disabled={readOnly}
                  value={row.discount ? currencize(row.discount) : ""}
                  placeholder="۰"
                  onChange={(e) =>
                    update(row.key, { discount: digitsOnly(e.target.value) })
                  }
                />
              </label>
              <div className={classes.summary}>
                <span className={classes.period}>{periodText(row.days)}</span>
                <span className={classes.final}>
                  {`${currencize(final)} تومان`}
                  {percent > 0 && (
                    <span
                      className={classes.percent}
                    >{`${faNum.format(percent)}٪ تخفیف`}</span>
                  )}
                </span>
                {isDuplicate && (
                  <span className={classes.errorText}>این مدت تکراری است</span>
                )}
              </div>
              <div className={classes.actions}>
                <span className={classes.toggle}>
                  <span className={classes.label}>فروش</span>
                  <ToggleInput
                    readOnly={readOnly}
                    value={row.isActive}
                    onChange={() =>
                      update(row.key, { isActive: !row.isActive })
                    }
                  />
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    className={classes.remove}
                    aria-label="حذف این مدت"
                    onClick={() =>
                      commit(rows.filter((r) => r.key !== row.key))
                    }
                  >
                    <Ixon width="1.125rem">
                      <TrashIcon />
                    </Ixon>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LicensePricingInput;
