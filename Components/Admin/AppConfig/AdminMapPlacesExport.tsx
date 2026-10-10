"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Box from "../UI/Box";
import HandleLoading from "../UI/HandleLoading";
import Button from "@/Components/UI/Button";
import CheckboxGroupInput from "@/Components/UI/CheckboxGroupInput";
import DateInput from "@/Components/UI/DateInput";
import ToggleInput from "@/Components/UI/ToggleInput";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminMapSettings.module.css";

// «خروجی مکان‌ها برای نکسا مپ» (2026-10, owner's decision): every public
// provider place with a map pin (doctor offices, clinics, hospitals,
// paraclinics, pharmacies, insurers) as a JSON-lines file the owner
// hands to NexaMap as is: location, working hours, public phone, page
// link, rating and approved reviews. Filters: kinds and "changed since"; the count
// is previewed before the download. Backend: GET /admin/map/places/count
// and GET /admin/map/places.jsonl (Lib/mapPlacesExport.ts), streamed, so
// the browser saves it straight to disk.

const placeKinds = ["office", "clinic", "hospital", "paraClinic", "pharmacy", "insurance"] as const;
type PlaceKind = (typeof placeKinds)[number];

const kindLabels: Record<PlaceKind, string> = {
  get office() {
    return ta("مطب پزشک");
  },
  get clinic() {
    return ta("کلینیک");
  },
  get hospital() {
    return ta("بیمارستان");
  },
  get paraClinic() {
    return ta("پاراکلینیک");
  },
  get pharmacy() {
    return ta("داروخانه");
  },
  get insurance() {
    return ta("بیمه");
  },
};

type CountResult = {
  counts: Partial<Record<PlaceKind, number>>;
  total: number;
  siteBaseUrl: string;
};

const AdminMapPlacesExport = () => {
  const [kinds, setKinds] = useState<PlaceKind[]>([...placeKinds]);
  const [since, setSince] = useState<Date | null>(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [format, setFormat] = useState<"jsonl" | "geojson">("jsonl");

  const query = useMemo(() => {
    const q = new URLSearchParams();
    // every kind = no filter
    if (kinds.length && kinds.length < placeKinds.length) q.set("types", kinds.join(","));
    if (since) q.set("since", since.toISOString());
    return q;
  }, [kinds, since]);

  const { data, error, isValidating } = useSWR<CountResult>(
    kinds.length ? `${API}/admin/map/places/count?${query}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const num = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : 0).toLocaleString(adminIntlTag());
  const downloadQuery = new URLSearchParams(query);
  if (format === "geojson") downloadQuery.set("format", "geojson");
  const href = `${API}/admin/map/places.jsonl?${downloadQuery}`;
  const total = typeof data?.total === "number" ? data.total : 0;
  // a plain link, not fetch: the file streams straight to disk with the
  // admin's session cookie, however large it is
  const download = () => {
    const a = document.createElement("a");
    a.href = href;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const options = Object.fromEntries(placeKinds.map((k) => [k, kindLabels[k]]));

  return (
    <Box className={classes.box}>
      <h3 className={classes.sectionTitle}>{ta("خروجی مکان‌ها برای نکسا مپ")}</h3>
      <p className={classes.note}>
        {ta("یک فایل JSONL با یک خط برای هر مکان عمومی که موقعیتش در نویان ثبت شده است (مطب پزشکان، کلینیک‌ها، بیمارستان‌ها، پاراکلینیک‌ها، داروخانه‌ها و بیمه‌ها): موقعیت و نشانی، ساعت کاری، تلفن عمومی، لینک صفحه، امتیاز و نظرهای تأییدشده. فقط مراکز فعال و منتشرشده در فایل می‌آیند و از بیماران فقط نامی که سایت کنار نظرشان نشان می‌دهد، نه تلفن یا کد ملی.")}
      </p>
      <CheckboxGroupInput
        title={ta("نوع مکان")}
        options={options}
        defaultValue={kinds}
        onChange={(next) => setKinds(placeKinds.filter((k) => next.includes(k)))}
      />
      <div className={classes.row}>
        <DateInput
          key={pickerKey}
          title={ta("فقط تغییرکرده از تاریخ (اختیاری)")}
          defaultValue={since || undefined}
          onChange={(d) => setSince(d)}
        />
        {!!since && (
          <Button
            size="M"
            mode="Outline"
            variant="Neutral"
            onClick={() => {
              setSince(null);
              setPickerKey((k) => k + 1);
            }}
          >
            {ta("همه‌ی تاریخ‌ها")}
          </Button>
        )}
      </div>
      <ToggleInput
        title={ta("هر خط یک GeoJSON Feature باشد (به‌جای شیء ساده با lat و lng)")}
        value={format === "geojson"}
        onChange={() => setFormat((f) => (f === "geojson" ? "jsonl" : "geojson"))}
      />
      {!kinds.length ? (
        <p className={classes.error}>{ta("دست‌کم یک نوع مکان را انتخاب کنید.")}</p>
      ) : (
        <HandleLoading data={!!data} error={error}>
          <dl className={classes.stats} aria-live="polite">
            {kinds.map((k) => (
              <div key={k} className={classes.stat}>
                <dt>{kindLabels[k]}</dt>
                <dd>{num(data?.counts?.[k])}</dd>
              </div>
            ))}
            <div className={classes.stat}>
              <dt>{ta("جمع")}</dt>
              <dd>{num(total)}</dd>
            </div>
          </dl>
          {!data?.siteBaseUrl && (
            <p className={classes.error}>
              {ta("نشانی سایت در تنظیمات کلی ثبت نشده است؛ لینک صفحه‌ی هر مکان در فایل بدون دامنه نوشته می‌شود.")}
            </p>
          )}
        </HandleLoading>
      )}
      <div className={classes.actions}>
        {kinds.length && total > 0 && !isValidating ? (
          <Button size="M" onClick={download}>
            {ta("دریافت فایل (${1} مکان)", [num(total)])}
          </Button>
        ) : (
          <Button size="M" variant="Disable" isLoading={isValidating}>
            {ta("مکانی برای خروجی نیست")}
          </Button>
        )}
      </div>
    </Box>
  );
};

export default AdminMapPlacesExport;
