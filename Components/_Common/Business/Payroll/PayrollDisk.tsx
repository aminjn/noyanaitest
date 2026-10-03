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

type Settings = {
  workshopCode?: string;
  workshopName?: string;
  employerName?: string;
  address?: string;
  contractRow?: string;
  listNo?: string;
  encoding?: "iransystem" | "windows1256";
};
type Check = { workshop: string[]; missing: { name: string; fields: string[] }[]; insured: number };

const FIELD_KEY: Record<string, ContentKey> = {
  insuranceNo: "payInsuranceNo",
  nationalId: "payNationalId",
  jobCode: "payJobCode",
};

const latin = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, "");

// The month's Tamin list disk (DSKKAR00 + DSKWOR00 in a zip, for the List
// Disk software or es.tamin.ir): the workshop as Tamin knows it, what the
// insured staff still miss, and the download.
const DiskForm = ({ runId }: { runId: string }) => {
  const t = usePayText();
  const f = useBizFormat();
  const { api, canWrite } = usePay();
  const pushNotification = useNotification();
  const { data: settings, mutate: reloadSettings } = useSWR<Settings | null>(`${API}${api}/settings`, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as Settings) : null)),
  );
  const { data: check, error, mutate: recheck } = useSWR<Check | null>(`${API}${api}/runs/${runId}/disk-check`, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as Check) : null)),
  );
  const [form, setForm] = useState<Settings>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);
  const set = (k: keyof Settings, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/settings`,
        method: "PUT",
        payload: {
          workshopCode: latin(form.workshopCode || ""),
          workshopName: (form.workshopName || "").trim(),
          employerName: (form.employerName || "").trim(),
          address: (form.address || "").trim(),
          contractRow: latin(form.contractRow || "000").padStart(3, "0").slice(-3),
          listNo: latin(form.listNo || "01") || "01",
          encoding: form.encoding || "iransystem",
        },
      });
      pushNotification(t("bizSaved"), "Success");
      await reloadSettings();
      await recheck();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}${api}/runs/${runId}/disk`, { credentials: "include" });
      if (!res.ok || !res.headers.get("content-type")?.includes("zip")) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || t("payDiskFailed"));
      }
      const blob = await res.blob();
      const name = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") || "")?.[1] || "tamin.zip";
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

  const ready = !!check && !check.workshop.length && !check.missing.length && check.insured > 0;
  return (
    <PopupCard size="wide" title={t("payDiskTitle")}>
      <div className={classes.popup}>
        <p className={classes.muted}>{t("payDiskHint")}</p>
        <section className={classes.card}>
          <span className={classes.cardTitle}>{t("payWorkshop")}</span>
          <div className={classes.form}>
            <label className={classes.field}>
              {t("payWorkshopCode")}
              <input value={form.workshopCode || ""} onChange={(e) => set("workshopCode", e.target.value)} maxLength={10} dir="ltr" inputMode="numeric" disabled={!canWrite} />
            </label>
            <label className={classes.field}>
              {t("payWorkshopName")}
              <input value={form.workshopName || ""} onChange={(e) => set("workshopName", e.target.value)} maxLength={100} disabled={!canWrite} />
            </label>
            <label className={classes.field}>
              {t("payEmployerName")}
              <input value={form.employerName || ""} onChange={(e) => set("employerName", e.target.value)} maxLength={100} disabled={!canWrite} />
            </label>
            <label className={`${classes.field} ${classes.wide}`}>
              {t("payWorkshopAddress")}
              <input value={form.address || ""} onChange={(e) => set("address", e.target.value)} maxLength={100} disabled={!canWrite} />
            </label>
            <label className={classes.field}>
              {t("payContractRow")}
              <input value={form.contractRow || ""} onChange={(e) => set("contractRow", e.target.value)} maxLength={3} dir="ltr" inputMode="numeric" disabled={!canWrite} />
            </label>
            <label className={classes.field}>
              {t("payListNo")}
              <input value={form.listNo || ""} onChange={(e) => set("listNo", e.target.value)} maxLength={12} dir="ltr" inputMode="numeric" disabled={!canWrite} />
            </label>
            <label className={classes.field}>
              {t("payDiskEncoding")}
              <select value={form.encoding || "iransystem"} onChange={(e) => set("encoding", e.target.value)} disabled={!canWrite}>
                <option value="iransystem">{t("payEncIranSystem")}</option>
                <option value="windows1256">{t("payEncWindows")}</option>
              </select>
            </label>
          </div>
          {canWrite && (
            <div className={classes.actions}>
              <button type="button" className={classes.ghost} disabled={busy} onClick={save}>
                {t("bizSave")}
              </button>
            </div>
          )}
        </section>
        <HandleLoading data={check !== undefined} error={error}>
          {!!check && (
            <>
              {check.missing.length > 0 && (
                <ul className={pay.missing}>
                  {check.missing.map((m) => (
                    <li key={m.name}>
                      {t("payDiskMissing", [m.name, m.fields.map((x) => t(FIELD_KEY[x] || "payInsuranceNo")).join("، ")])}
                    </li>
                  ))}
                </ul>
              )}
              {check.insured === 0 && <p className={classes.muted}>{t("payDiskNoInsured")}</p>}
              {ready && <p className={pay.ready}>{t("payDiskReady", [f.money(check.insured)])}</p>}
            </>
          )}
        </HandleLoading>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={busy || !ready} onClick={download}>
            {t("payDiskDownload")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const PayrollDisk = ({ ctx, runId }: { ctx: { api: string; canWrite: boolean }; runId: string }) => (
  <PayContext.Provider value={ctx}>
    <DiskForm runId={runId} />
  </PayContext.Provider>
);

export default PayrollDisk;
