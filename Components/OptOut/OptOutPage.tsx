"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import classes from "./OptOutPage.module.css";

type Info = { name: string; optedOut: boolean; all: boolean };

// The opt-out link at the end of every campaign SMS (2026-10, backend
// Lib/business/campaign.ts): no sign-in, one tap - from this centre only,
// or from every centre on Noyan. Both are kept for good; the operators'
// *800# block works on top of it.
const OptOutPage = ({ code }: { code: string }) => {
  const t = useScopedLocale(["common", "bizCrm"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { data, error: loadError, mutate } = useSWR<Info | null>(
    /^[A-Za-z0-9_-]{6,12}$/.test(code) ? `${API}/public/sms-optout/${code}` : null,
    (url: string) => fetcher({ url }).then((res) => (res.data as Info) || null),
  );
  const optOut = async (scope: "owner" | "all") => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetcher({ url: `${API}/public/sms-optout/${code}`, method: "POST", payload: { scope } });
      mutate(res.data as Info, false);
    } catch (err) {
      setError((err as Error)?.message || String(err));
    } finally {
      setBusy(false);
    }
  };
  const invalid = !/^[A-Za-z0-9_-]{6,12}$/.test(code) || !!loadError;
  return (
    <main className={classes.main}>
      <section className={classes.card}>
        <h1 className={classes.title}>{t("optTitle")}</h1>
        {invalid ? (
          <p className={classes.text}>{t("optInvalid")}</p>
        ) : !data ? (
          <p className={classes.text}>…</p>
        ) : data.all ? (
          <p className={classes.done}>{t("optDoneAll")}</p>
        ) : data.optedOut ? (
          <>
            <p className={classes.done}>{t("optDoneOwner", [data.name])}</p>
            <button type="button" className={classes.secondary} disabled={busy} onClick={() => optOut("all")}>
              {t("optAll")}
            </button>
          </>
        ) : (
          <>
            <p className={classes.text}>{t("optIntro", [data.name])}</p>
            <button type="button" className={classes.primary} disabled={busy} onClick={() => optOut("owner")}>
              {t("optOwner", [data.name])}
            </button>
            <button type="button" className={classes.secondary} disabled={busy} onClick={() => optOut("all")}>
              {t("optAll")}
            </button>
          </>
        )}
        {!!error && <p className={classes.error}>{error}</p>}
        <p className={classes.note}>{t("optNote")}</p>
      </section>
    </main>
  );
};

export default OptOutPage;
