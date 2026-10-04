"use client";

import { useRef, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { errText, useCrm, useCrmText } from "./crmShared";
import { TagPicker } from "./CrmRulesForm";

// Import a patient list (2026-10): a CSV or Excel file from the old
// practice software or a spreadsheet. The columns are guessed from their
// headers and can be changed; every valid Iranian mobile becomes one
// contact, merged with an existing one of the same number (never two of
// the same phone). The owner confirms these are their own patients - the
// consent a campaign SMS rests on.

const POPUP = "CrmImport";
const FIELDS = ["name", "firstName", "lastName", "phone", "gender", "birthDate", "city", "insurer", "tags", "note"] as const;
type Field = (typeof FIELDS)[number];
const fieldKey: Record<Field, string> = {
  name: "crmName",
  firstName: "crmFirstName",
  lastName: "crmLastName",
  phone: "crmPhone",
  gender: "crmGender",
  birthDate: "crmBirthDate",
  city: "crmCity",
  insurer: "crmInsurer",
  tags: "crmTags",
  note: "crmNote",
};
type Preview = { headers: string[]; rows: string[][]; total: number; mapping: Partial<Record<Field, number>> };
type Result = { created: number; updated: number; invalid: number; duplicates: number };

const CrmImport = ({ onDone }: { onDone: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mapping, setMapping] = useState<Partial<Record<Field, number>>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const pick = async (fl?: File) => {
    if (!fl) return;
    setBusy(true);
    try {
      const res = await fetcher({ url: `${API}${api}/contacts/import/preview`, method: "POST", bodyParser: "FORM", payload: { file: fl } });
      const p = res.data as Preview;
      setFile(fl);
      setPreview(p);
      setMapping(p.mapping || {});
    } catch (err) {
      pushNotification(errText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: `${API}${api}/contacts/import`,
        method: "POST",
        bodyParser: "FORM",
        payload: { file, mapping: JSON.stringify(mapping), tags: JSON.stringify(tags), consent: consent ? "true" : "false" },
      });
      setResult(res.data as Result);
      onDone();
    } catch (err) {
      pushNotification(errText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PopupCard size="wide" title={t("crmImportTitle")}>
      <div className={classes.popup}>
        {result ? (
          <>
            <div className={classes.tiles}>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmImportCreated")}</span>
                <span className={classes.tileValue}>{f.money(result.created)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmImportUpdated")}</span>
                <span className={classes.tileValue}>{f.money(result.updated)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmImportInvalid")}</span>
                <span className={classes.tileValue}>{f.money(result.invalid)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmImportDuplicates")}</span>
                <span className={classes.tileValue}>{f.money(result.duplicates)}</span>
              </div>
            </div>
            <div className={classes.actions}>
              <button type="button" className={classes.primary} onClick={() => closePopup(POPUP)}>
                {t("crmClose")}
              </button>
            </div>
          </>
        ) : !preview ? (
          <>
            <p className={classes.muted}>{t("crmImportHint")}</p>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" hidden onChange={(e) => pick(e.target.files?.[0])} />
            <div className={classes.actions}>
              <button type="button" className={classes.ghost} onClick={() => closePopup(POPUP)}>
                {t("bizCancel")}
              </button>
              <button type="button" className={classes.primary} disabled={busy} onClick={() => fileRef.current?.click()}>
                {t("crmImportPick")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={classes.muted}>{t("crmImportRows", [f.money(preview.total), file?.name || ""])}</p>
            <div className={classes.form}>
              {FIELDS.map((k) => (
                <label key={k} className={classes.field}>
                  {t(fieldKey[k])}
                  <select
                    value={mapping[k] === undefined ? "" : String(mapping[k])}
                    onChange={(e) => setMapping((m) => ({ ...m, [k]: e.target.value === "" ? undefined : Number(e.target.value) }))}
                  >
                    <option value="">—</option>
                    {asArray<string>(preview.headers).map((h, i) => (
                      <option key={i} value={i}>
                        {h || `#${i + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    {preview.headers.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r, i) => (
                    <tr key={i}>
                      {preview.headers.map((_, j) => (
                        <td key={j} className={classes.wrap}>
                          {r[j] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TagPicker title={t("crmImportTags")} value={tags} onChange={setTags} />
            <label className={crm.check}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              {t("crmImportConsent")}
            </label>
            <div className={classes.actions}>
              <button type="button" className={classes.ghost} onClick={() => setPreview(null)}>
                {t("bizPrev")}
              </button>
              <button type="button" className={classes.primary} disabled={busy || !consent || mapping.phone === undefined} onClick={run}>
                {t("crmImportRun")}
              </button>
            </div>
          </>
        )}
      </div>
    </PopupCard>
  );
};

export default CrmImport;
