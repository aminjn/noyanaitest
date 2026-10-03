"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import pay from "./Payroll.module.css";
import { PayContext, usePay, usePayText } from "./payShared";
import { useBizFormat } from "../bizShared";
import { ContentKey } from "@/Components/Enums/contentKeys";

type Settings = { taxEncoding?: "windows1256" | "utf8"; workplaceStatus?: "normal" | "lessDeveloped" | "freeZone" };
type Check = {
  missing: { name: string; fields: string[] }[];
  totals: { staff: number; paid: number; eid: number; severance: number; tax: number };
  bonuses: number;
};

const FIELD_KEY: Record<string, ContentKey> = {
  nationalId: "payNationalIdValid",
  education: "payEducation",
  hireDate: "payHireDate",
};

// The month's salary tax list for my.tax.gov.ir (WP + WH in a zip, with the
// same lists as CSV to read): how the files are written, what the staff
// still miss, the month's totals and the download.
const TaxForm = ({ runId }: { runId: string }) => {
  const t = usePayText();
  const f = useBizFormat();
  const { api, canWrite } = usePay();
  const pushNotification = useNotification();
  const { data: settings, mutate: reloadSettings } = useSWR<Settings | null>(`${API}${api}/settings`, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as Settings) : null)),
  );
  const { data: check, error } = useSWR<Check | null>(`${API}${api}/runs/${runId}/tax-check`, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as Check) : null)),
  );
  const [form, setForm] = useState<Settings>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (settings) setForm({ taxEncoding: settings.taxEncoding, workplaceStatus: settings.workplaceStatus });
  }, [settings]);

  const save = async (next: Settings) => {
    setForm(next);
    if (!canWrite) return;
    try {
      await fetcher({
        url: `${API}${api}/settings`,
        method: "PUT",
        payload: { taxEncoding: next.taxEncoding || "windows1256", workplaceStatus: next.workplaceStatus || "normal" },
      });
      await reloadSettings();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    }
  };

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}${api}/runs/${runId}/tax-disk`, { credentials: "include" });
      if (!res.ok || !res.headers.get("content-type")?.includes("zip")) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || t("payTaxFailed"));
      }
      const blob = await res.blob();
      const name = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") || "")?.[1] || "tax.zip";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  const missing = Array.isArray(check?.missing) ? check!.missing : [];
  const totals = check?.totals;
  const ready = !!check && !missing.length && (totals?.staff || 0) > 0;
  return (
    <PopupCard size="wide" title={t("payTaxDiskTitle")}>
      <div className={classes.popup}>
        <p className={classes.muted}>{t("payTaxDiskHint")}</p>
        <div className={classes.form}>
          <label className={classes.field}>
            {t("payWorkplaceStatus")}
            <select
              value={form.workplaceStatus || "normal"}
              onChange={(e) => save({ ...form, workplaceStatus: e.target.value as Settings["workplaceStatus"] })}
              disabled={!canWrite}
            >
              <option value="normal">{t("payWorkplaceNormal")}</option>
              <option value="lessDeveloped">{t("payWorkplaceLessDeveloped")}</option>
              <option value="freeZone">{t("payWorkplaceFreeZone")}</option>
            </select>
          </label>
          <label className={classes.field}>
            {t("payTaxEncoding")}
            <select
              value={form.taxEncoding || "windows1256"}
              onChange={(e) => save({ ...form, taxEncoding: e.target.value as Settings["taxEncoding"] })}
              disabled={!canWrite}
            >
              <option value="windows1256">{t("payEncWindows")}</option>
              <option value="utf8">{t("payEncUtf8")}</option>
            </select>
          </label>
        </div>
        <HandleLoading data={check !== undefined} error={error}>
          {!!totals && (
            <>
              <div className={classes.tiles}>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("payTaxStaff")}</span>
                  <span className={classes.tileValue}>{f.money(totals.staff)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("payTaxPaid")}</span>
                  <span className={classes.tileValue}>{f.money(totals.paid)}</span>
                </div>
                {totals.eid + totals.severance > 0 && (
                  <>
                    <div className={classes.tile}>
                      <span className={classes.tileLabel}>{t("payEid")}</span>
                      <span className={classes.tileValue}>{f.money(totals.eid)}</span>
                    </div>
                    <div className={classes.tile}>
                      <span className={classes.tileLabel}>{t("paySeverance")}</span>
                      <span className={classes.tileValue}>{f.money(totals.severance)}</span>
                    </div>
                  </>
                )}
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("payTaxTotal")}</span>
                  <span className={classes.tileValue}>{f.money(totals.tax)}</span>
                </div>
              </div>
              {(check?.bonuses || 0) > 0 && <p className={classes.muted}>{t("payTaxBonusIncluded")}</p>}
              {missing.length > 0 && (
                <ul className={pay.missing}>
                  {missing.map((m) => (
                    <li key={m.name}>
                      {t("payDiskMissing", [m.name, asList(m.fields).map((x) => t(FIELD_KEY[x] || "payNationalIdValid")).join("، ")])}
                    </li>
                  ))}
                </ul>
              )}
              {ready && <p className={pay.ready}>{t("payTaxReady", [f.money(totals.staff)])}</p>}
            </>
          )}
        </HandleLoading>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={busy || !ready} onClick={download}>
            {t("payTaxDownload")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const asList = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);

const PayrollTaxDisk = ({ ctx, runId }: { ctx: { api: string; canWrite: boolean }; runId: string }) => (
  <PayContext.Provider value={ctx}>
    <TaxForm runId={runId} />
  </PayContext.Provider>
);

export default PayrollTaxDisk;
