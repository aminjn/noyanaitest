"use client";

import { ChangeEvent, useRef, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import Box from "@/Components/Admin/UI/Box";
import NodesSelector from "@/Components/UI/NodesSelector";
import classes from "./ProviderImport.module.css";
import own from "./PharmacyProductImport.module.css";

// «محصولات داروخانه» (2026-10): a pharmacy's product file (the first one
// Saba's: groups[] / items[] with Persian field names) becomes its offers.
// Pick the pharmacy -> choose the file -> preview (nothing is written) ->
// apply. A product another pharmacy already sells is matched by name, so
// the site keeps one page per product with many sellers; re-running the
// same file only updates prices and stock (backend
// Services/pharmacyProductImport.ts).
//
// Benchmark: Snapp Pharmacy and Digikala onboard a seller's catalogue from
// its own export onto one shared product page; here the super admin does
// it for the pharmacy, with a preview before anything is written.

const BASE = `${API}/admin/import/products`;
const numbers = adminNumberFormat();

type Plan = {
  pharmacy?: { _id: string; name?: string };
  total?: number;
  newProducts?: number;
  matchedProducts?: number;
  newOffers?: number;
  updatedOffers?: number;
  unchangedOffers?: number;
  newCategories?: string[];
  categories?: { name: string; count: number; match?: { _id: string; name?: string } }[];
  uncategorized?: number;
  skipped?: { name: string; reason: string }[];
  sample?: { name: string; price: number; inStock: boolean; category?: string; matched: boolean }[];
  images?: number;
  imageFailures?: number;
};

const reasonLabel = (reason: string) => (reason === "duplicate" ? ta("تکراری در همین فایل") : reason === "noPrice" ? ta("قیمت ندارد") : reason);

type Option = { _id?: string; name?: string; city?: { name?: string } | null };
const optionLabel = (node: unknown) => {
  const o = (node || {}) as Option;
  return o.city?.name ? `${o.name || ""} (${o.city.name})` : o.name || "";
};

const PharmacyProductImport = () => {
  const pushNotification = useNotification();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pharmacy, setPharmacy] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [result, setResult] = useState<Plan | null>(null);
  const [busy, setBusy] = useState<"preview" | "apply" | null>(null);
  // the admin's category choices: file category -> site category id ("" =
  // a new category of that name), and the one for rows that have none
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [fallback, setFallback] = useState<string>("");

  const send = async (step: "preview" | "apply", f: File | null = file, id: string | null = pharmacy) => {
    if (!id) return pushNotification(ta("داروخانه را انتخاب کنید"), "Error");
    if (!f) return pushNotification(ta("فایلی بارگذاری نشد"), "Error");
    setBusy(step);
    try {
      const categories = JSON.stringify({ map: categoryMap, fallback: fallback || undefined });
      const r = await fetcher<{ data: Plan }>({ url: `${BASE}/${step}`, method: "POST", payload: { pharmacy: id, file: f, categories }, bodyParser: "FORM" });
      if (step === "preview") {
        setPlan(r.data || null);
        setResult(null);
        const list = Array.isArray(r.data?.categories) ? r.data.categories : [];
        setCategoryMap(Object.fromEntries(list.map((c) => [c.name, c.match?._id || ""])));
      } else {
        setResult(r.data || null);
        setPlan(null);
        pushNotification(ta("محصولات داروخانه ثبت شد"), "Success");
      }
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setBusy(null);
    }
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    e.target.value = "";
    if (!f) return;
    setFile(f);
    setPlan(null);
    setResult(null);
    if (pharmacy) send("preview", f);
  };

  const view = result || plan;
  const n = (v?: number) => numbers.format(v || 0);
  const stats: [string, number | undefined][] = view
    ? [
        [ta("ردیف‌های فایل"), view.total],
        [ta("محصول تازه"), view.newProducts],
        [ta("محصول موجود در سایت"), view.matchedProducts],
        [ta("پیشنهاد تازه‌ی داروخانه"), view.newOffers],
        [ta("قیمت یا موجودی تغییرکرده"), view.updatedOffers],
        [ta("بدون تغییر"), view.unchangedOffers],
        ...(result ? ([[ta("عکس ذخیره‌شده"), result.images]] as [string, number | undefined][]) : []),
      ]
    : [];

  return (
    <div className={classes.main}>
      <Box className={classes.section}>
        <h3 className={classes.sectionTitle}>{ta("محصولات داروخانه")}</h3>
        <p className={classes.hint}>
          {ta("فایل JSON محصولات یک داروخانه (مثل فایل صبا) را بارگذاری کنید. هر محصول اگر در سایت باشد به همان صفحه وصل می‌شود و اگر نباشد با عکس، توضیحات، دسته و برند ساخته می‌شود؛ قیمت و موجودی برای همین داروخانه ثبت می‌شود. اجرای دوباره‌ی همان فایل فقط قیمت و موجودی را به‌روز می‌کند.")}
        </p>
        <div className={own.picker}>
          <NodesSelector
            multi={false}
            path={`${BASE}/pharmacies`}
            search
            title={ta("داروخانه")}
            getOptionLabel={optionLabel}
            getOptionValue={(node) => String((node as Option)?._id || "")}
            onChange={(v) => {
              setPharmacy(v || null);
              setPlan(null);
              setResult(null);
              if (v && file) send("preview", file, v);
            }}
          />
        </div>
        <div className={classes.actionsRow}>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={onFile} />
          <Button size="M" variant="Neutral" onClick={() => fileRef.current?.click()}>
            {ta("انتخاب فایل JSON")}
          </Button>
          {!!file && (
            <span className={classes.fileLine}>
              <strong dir="auto">{file.name}</strong>
              <span>{ta("${1} کیلوبایت", [numbers.format(Math.round(file.size / 1024))])}</span>
            </span>
          )}
          <Button size="M" variant={pharmacy && file ? "Primary" : "Disable"} isLoading={busy === "preview"} onClick={pharmacy && file ? () => send("preview") : undefined}>
            {ta("پیش‌نمایش")}
          </Button>
        </div>
      </Box>

      {!!view && (
        <Box className={classes.section}>
          <h3 className={classes.sectionTitle}>
            {result ? ta("نتیجه‌ی ورود محصولات ${1}", [view.pharmacy?.name || ""]) : ta("پیش‌نمایش محصولات ${1}", [view.pharmacy?.name || ""])}
          </h3>
          <div className={own.stats}>
            {stats.map(([label, value]) => (
              <div key={label} className={own.stat}>
                <strong>{n(value)}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          {!!result && !!view.newCategories?.length && (
            <p className={classes.hint}>
              {ta("دسته‌های تازه: ${1}", [view.newCategories.join("، ")])}
            </p>
          )}
          {!!result?.imageFailures && (
            <p className={classes.hint}>{ta("${1} عکس دریافت نشد؛ نشانی اصلی آن نگه داشته شد.", [n(result.imageFailures)])}</p>
          )}
          {!result && (!!view.categories?.length || !!view.uncategorized) && (
            <div className={own.categories}>
              <h4 className={own.subTitle}>{ta("دسته‌بندی محصولات")}</h4>
              <p className={classes.hint}>
                {ta("هر دسته‌ی فایل به دسته‌ی هم‌نام سایت وصل می‌شود و اگر نباشد ساخته می‌شود. می‌توانید دسته‌ی دیگری انتخاب کنید یا همین‌جا دسته‌ی تازه بسازید.")}
              </p>
              {(view.categories || []).map((c) => (
                <div key={c.name} className={own.categoryRow}>
                  <div className={own.categoryName}>
                    <strong dir="auto">{c.name}</strong>
                    <span>{ta("${1} محصول", [n(c.count)])}</span>
                    {!categoryMap[c.name] && !c.match && <Badge color="Info">{ta("دسته‌ی تازه ساخته می‌شود")}</Badge>}
                  </div>
                  <div className={own.categoryPick}>
                    <NodesSelector
                      key={`${c.name}-${c.match?._id || ""}`}
                      multi={false}
                      path={`${API}/auto/productCategory`}
                      creatable={{ path: `${API}/auto/productCategory` }}
                      clearable
                      defaultValue={c.match?._id}
                      getOptionLabel={(node) => String((node as Option)?.name || "")}
                      getOptionValue={(node) => String((node as Option)?._id || "")}
                      onChange={(v) => setCategoryMap((prev) => ({ ...prev, [c.name]: v || "" }))}
                    />
                  </div>
                </div>
              ))}
              {!!view.uncategorized && (
                <div className={own.categoryRow}>
                  <div className={own.categoryName}>
                    <strong>{ta("بدون دسته")}</strong>
                    <span>{ta("${1} محصول", [n(view.uncategorized)])}</span>
                  </div>
                  <div className={own.categoryPick}>
                    <NodesSelector
                      multi={false}
                      path={`${API}/auto/productCategory`}
                      creatable={{ path: `${API}/auto/productCategory` }}
                      clearable
                      getOptionLabel={(node) => String((node as Option)?.name || "")}
                      getOptionValue={(node) => String((node as Option)?._id || "")}
                      onChange={(v) => setFallback(v || "")}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {!!view.sample?.length && (
            <div className={own.tableWrap}>
              <table className={own.table}>
                <thead>
                  <tr>
                    <th>{ta("نام کالا")}</th>
                    <th>{ta("دسته")}</th>
                    <th>{ta("قیمت (تومان)")}</th>
                    <th>{ta("وضعیت")}</th>
                  </tr>
                </thead>
                <tbody>
                  {view.sample.map((row) => (
                    <tr key={row.name}>
                      <td dir="auto">{row.name}</td>
                      <td dir="auto">{row.category || "-"}</td>
                      <td>{n(row.price)}</td>
                      <td>
                        <span className={own.badges}>
                          <Badge color={row.inStock ? "Success" : "Disabled"}>{row.inStock ? ta("موجود") : ta("ناموجود")}</Badge>
                          {row.matched && <Badge color="Primary">{ta("در سایت هست")}</Badge>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!!view.skipped?.length && (
            <details className={own.skipped}>
              <summary>{ta("${1} ردیف وارد نمی‌شود", [n(view.skipped.length)])}</summary>
              <ul>
                {view.skipped.map((s, i) => (
                  <li key={`${s.name}-${i}`}>
                    <span dir="auto">{s.name}</span> - {reasonLabel(s.reason)}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {!result && (
            <div className={classes.actionsRow}>
              <Button size="M" variant="Success" isLoading={busy === "apply"} onClick={busy ? undefined : () => send("apply")}>
                {ta("ثبت محصولات برای این داروخانه")}
              </Button>
            </div>
          )}
        </Box>
      )}
    </div>
  );
};

export default PharmacyProductImport;
