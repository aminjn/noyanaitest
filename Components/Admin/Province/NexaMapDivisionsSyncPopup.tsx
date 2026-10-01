"use client";

import { useEffect, useRef, useState } from "react";
import PopupCard from "@/Components/UI/PopupCard";
import Button from "@/Components/UI/Button";
import ToggleInput from "@/Components/UI/ToggleInput";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import useMapJob from "../AppConfig/useMapJob";
import MapJobProgress from "../AppConfig/MapJobProgress";
import classes from "../AppConfig/AdminMapSettings.module.css";

// Imports NexaMap's provinces, cities and districts (with their boundaries)
// into ours: a record is matched by its NexaMap id, else by its Persian name
// inside its parent; missing ones are created (inactive, for the admin to
// review), boundaries fill only empty ones unless "replace" is on. Nothing
// is deleted. Backend: POST /admin/map/divisions/sync, GET
// /admin/map/jobs/divisions (Lib/nexamapAdmin.ts).

type Kind = "province" | "city" | "district";
type Counts = { matched: number; created: number; updated: number; skipped: number };
type SyncResult = {
  counts: Partial<Record<Kind, Partial<Counts>>>;
  geometryErrors: number;
  problems?: { kind: Kind; name: string; reason: string }[];
};

const kindLabels: Record<Kind, string> = {
  get province() {
    return ta("استان");
  },
  get city() {
    return ta("شهر");
  },
  get district() {
    return ta("منطقه");
  },
};

const NexaMapDivisionsSyncPopup = ({ onDone }: { onDone?: () => unknown }) => {
  const { job, running, starting, start } = useMapJob<SyncResult>("divisions");
  const [replaceGeometry, setReplaceGeometry] = useState(false);

  // refresh the lists once a run this popup watched finishes
  const wasRunning = useRef(false);
  useEffect(() => {
    if (running) wasRunning.current = true;
    else if (wasRunning.current && job?.status === "done") {
      wasRunning.current = false;
      onDone?.();
    }
  }, [running, job?.status, onDone]);

  const result = job?.status === "done" && job.result && typeof job.result === "object" ? job.result : null;
  const number = (n: unknown) => (typeof n === "number" ? n.toLocaleString(adminIntlTag()) : "0");
  const problems = Array.isArray(result?.problems) ? result!.problems : [];

  return (
    <PopupCard title={ta("همگام‌سازی تقسیمات کشوری با نکسا مپ")}>
      <div className={classes.stack}>
        <p className={classes.note}>
          {ta("استان‌ها، شهرها و مناطق از نکسا مپ خوانده می‌شوند. موارد موجود با نام فارسی (در استان یا شهر خودشان) تطبیق داده می‌شوند و شناسه‌ی نکسا مپ و مرزشان ثبت می‌شود؛ موارد جدید غیرفعال ساخته می‌شوند تا بررسی و فعالشان کنید. چیزی حذف نمی‌شود.")}
        </p>
        <ToggleInput
          title={ta("جایگزینی مرزهای فعلی با مرزهای نکسا مپ")}
          value={replaceGeometry}
          onChange={() => setReplaceGeometry((prev) => !prev)}
          readOnly={running}
        />
        <p className={classes.note}>
          {ta("اگر خاموش باشد، مرز فقط برای مواردی ثبت می‌شود که هنوز مرزی ندارند.")}
        </p>
        <div className={classes.actions}>
          <Button size="M" onClick={() => start({ replaceGeometry })} isLoading={starting || running}>
            {ta("شروع همگام‌سازی")}
          </Button>
        </div>
        {!!job && <MapJobProgress job={job} />}
        {!!result && (
          <div className={classes.tableWrap}>
            <table className={classes.countsTable}>
              <thead>
                <tr>
                  <th>{ta("نوع")}</th>
                  <th>{ta("تطبیق‌یافته")}</th>
                  <th>{ta("ساخته‌شده")}</th>
                  <th>{ta("به‌روزشده")}</th>
                  <th>{ta("ردشده")}</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(kindLabels) as Kind[]).map((kind) => {
                  const c = result.counts?.[kind] || {};
                  return (
                    <tr key={kind}>
                      <td>{kindLabels[kind]}</td>
                      <td>{number(c.matched)}</td>
                      <td>{number(c.created)}</td>
                      <td>{number(c.updated)}</td>
                      <td>{number(c.skipped)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!!result && (result.geometryErrors || 0) > 0 && (
          <p className={classes.note}>
            {ta("مرز ${1} مورد معتبر نبود و ثبت نشد (بقیه‌ی اطلاعاتشان ثبت شد).", [number(result.geometryErrors)])}
          </p>
        )}
        {!!problems.length && (
          <ul className={classes.problems}>
            {problems.map((p, i) => (
              <li key={i}>
                {`${kindLabels[p.kind] || p.kind}: ${p.name} — ${
                  p.reason === "geometry" ? ta("مرز نامعتبر") : ta("ساخته نشد")
                }`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PopupCard>
  );
};

export default NexaMapDivisionsSyncPopup;
