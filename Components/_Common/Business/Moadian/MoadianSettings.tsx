"use client";

import { useEffect, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import classes from "../Accounting.module.css";
import moa from "./Moadian.module.css";
import { useBizFormat } from "../bizShared";
import { kindKey, latin, MoadianItemKind, MoadianSettings, useMoadian, useMoadianText } from "./moadianShared";

// The link to the Moadian system, in the order a taxpayer sets it up:
// who they are, the signing key Noyan makes (its public half goes into the
// Moadian portal, which gives back the memory id), the goods and service
// ids each kind of line is invoiced as, and the switch that starts sending.
const MoadianSettingsTab = ({ settings, onChanged }: { settings?: MoadianSettings; onChanged: () => unknown }) => {
  const t = useMoadianText();
  const f = useBizFormat();
  const { api, canWrite, platform } = useMoadian();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    taxpayerType: "legal" as MoadianSettings["taxpayerType"],
    name: "",
    economicCode: "",
    postalCode: "",
    memoryId: "",
    env: "production" as MoadianSettings["env"],
    unit: "1627",
    vatPercent: "10",
    certificate: "",
    sstid: {} as Partial<Record<MoadianItemKind, string>>,
  });
  useEffect(() => {
    if (!settings) return;
    setForm({
      taxpayerType: settings.taxpayerType,
      name: settings.name || "",
      economicCode: settings.economicCode || "",
      postalCode: settings.postalCode || "",
      memoryId: settings.memoryId || "",
      env: settings.env,
      unit: settings.unit || "1627",
      vatPercent: String(settings.vatPercent ?? 10),
      certificate: settings.certificate || "",
      sstid: { ...(settings.sstid || {}) },
    });
  }, [settings]);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));

  const call = async (url: string, method: "POST" | "PATCH", payload: { [key: string]: unknown }, ok: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}${url}`, method, payload });
      pushNotification(ok, "Success");
      onChanged();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  const save = () =>
    call(
      "/settings",
      "PATCH",
      {
        taxpayerType: form.taxpayerType,
        name: form.name.trim(),
        economicCode: latin(form.economicCode).trim(),
        postalCode: latin(form.postalCode).trim(),
        memoryId: form.memoryId.trim(),
        env: form.env,
        unit: latin(form.unit).trim(),
        certificate: form.certificate.trim(),
        sstid: Object.fromEntries((settings?.itemKinds || []).map((k) => [k, latin(form.sstid[k] || "").trim()])),
        ...(platform ? { vatPercent: Math.max(0, Math.min(100, Number(latin(form.vatPercent)) || 0)) } : {}),
      },
      t("bizSaved"),
    );

  const makeKey = (replace: boolean) => {
    if (replace && !window.confirm(t("moaKeyReplaceConfirm"))) return;
    return call("/settings/key", "POST", { replace }, t("moaKeyMade"));
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      pushNotification(t("moaCopied"), "Success");
    } catch {
      pushNotification(t("moaCopyFailed"), "Error");
    }
  };

  const download = (text: string, name: string) => {
    const url = URL.createObjectURL(new Blob([text], { type: "application/pkcs10" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!settings) return null;
  const s = settings;
  const disabled = !canWrite || busy;
  return (
    <div className={moa.steps}>
      <section className={classes.card}>
        <div className={moa.stepHead}>
          <span className={moa.stepNo}>{f.money(1)}</span>
          <span className={classes.cardTitle}>{t("moaStepTaxpayer")}</span>
        </div>
        <div className={classes.form}>
          <label className={classes.field}>
            {t("moaTaxpayerType")}
            <select value={form.taxpayerType} disabled={disabled} onChange={(e) => set("taxpayerType", e.target.value as MoadianSettings["taxpayerType"])}>
              <option value="natural">{t("moaNatural")}</option>
              <option value="legal">{t("moaLegal")}</option>
            </select>
          </label>
          <label className={classes.field}>
            {t("moaName")}
            <input value={form.name} disabled={disabled} maxLength={200} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className={classes.field}>
            {t(form.taxpayerType === "natural" ? "moaNationalCode" : "moaLegalCode")}
            <input
              className={moa.ltr}
              dir="ltr"
              inputMode="numeric"
              value={form.economicCode}
              disabled={disabled}
              maxLength={14}
              onChange={(e) => set("economicCode", e.target.value)}
            />
          </label>
          <label className={classes.field}>
            {t("moaPostalCode")}
            <input className={moa.ltr} dir="ltr" inputMode="numeric" value={form.postalCode} disabled={disabled} maxLength={10} onChange={(e) => set("postalCode", e.target.value)} />
          </label>
          <label className={classes.field}>
            {t("moaEnv")}
            <select value={form.env} disabled={disabled || s.isActive} onChange={(e) => set("env", e.target.value as MoadianSettings["env"])}>
              <option value="production">{t("moaEnvProduction")}</option>
              <option value="sandbox">{t("moaEnvSandbox")}</option>
            </select>
          </label>
        </div>
      </section>

      <section className={classes.card}>
        <div className={moa.stepHead}>
          <span className={moa.stepNo}>{f.money(2)}</span>
          <span className={classes.cardTitle}>{t("moaStepKey")}</span>
        </div>
        {!s.hasKey ? (
          <>
            <p className={classes.muted}>{t("moaKeyIntro")}</p>
            {canWrite && (
              <div className={classes.actions}>
                <button type="button" className={classes.primary} disabled={busy} onClick={() => makeKey(false)}>
                  {t("moaMakeKey")}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <ol className={moa.howto}>
              <li>{t("moaHow1")}</li>
              <li>{t("moaHow2")}</li>
              <li>{t("moaHow3")}</li>
              <li>{t("moaHow4")}</li>
            </ol>
            <label className={classes.field}>
              {t("moaPublicKey")}
              <textarea className={moa.key} dir="ltr" readOnly value={s.publicKey} rows={4} />
            </label>
            <div className={classes.actions}>
              <button type="button" className={classes.ghost} onClick={() => copy(s.publicKey)}>
                {t("moaCopyKey")}
              </button>
              {!!s.csr && (
                <button type="button" className={classes.ghost} onClick={() => download(s.csr, "noyan-moadian.csr")}>
                  {t("moaDownloadCsr")}
                </button>
              )}
              {canWrite && !s.isActive && (
                <button type="button" className={classes.ghost} disabled={busy} onClick={() => makeKey(true)}>
                  {t("moaReplaceKey")}
                </button>
              )}
            </div>
            <span className={classes.muted}>{t("moaKeyMadeAt", [f.date(s.keyCreatedAt)])}</span>
            <details className={moa.more}>
              <summary>{t("moaCertificate")}</summary>
              <p className={classes.muted}>{t("moaCertificateHint")}</p>
              <textarea
                className={moa.key}
                dir="ltr"
                rows={4}
                value={form.certificate}
                disabled={disabled}
                onChange={(e) => set("certificate", e.target.value)}
              />
            </details>
          </>
        )}
        <label className={`${classes.field} ${moa.memory}`}>
          {t("moaMemoryId")}
          <input
            className={moa.ltr}
            dir="ltr"
            value={form.memoryId}
            maxLength={6}
            disabled={disabled || s.isActive}
            placeholder="A1B2C3"
            onChange={(e) => set("memoryId", e.target.value.toUpperCase())}
          />
        </label>
      </section>

      <section className={classes.card}>
        <div className={moa.stepHead}>
          <span className={moa.stepNo}>{f.money(3)}</span>
          <span className={classes.cardTitle}>{t("moaStepItems")}</span>
        </div>
        <p className={classes.muted}>{t(platform ? "moaItemsHintPlatform" : "moaItemsHint")}</p>
        <div className={classes.form}>
          {s.itemKinds.map((k) => (
            <label key={k} className={classes.field}>
              {t(kindKey[k])}
              <input
                className={moa.ltr}
                dir="ltr"
                inputMode="numeric"
                maxLength={13}
                value={form.sstid[k] || ""}
                disabled={disabled}
                onChange={(e) => set("sstid", { ...form.sstid, [k]: e.target.value })}
              />
            </label>
          ))}
          <label className={classes.field}>
            {t("moaUnit")}
            <input className={moa.ltr} dir="ltr" inputMode="numeric" maxLength={8} value={form.unit} disabled={disabled} onChange={(e) => set("unit", e.target.value)} />
          </label>
          {platform && (
            <label className={classes.field}>
              {t("moaVatPercent")}
              <input className={moa.ltr} dir="ltr" inputMode="numeric" value={form.vatPercent} disabled={disabled} onChange={(e) => set("vatPercent", e.target.value)} />
            </label>
          )}
        </div>
        {canWrite && (
          <div className={classes.actions}>
            <button type="button" className={classes.primary} disabled={busy} onClick={save}>
              {t("bizSave")}
            </button>
          </div>
        )}
      </section>

      <section className={`${classes.card} ${s.isActive ? moa.onCard : ""}`}>
        <div className={moa.stepHead}>
          <span className={moa.stepNo}>{f.money(4)}</span>
          <span className={classes.cardTitle}>{t("moaStepSend")}</span>
          <span className={`${moa.badge} ${s.isActive ? moa.badgeOk : moa.badgeMuted}`}>{s.isActive ? t("moaLinkOn") : t("moaLinkOff")}</span>
        </div>
        <p className={classes.muted}>{t(platform ? "moaSendHintPlatform" : "moaSendHint")}</p>
        {s.isActive && <span className={classes.muted}>{t("moaActiveFrom", [f.date(s.activeFrom)])}</span>}
        {!s.isActive && s.problems.length > 0 && (
          <ul className={moa.problems}>
            {s.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
        {!!s.lastError && <p className={moa.error}>{t("moaLastError", [f.date(s.lastErrorAt), s.lastError])}</p>}
        {s.simulated && <p className={moa.note}>{t("moaSimulated")}</p>}
        {canWrite && (
          <div className={classes.actions}>
            {s.isActive ? (
              <button type="button" className={classes.ghost} disabled={busy} onClick={() => call("/settings/active", "POST", { on: false }, t("moaTurnedOff"))}>
                {t("moaTurnOff")}
              </button>
            ) : (
              <button
                type="button"
                className={classes.primary}
                disabled={busy || s.problems.length > 0}
                onClick={() => call("/settings/active", "POST", { on: true }, t("moaTurnedOn"))}
              >
                {t("moaTurnOn")}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default MoadianSettingsTab;
