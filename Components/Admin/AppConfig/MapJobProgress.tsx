"use client";

import { MapJob } from "./useMapJob";
import Badge from "@/Components/UI/Badge";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminMapSettings.module.css";

// What a NexaMap job is doing, for the status line under its button.
const phaseLabel = (phase: string) => {
  const base = phase.split(":")[0];
  switch (base) {
    case "starting":
      return ta("در حال شروع");
    case "fetching":
      return ta("دریافت تقسیمات از نکسا مپ");
    case "fetchingByLevel":
      return ta("دریافت تقسیمات، استان به استان");
    case "importing":
      return ta("ثبت استان‌ها، شهرها و مناطق");
    case "collecting":
      return ta("یافتن مراکز بدون موقعیت");
    case "geocoding":
      return ta("مکان‌یابی نشانی‌ها در نکسا مپ");
    case "applying":
      return ta("ثبت موقعیت‌ها");
    case "done":
      return ta("پایان یافت");
    case "failed":
      return ta("ناموفق");
    default:
      return phase;
  }
};

// Also used by other background jobs of the admin (the old-site import,
// Components/Admin/Old/Migrate): `phaseText` names their own phases.
export type JobProgressState = Pick<MapJob, "status" | "phase" | "total" | "processed" | "startedAt"> & {
  error?: { code?: string; message: string };
};

const MapJobProgress = ({
  job,
  phaseText,
}: {
  job: JobProgressState;
  phaseText?: (phase: string) => string | undefined;
}) => {
  const total = Number(job.total) || 0;
  const processed = Math.min(Number(job.processed) || 0, total || Infinity);
  const percent = total ? Math.round((processed / total) * 100) : 0;
  const number = (n: number) => n.toLocaleString(adminIntlTag());
  const color = job.status === "done" ? "Success" : job.status === "failed" ? "Error" : "Info";
  return (
    <div className={classes.progress} aria-live="polite">
      <div className={classes.row}>
        <Badge color={color} size="L">
          {(() => {
            const phase = job.status === "running" ? job.phase || "" : job.status;
            return phaseText?.(phase) || phaseLabel(phase);
          })()}
        </Badge>
        {total > 0 && (
          <span className={classes.note}>
            {ta("${1} از ${2}", [number(processed), number(total)])}
          </span>
        )}
        {!!job.startedAt && (
          <span className={classes.note}>
            {new Date(job.startedAt).toLocaleString(adminIntlTag())}
          </span>
        )}
      </div>
      {job.status === "running" && (
        <div
          className={classes.track}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={total ? percent : undefined}
        >
          <span
            className={`${classes.fill} ${total ? "" : classes.indeterminate}`}
            style={total ? { inlineSize: `${percent}%` } : undefined}
          />
        </div>
      )}
      {job.status === "failed" && !!job.error?.message && (
        <p className={classes.error}>
          {job.error.message}
          {!!job.error.code && <span className={classes.ltr}> ({job.error.code})</span>}
        </p>
      )}
    </div>
  );
};

export default MapJobProgress;
