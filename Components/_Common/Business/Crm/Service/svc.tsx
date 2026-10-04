"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher, FetchMethod } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import { useIntlLocale } from "@/Components/i18n/navigation";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { asArray } from "../../bizShared";
import { CrmContact, CrmTeamMember, errText, phoneText, useCrm, useCrmTeam, useCrmText } from "../crmShared";

// Shared bits of the CRM's engagement and service pages (2026-10,
// docs/nexxa-crm-engagement-parity.md): the API calls with their success /
// error notices, what waits for the viewer, a patient search field, the
// team as select options, and small view helpers. The backend is
// Controllers/crmServiceController.ts and crmWorkController.ts.

export { useCrm, useCrmText, errText, phoneText, asArray };

export type Ref = { _id: string; name?: string; phone?: string } | null | undefined;

// one call: a notice on success (when `saved` is given) or on error;
// resolves to the response's data, or undefined when it failed
export const useCall = () => {
  const { api } = useCrm();
  const t = useCrmText();
  const push = useNotification();
  return useCallback(
    async <T = unknown,>(method: FetchMethod, path: string, payload?: Record<string, unknown>, saved: string | false = "bizSaved"): Promise<T | undefined> => {
      try {
        const res = await fetcher({ url: `${API}${api}${path}`, method, ...(payload ? { payload, bodyParser: "JSON" } : {}) });
        if (saved) push(t(saved), "Success");
        return res?.data as T;
      } catch (err) {
        push(errText(err), "Error");
        return undefined;
      }
    },
    [api, push, t],
  );
};

// a GET under the panel's CRM, its data guarded to the expected shape
export const useGet = <T,>(path: string | null, parse: (d: unknown) => T) => {
  const { api } = useCrm();
  return useSWR<T>(path === null ? null : `${API}${api}${path}`, (url: string) => fetcher({ url }).then((res) => parse(res?.data)));
};
export const listOf = <T,>(d: unknown) => asArray<T>(d);

export type Mine = { user: string; isOwner: boolean; inbox: number; quizzesDue: number; goods: boolean };
export const useMine = () => useGet<Mine | null>("/service/mine", (d) => (d && typeof d === "object" ? (d as Mine) : null));

// the team as <option>s
export const TeamOptions = ({ none }: { none?: string }) => {
  const t = useCrmText();
  const { data } = useCrmTeam();
  return (
    <>
      {none !== undefined && <option value="">{t(none)}</option>}
      {asArray<CrmTeamMember>(data).map((m) => (
        <option key={m._id} value={m._id}>
          {m.name || "—"} · {t(m.role === "owner" ? "crmRoleOwner" : "crmRoleSecretary")}
        </option>
      ))}
    </>
  );
};
export const useTeamName = () => {
  const { data } = useCrmTeam();
  return useCallback((id?: string | null) => asArray<CrmTeamMember>(data).find((m) => m._id === id)?.name || "", [data]);
};

// search the panel's patients by name or number; the pick is shown with a
// way to clear it
export const ContactField = ({ value, onChange, label }: { value: Ref; onChange: (c: Ref) => void; label?: string }) => {
  const t = useCrmText();
  const { api } = useCrm();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<CrmContact[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const h = setTimeout(() => {
      fetcher({ url: `${API}${api}/contacts?limit=8&q=${encodeURIComponent(q.trim())}` })
        .then((res) => setRows(asArray<CrmContact>(res?.data?.items)))
        .catch(() => setRows([]));
    }, 300);
    return () => clearTimeout(h);
  }, [api, q, open]);
  return (
    <div className={classes.field}>
      <span>{t(label || "crmPickContact")}</span>
      {value ? (
        <span className={s.picked}>
          <span>{value.name || "—"}</span>
          {!!value.phone && (
            <bdi dir="ltr" className={classes.muted}>
              {phoneText(value.phone)}
            </bdi>
          )}
          <button type="button" className={crm.linkButton} onClick={() => onChange(null)}>
            {t("crmeChange")}
          </button>
        </span>
      ) : (
        <div className={s.search}>
          <input value={q} placeholder={t("crmSearch")} onFocus={() => setOpen(true)} onChange={(e) => setQ(e.target.value)} />
          {open && rows.length > 0 && (
            <ul className={s.searchList}>
              {rows.map((c) => (
                <li key={c._id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ _id: c._id, name: c.name, phone: c.phone });
                      setOpen(false);
                      setQ("");
                    }}
                  >
                    <span>{c.name || "—"}</span>
                    <bdi dir="ltr" className={classes.muted}>
                      {phoneText(c.phone)}
                    </bdi>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// a date-time in the reader's language
export const useWhen = () => {
  const tag = useIntlLocale();
  return useMemo(() => {
    const dt = new Intl.DateTimeFormat(tag, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" });
    const time = new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Tehran" });
    const num = new Intl.NumberFormat(tag, { maximumFractionDigits: 2 });
    const ok = (v?: string | Date | null) => {
      const d = v ? new Date(v) : null;
      return d && !Number.isNaN(d.getTime()) ? d : null;
    };
    return {
      at: (v?: string | Date | null) => (ok(v) ? dt.format(ok(v)!) : "—"),
      time: (v?: string | Date | null) => (ok(v) ? time.format(ok(v)!) : ""),
      num: (n?: number | null) => num.format(Number(n) || 0),
    };
  }, [tag]);
};

// a status as a badge: ok / warn / bad / muted tones
export const Badge = ({ tone, children }: { tone?: "ok" | "warn" | "bad" | "muted"; children: ReactNode }) => (
  <span className={`${classes.badge} ${tone === "ok" ? crm.badgeOk : tone === "warn" ? crm.badgeWarn : tone === "bad" ? crm.badgeBad : tone === "muted" ? crm.badgeMuted : ""}`}>
    {children}
  </span>
);

// a button that asks once more before doing it
export const ConfirmButton = ({ onConfirm, children, className, disabled }: { onConfirm: () => unknown; children: ReactNode; className?: string; disabled?: boolean }) => {
  const t = useCrmText();
  const [ask, setAsk] = useState(false);
  if (!ask)
    return (
      <button type="button" className={className || classes.ghost} disabled={disabled} onClick={() => setAsk(true)}>
        {children}
      </button>
    );
  return (
    <span className={s.confirm}>
      <span>{t("crmeSure")}</span>
      <button
        type="button"
        className={crm.linkDanger}
        onClick={() => {
          setAsk(false);
          onConfirm();
        }}
      >
        {t("yes")}
      </button>
      <button type="button" className={crm.linkButton} onClick={() => setAsk(false)}>
        {t("no")}
      </button>
    </span>
  );
};

// "YYYY-MM-DD" of a date in Tehran (an <input type=date> value)
export const dayOf = (v?: string | Date | null) => {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
};
