"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import classes from "@/Components/_Common/Business/Accounting.module.css";

// The payroll rules of each Jalali year (2026-10, backend Lib/business/
// payroll.ts): the figures the Supreme Labour Council and the budget law set
// every year. One table for the whole platform: every provider's payslips
// are computed from it, so no clinic or pharmacy has to know the law.
// GET /admin/finance/payroll-years, PUT/DELETE .../:year. Amounts in toman.

type Bracket = { upTo: number | null; rate: number };
type Year = {
  year: number;
  minWage: number;
  housing: number;
  food: number;
  childAllowance: number;
  employeeInsuranceRate: number;
  employerInsuranceRate: number;
  insuranceCeilingMultiplier: number;
  overtimeMultiplier: number;
  monthHours: number;
  taxExemption: number;
  brackets: Bracket[];
  note?: string;
  runs?: number;
};

const FIELDS = [
  "minWage",
  "housing",
  "food",
  "childAllowance",
  "employeeInsuranceRate",
  "employerInsuranceRate",
  "insuranceCeilingMultiplier",
  "overtimeMultiplier",
  "monthHours",
  "taxExemption",
] as const;
type Field = (typeof FIELDS)[number];

const label: Record<Field, () => string> = {
  minWage: () => ta("حداقل دستمزد ماهانه (تومان)"),
  housing: () => ta("حق مسکن ماهانه (تومان)"),
  food: () => ta("بن خواربار ماهانه (تومان)"),
  childAllowance: () => ta("حق اولاد هر فرزند (تومان)"),
  employeeInsuranceRate: () => ta("سهم بیمه‌ی کارگر (درصد)"),
  employerInsuranceRate: () => ta("سهم بیمه‌ی کارفرما با بیمه‌ی بیکاری (درصد)"),
  insuranceCeilingMultiplier: () => ta("سقف بیمه (چند برابر حداقل دستمزد)"),
  overtimeMultiplier: () => ta("ضریب اضافه‌کاری"),
  monthHours: () => ta("ساعت کار ماه (مبنای نرخ ساعتی)"),
  taxExemption: () => ta("معافیت ماهانه‌ی مالیات حقوق (تومان)"),
};

type Draft = Record<Field, string> & { brackets: { upTo: string; rate: string }[]; note: string };

const toDraft = (y?: Year): Draft => ({
  ...(Object.fromEntries(FIELDS.map((k) => [k, y ? String(y[k] ?? "") : ""])) as Record<Field, string>),
  brackets: y?.brackets?.length
    ? y.brackets.map((b) => ({ upTo: b.upTo == null ? "" : String(b.upTo), rate: String(b.rate) }))
    : [{ upTo: "", rate: "" }],
  note: y?.note || "",
});

const num = (s: string) => Number(String(s).replace(/[^\d.]/g, "")) || 0;

