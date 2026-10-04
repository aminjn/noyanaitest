"use client";

import { useEffect, useRef, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { useBizFormat } from "../bizShared";
import { smsCount, smsVars, useCrm, useCrmText } from "./crmShared";

const varKey: Record<(typeof smsVars)[number], string> = {
  name: "crmVarName",
  firstName: "crmVarFirstName",
  org: "crmVarOrg",
  link: "crmVarLink",
  review: "crmVarReview",
  lastVisit: "crmVarLastVisit",
};

// The SMS text box of a template or a campaign (2026-10): the variables as
// chips that insert at the cursor, and the count a recipient's message
// really takes - the text filled with a sample patient, the tracked link
// and the «لغو۱۱» opt-out line - in characters and SMS parts (70 a part in
// Persian, 67 each when split), with the phone-shaped preview.
const SmsTextField = ({
  value,
  onChange,
  label,
  showPreview = true,
}: {
  value: string;
  onChange: (v: string) => unknown;
  label: string;
  showPreview?: boolean;
}) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api } = useCrm();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState<{ preview: string; chars: number; parts: number } | null>(null);
  useEffect(() => {
    const h = setTimeout(() => {
      if (!value.trim()) return setPreview(null);
      fetcher({ url: `${API}${api}/templates/preview`, method: "POST", payload: { text: value } })
        .then((res) => setPreview(res.data as { preview: string; chars: number; parts: number }))
        .catch(() => setPreview(null));
    }, 400);
    return () => clearTimeout(h);
  }, [api, value]);
  const insert = (v: string) => {
    const el = ref.current;
    const token = `{${v}}`;
    if (!el) return onChange(value + token);
    const s = el.selectionStart ?? value.length;
    const e = el.selectionEnd ?? value.length;
    onChange(value.slice(0, s) + token + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + token.length, s + token.length);
    });
  };
  const local = smsCount(preview?.preview || value);
  return (
    <div className={crm.smsField}>
      <label className={classes.field}>
        {label}
        <textarea ref={ref} className={crm.smsText} value={value} onChange={(e) => onChange(e.target.value)} maxLength={700} dir="auto" />
      </label>
      <div className={crm.chips} role="group" aria-label={t("crmVars")}>
        <span className={classes.muted}>{t("crmVars")}:</span>
        {smsVars.map((v) => (
          <button key={v} type="button" className={crm.chip} onClick={() => insert(v)} title={`{${v}}`}>
            {t(varKey[v])}
          </button>
        ))}
      </div>
      <div className={crm.counter}>
        <span>{t("crmCharsLine", [f.money(local.len), f.money(local.parts)])}</span>
        {local.parts > 1 && <span className={crm.counterWarn}>{t("crmPartsCost", [f.money(local.parts)])}</span>}
        {!local.ucs && local.len > 0 && <span className={classes.muted}>{t("crmLatinHint")}</span>}
      </div>
      {showPreview && (
        <div className={crm.phone}>
          <pre className={crm.bubble} dir="auto">
            {preview?.preview || t("crmPreviewEmpty")}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SmsTextField;
