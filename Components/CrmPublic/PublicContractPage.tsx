"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import classes from "./CrmPublic.module.css";
import SignaturePad from "./SignaturePad";
import { errorOf, usePublicFormat, usePublicText } from "./publicShared";

type PublicContract = {
  org: string;
  number: number;
  subject: string;
  party?: string;
  value: number;
  startDate: string;
  endDate?: string;
  content?: string;
  signed: boolean;
  signerName?: string;
  signedAt?: string;
  state: string;
};

// A contract sent to the other side to sign (/ct/<token>, Nexxa /ct/[id]):
// the text, then a name and a drawn signature; signing a draft makes it
// active.
const PublicContractPage = ({ token }: { token: string }) => {
  const t = usePublicText();
  const f = usePublicFormat();
  const valid = /^[A-Za-z0-9_-]{8,20}$/.test(token);
  const { data, error, mutate } = useSWR<PublicContract | null>(valid ? `${API}/public/crm/contract/${token}` : null, (url: string) => fetcher({ url }).then((res) => (res.data as PublicContract) || null));
  const [name, setName] = useState("");
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const sign = async () => {
    setBusy(true);
    setErr("");
    try {
      await fetcher({ url: `${API}/public/crm/contract/${token}/sign`, method: "POST", bodyParser: "JSON", payload: { name, signature } });
      mutate();
    } catch (x) {
      setErr(errorOf(x));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className={classes.main}>
      <section className={classes.card}>
        {!valid || error ? (
          <p className={classes.text}>{t("crmsPubContractInvalid")}</p>
        ) : !data ? (
          <p className={classes.text}>…</p>
        ) : (
          <>
            <div className={classes.meta}>
              <h1 className={classes.title}>{data.org}</h1>
              <span>
                {t("crmsPubContractN", [f.money(data.number)])} · {data.subject}
              </span>
              <span>
                {data.party ? `${data.party} · ` : ""}
                {f.date(data.startDate)}
                {data.endDate ? ` – ${f.date(data.endDate)}` : ""}
              </span>
              {data.value > 0 && (
                <span>
                  {t("crmsPubAmount")}: {f.money(data.value)} {t("toman")}
                </span>
              )}
            </div>
            {data.content && <p className={classes.text}>{data.content}</p>}
            {data.signed ? (
              <p className={classes.ok}>{t("crmsPubSigned", [data.signerName || "", f.date(data.signedAt)])}</p>
            ) : (
              <>
                <label className={classes.field}>
                  {t("crmsPubYourName")}
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </label>
                <SignaturePad onChange={setSignature} label={t("crmsPubSignHere")} clearLabel={t("crmsPubClear")} />
                {err && <p className={classes.error}>{err}</p>}
                <div className={classes.actions}>
                  <button type="button" className={classes.primary} disabled={busy || name.trim().length < 2 || !signature} onClick={sign}>
                    {t("crmsPubSign")}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default PublicContractPage;
