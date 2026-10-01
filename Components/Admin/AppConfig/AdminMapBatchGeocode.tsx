"use client";

import { useState } from "react";
import Box from "../UI/Box";
import Table from "../UI/Table";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import Button from "@/Components/UI/Button";
import Badge, { BadgeColor } from "@/Components/UI/Badge";
import ToggleInput from "@/Components/UI/ToggleInput";
import { adminPath } from "@/Components/helpers/adminPath";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import useMapJob from "./useMapJob";
import MapJobProgress from "./MapJobProgress";
import classes from "./AdminMapSettings.module.css";

// Providers with a typed address but no map pin (doctor offices, clinics,
// hospitals, paraclinics, pharmacies) go to NexaMap's batch geocode; a
// result with confidence >= 0.6 is saved as the pin (and fills the empty
// province / city / district), the rest are listed for a manual fix.
// Backend: POST /admin/map/geocode/batch, GET /admin/map/jobs/geocode.

type Outcome = "applied" | "preview" | "lowConfidence" | "notFound" | "changed" | "error";
type ProviderKind = "office" | "clinic" | "hospital" | "paraClinic" | "pharmacy";

type GeocodeRow = {
  kind: ProviderKind;
  id: string;
  doctor?: string;
  name: string;
  address: string;
  formattedAddress?: string;
  confidence?: number;
  lat?: number;
  lng?: number;
  outcome: Outcome;
};

type GeocodeResult = {
  total: number;
  minConfidence: number;
  summary: Partial<Record<Outcome, number>>;
  rows: GeocodeRow[];
};

const kindLabels: Record<ProviderKind, string> = {
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
};

const outcomeLabels: Record<Outcome, string> = {
  get applied() {
    return ta("ثبت شد");
  },
  get preview() {
    return ta("پیش‌نمایش (ثبت نشد)");
  },
  get lowConfidence() {
    return ta("اطمینان کم؛ بررسی دستی");
  },
  get notFound() {
    return ta("پیدا نشد؛ بررسی دستی");
  },
  get changed() {
    return ta("در این فاصله موقعیت گرفت");
  },
  get error() {
    return ta("خطا در ثبت");
  },
};

const outcomeColors: Record<Outcome, BadgeColor> = {
  applied: "Success",
  preview: "Info",
  lowConfidence: "Warning",
  notFound: "Error",
  changed: "Secondary",
  error: "Error",
};

const editPath = (row: GeocodeRow) => {
  switch (row.kind) {
    case "office":
      return row.doctor ? adminPath(`/doctorprofile/${row.doctor}`) : null;
    case "clinic":
      return adminPath(`/clinic/${row.id}`);
    case "hospital":
      return adminPath(`/hospital/${row.id}`);
    case "paraClinic":
      return adminPath(`/paraClinic/${row.id}`);
    case "pharmacy":
      return adminPath(`/pharmacy/${row.id}`);
    default:
      return null;
  }
};

const AdminMapBatchGeocode = ({ enabled }: { enabled: boolean }) => {
  const { job, running, starting, start } = useMapJob<GeocodeResult>("geocode");
  const [dryRun, setDryRun] = useState(false);

  const result = job?.status === "done" && job.result && typeof job.result === "object" ? job.result : null;
  const rows = Array.isArray(result?.rows) ? result!.rows.filter((r) => r && typeof r === "object") : [];
  const number = (n: unknown) => (typeof n === "number" ? n.toLocaleString(adminIntlTag()) : "0");

  return (
    <Box className={classes.box}>
      <h3 className={classes.sectionTitle}>{ta("مکان‌یابی گروهی مراکز")}</h3>
      <p className={classes.note}>
        {ta("مطب‌ها، کلینیک‌ها، بیمارستان‌ها، پاراکلینیک‌ها و داروخانه‌هایی که نشانی دارند ولی موقعیت روی نقشه ندارند، با نشانی‌شان در نکسا مپ مکان‌یابی می‌شوند. نتیجه‌های با اطمینان ۶۰٪ یا بیشتر ثبت می‌شوند و بقیه برای بررسی دستی فهرست می‌شوند.")}
      </p>
      <ToggleInput
        title={ta("فقط پیش‌نمایش (چیزی ذخیره نشود)")}
        value={dryRun}
        onChange={() => setDryRun((prev) => !prev)}
        readOnly={running}
      />
      <div className={classes.actions}>
        <Button
          size="M"
          onClick={() => enabled && start({ dryRun })}
          isLoading={starting || running}
          variant={enabled ? "Primary" : "Disable"}
        >
          {enabled ? ta("شروع مکان‌یابی") : ta("ابتدا سرویس نقشه را فعال کنید")}
        </Button>
      </div>
      {!!job && <MapJobProgress job={job} />}
      {!!result && (
        <div className={classes.row}>
          {(Object.keys(outcomeLabels) as Outcome[])
            .filter((key) => (result.summary?.[key] || 0) > 0)
            .map((key) => (
              <Badge key={key} color={outcomeColors[key]} size="L">
                {`${outcomeLabels[key]}: ${number(result.summary?.[key])}`}
              </Badge>
            ))}
          {!rows.length && <span className={classes.note}>{ta("مرکزی بدون موقعیت پیدا نشد.")}</span>}
        </div>
      )}
      {!!rows.length && (
        <Table
          name="AdminMapBatchGeocode"
          data={rows}
          renderer={{
            kind: {
              name: ta("نوع"),
              value: (row) => kindLabels[row.kind] || row.kind,
              filter: "Set",
            },
            name: { name: ta("نام"), value: (row) => row.name, filter: "Text" },
            address: { name: ta("نشانی ثبت‌شده"), value: (row) => row.address, filter: "Text" },
            formattedAddress: {
              name: ta("نشانی یافته‌شده"),
              value: (row) => row.formattedAddress || "",
              filter: "Text",
            },
            confidence: {
              name: ta("اطمینان"),
              value: (row) => (typeof row.confidence === "number" ? Math.round(row.confidence * 100) : undefined),
              filter: "Number",
              component: (row) =>
                typeof row.confidence === "number"
                  ? (row.confidence).toLocaleString(adminIntlTag(), { style: "percent" })
                  : "—",
            },
            outcome: {
              name: ta("نتیجه"),
              value: (row) => outcomeLabels[row.outcome] || row.outcome,
              filter: "Set",
              component: (row) => (
                <Badge color={outcomeColors[row.outcome] || "Disabled"}>
                  {outcomeLabels[row.outcome] || row.outcome}
                </Badge>
              ),
            },
            actions: {
              name: ta("عملیات"),
              component: (row) => {
                const href = editPath(row);
                return href ? (
                  <TableActions>
                    <IconLink href={href} title={ta("ویرایش و ثبت دستی موقعیت")}>
                      <EyeIcon />
                    </IconLink>
                  </TableActions>
                ) : null;
              },
            },
          }}
        />
      )}
    </Box>
  );
};

export default AdminMapBatchGeocode;