const YearForm = ({ year, base, onDone }: { year: number; base?: Year; onDone: () => unknown }) => {
  const pushNotification = useNotification();
  const [d, setD] = useState<Draft>(() => toDraft(base));
  const [busy, setBusy] = useState(false);
  useEffect(() => setD(toDraft(base)), [base]);
  const setB = (i: number, patch: Partial<Draft["brackets"][number]>) =>
    setD((p) => ({ ...p, brackets: p.brackets.map((b, j) => (j === i ? { ...b, ...patch } : b)) }));
  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}/admin/finance/payroll-years/${year}`,
        method: "PUT",
        payload: {
          ...Object.fromEntries(FIELDS.map((k) => [k, num(d[k])])),
          // the last slice has no ceiling
          brackets: d.brackets.map((b, i, all) => ({
            upTo: i === all.length - 1 || !b.upTo.trim() ? null : num(b.upTo),
            rate: num(b.rate),
          })),
          note: d.note.trim() || undefined,
        },
      });
      pushNotification(ta("ذخیره شد"), "Success");
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={classes.main}>
      <div className={classes.form}>
        {FIELDS.map((k) => (
          <label key={k} className={classes.field}>
            {label[k]()}
            <input value={d[k]} onChange={(e) => setD((p) => ({ ...p, [k]: e.target.value }))} inputMode="decimal" dir="ltr" />
          </label>
        ))}
      </div>
      <section className={classes.card}>
        <span className={classes.cardTitle}>{ta("پله‌های مالیات حقوق (ماهانه)")}</span>
        <p className={classes.muted}>
          {ta("هر پله تا سقفش با نرخ خودش؛ مازاد معافیت تا سقف پله‌ی اول با نرخ پله‌ی اول و آخرین پله بدون سقف.")}
        </p>
        {d.brackets.map((b, i) => (
          <div key={i} className={classes.form}>
            <label className={classes.field}>
              {i === d.brackets.length - 1 ? ta("بدون سقف (مازاد)") : ta("تا (تومان)")}
              <input
                value={i === d.brackets.length - 1 ? "" : b.upTo}
                disabled={i === d.brackets.length - 1}
                onChange={(e) => setB(i, { upTo: e.target.value })}
                inputMode="numeric"
                dir="ltr"
              />
            </label>
            <label className={classes.field}>
              {ta("نرخ (درصد)")}
              <input value={b.rate} onChange={(e) => setB(i, { rate: e.target.value })} inputMode="decimal" dir="ltr" />
            </label>
            <div className={classes.actions}>
              <button
                type="button"
                className={classes.ghost}
                disabled={d.brackets.length <= 1}
                onClick={() => setD((p) => ({ ...p, brackets: p.brackets.filter((_, j) => j !== i) }))}
              >
                {ta("حذف")}
              </button>
            </div>
          </div>
        ))}
        <div>
          <button
            type="button"
            className={classes.ghost}
            onClick={() =>
              setD((p) => ({
                ...p,
                // a new slice goes before the open-ended last one
                brackets: [...p.brackets.slice(0, -1), { upTo: "", rate: "" }, ...p.brackets.slice(-1)],
              }))
            }
          >
            {ta("افزودن پله")}
          </button>
        </div>
      </section>
      <label className={classes.field}>
        {ta("توضیح (منبع ارقام)")}
        <input value={d.note} onChange={(e) => setD((p) => ({ ...p, note: e.target.value }))} maxLength={500} />
      </label>
      <div className={classes.actions}>
        <button type="button" className={classes.primary} disabled={busy || !num(d.minWage)} onClick={save}>
          {ta("ذخیره‌ی ارقام سال")}
        </button>
      </div>
    </div>
  );
};

const AdminPayrollYearsTab = () => {
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<Year[]>(`${API}/admin/finance/payroll-years`, (url: string) =>
    fetcher({ url }).then((res) => (Array.isArray(res.data) ? (res.data as Year[]) : [])),
  );
  const [year, setYear] = useState<number>(0);
  const [newYear, setNewYear] = useState("");
  useEffect(() => {
    if (data?.length && !year) setYear(data[0].year);
  }, [data, year]);
  const yearText = (y: number) => new Intl.NumberFormat(adminIntlTag(), { useGrouping: false }).format(y);
  const current = data?.find((y) => y.year === year);
  const remove = async () => {
    if (!current) return;
    try {
      await fetcher({ url: `${API}/admin/finance/payroll-years/${current.year}`, method: "DELETE" });
      pushNotification(ta("حذف شد"), "Success");
      setYear(0);
      mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    }
  };
  const addYear = () => {
    const y = Math.round(num(newYear));
    if (y < 1400 || y > 1500) return;
    setYear(y);
    setNewYear("");
  };
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("حقوق و دستمزد")}>
          <div className={classes.main}>
            <p className={classes.muted}>
              {ta("ارقام قانونی هر سال (مصوبه‌ی شورای عالی کار و قانون بودجه) را یک بار اینجا ثبت کنید؛ فیش حقوق همه‌ی مراکز با همین ارقام محاسبه می‌شود. تغییر ارقام روی لیست‌های حقوقِ ثبت‌شده اثر ندارد.")}
            </p>
            <div className={classes.filters}>
              <div className={classes.segmented} role="tablist">
                {[...data.map((y) => y.year), ...(year && !data.some((y) => y.year === year) ? [year] : [])]
                  .sort((a, b) => b - a)
                  .map((y) => (
                    <button key={y} type="button" className={y === year ? classes.on : ""} onClick={() => setYear(y)}>
                      {yearText(y)}
                    </button>
                  ))}
              </div>
              <input
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder={ta("سال جدید (مثلاً ۱۴۰۶)")}
                aria-label={ta("سال جدید (مثلاً ۱۴۰۶)")}
                inputMode="numeric"
                dir="ltr"
              />
              <button type="button" className={classes.ghost} onClick={addYear}>
                {ta("افزودن سال")}
              </button>
            </div>
            {!!year && (
              <>
                {!current && <p className={classes.muted}>{ta("این سال هنوز ثبت نشده؛ ارقام را وارد و ذخیره کنید.")}</p>}
                <YearForm
                  key={year}
                  year={year}
                  base={current || data.find((y) => y.year === year - 1) || data[0]}
                  onDone={() => mutate()}
                />
                {!!current && !current.runs && (
                  <div className={classes.actions}>
                    <button type="button" className={classes.danger} onClick={remove}>
                      {ta("حذف ارقام این سال")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminPayrollYearsTab;
