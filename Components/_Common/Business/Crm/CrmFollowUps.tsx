"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { phoneText, useCrm, useCrmText } from "./crmShared";

type FollowUp = { _id: string; text: string; dueAt: string; contact: { _id: string; name?: string; phone: string } | null };

// The follow-ups still open ("call in six months for the check-up"), the
// due ones first; marking one done takes it off the list.
const CrmFollowUps = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api, canWrite } = useCrm();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState("");
  const { data, error, mutate } = useSWR<FollowUp[]>(`${API}${api}/followups`, (url: string) =>
    fetcher({ url }).then((res) => asArray<FollowUp>(res.data)),
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const done = async (id: string) => {
    if (busy) return;
    setBusy(id);
    try {
      await fetcher({ url: `${API}${api}/activities/${id}`, method: "PATCH", payload: { done: true } });
      pushNotification(t("crmDone"), "Success");
      mutate();
      onChanged();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy("");
    }
  };
  const now = Date.now();
  const rows = asArray<FollowUp>(data);
  return (
    <section className={classes.card}>
      <span className={classes.cardTitle}>{t("crmTabFollowUps")}</span>
      <p className={classes.muted}>{t("crmFollowUpsHint")}</p>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (rows.length === 0 ? (
            <p className={classes.empty}>{t("crmNoFollowUps")}</p>
          ) : (
            <ul className={crm.followUps}>
              {rows.map((r) => {
                const overdue = new Date(r.dueAt).getTime() < now;
                return (
                  <li key={r._id} className={`${crm.followUp} ${overdue ? crm.overdue : ""}`}>
                    <div className={crm.fuMain}>
                      <span className={crm.fuText}>{r.text}</span>
                      <span className={classes.muted}>
                        {r.contact?.name || "—"} · <bdi dir="ltr">{phoneText(r.contact?.phone || "")}</bdi>
                      </span>
                    </div>
                    <span className={`${classes.badge} ${overdue ? crm.badgeWarn : ""}`}>{f.date(r.dueAt)}</span>
                    {canWrite && (
                      <button type="button" className={classes.ghost} disabled={busy === r._id} onClick={() => done(r._id)}>
                        {t("crmMarkDone")}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
      </HandleLoading>
    </section>
  );
};

export default CrmFollowUps;
