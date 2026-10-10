"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useCallback, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import { useIntlLocale, useRouter } from "@/Components/i18n/navigation";
import { ContentKey } from "@/Components/Enums/contentKeys";
import classes from "@/Components/_Common/Business/Accounting.module.css";
import s from "@/Components/_Common/Business/Crm/Service/Service.module.css";
import { asArray } from "@/Components/_Common/Business/bizShared";
import { CATEGORIES, categoryKey } from "@/Components/_Common/Business/Crm/Service/CrmTickets";
import { MY_CRM_NS } from "./MyClubsPage";
import { LINKS_KEY, LinkOffers, MyConsentHistory, MyLinks } from "./LinkOffers";

// «پیام به مراکز درمانی» (2026-10): the patient's requests and complaints
// to the centres they are a patient of, answered by the centre's team
// (Models/BizTicket.ts; the team's internal notes are never shown here).
// Noyan's own support stays at /dashboard/support.

type Centre = { ownerKind: string; ownerId: string; name: string };
type Ticket = {
  _id: string;
  number: number;
  subject: string;
  category: (typeof CATEGORIES)[number];
  status: "open" | "pending" | "resolved" | "closed";
  centre: string;
  lastMessageAt: string;
  messages?: { _id: string; body: string; fromPatient: boolean; at: string }[];
};

// the status in the patient's words: the team's "waiting on the patient"
// is, to them, "answered"
const myStatusKey: Record<Ticket["status"], string> = { open: "crmeMyTkOpen", pending: "crmeMyTkPending", resolved: "crmeTkResolved", closed: "crmeTkClosed" };
const statusText = (st: string) => myStatusKey[st as Ticket["status"]] || "crmeMyTkOpen";

const useT = () => {
  const getContent = useScopedLocale(MY_CRM_NS);
  return useCallback((k: string, v?: string[]) => getContent(k as ContentKey, v), [getContent]);
};
const useAt = () => {
  const tag = useIntlLocale();
  return (v?: string) => (v ? new Intl.DateTimeFormat(tag, { timeZone: TEHRAN_TZ, dateStyle: "medium", timeStyle: "short" }).format(new Date(v)) : "");
};

// a request number in the reader's digits
const useNum = () => {
  const tag = useIntlLocale();
  return (v?: number) => (typeof v === "number" ? new Intl.NumberFormat(tag, { useGrouping: false }).format(v) : "");
};

const post = async (url: string, payload: Record<string, unknown>) => fetcher({ url: `${API}${url}`, method: "POST", bodyParser: "JSON", payload });

const NewRequest = ({ onDone }: { onDone: (id: string) => void }) => {
  const t = useT();
  const push = useNotification();
  const { data } = useSWR<Centre[]>(`${API}/user/crm/centres`, (url: string) => fetcher({ url }).then((r) => asArray<Centre>(r?.data)));
  const [centre, setCentre] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("question");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const send = async () => {
    const [kind, id] = centre.split(":");
    try {
      const r = await post(`/user/crm/centres/${kind}/${id}/tickets`, { subject, body, category });
      push(t("bizSaved"), "Success");
      onDone(r?.data?._id);
    } catch (err) {
      push((err as Error)?.message || String(err), "Error");
    }
  };
  return (
    <section className={classes.card}>
      <h2 className={classes.cardTitle}>{t("crmeNewRequest")}</h2>
      {!asArray(data).length ? (
        <p className={classes.empty}>{t("crmeNoCentres")}</p>
      ) : (
        <div className={s.stepFields}>
          <label className={classes.field}>
            {t("crmeCentre")}
            <select value={centre} onChange={(e) => setCentre(e.target.value)}>
              <option value="">—</option>
              {asArray<Centre>(data).map((c) => (
                <option key={`${c.ownerKind}:${c.ownerId}`} value={`${c.ownerKind}:${c.ownerId}`}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmeCategory")}
            <select value={category} onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(categoryKey[c])}
                </option>
              ))}
            </select>
          </label>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeSubject")}
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
          </label>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeMessage")}
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} />
          </label>
          <div className={s.wideField}>
            <button type="button" className={classes.primary} disabled={!centre || subject.trim().length < 2 || body.trim().length < 2} onClick={send}>
              {t("crmeSendRequest")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

const Thread = ({ id }: { id: string }) => {
  const t = useT();
  const at = useAt();
  const num = useNum();
  const push = useNotification();
  const { data, error, mutate } = useSWR<Ticket | null>(`${API}/user/crm/tickets/${id}`, (url: string) => fetcher({ url }).then((r) => (r?.data && typeof r.data === "object" ? (r.data as Ticket) : null)));
  const [body, setBody] = useState("");
  const act = async (url: string, payload: Record<string, unknown>) => {
    try {
      await post(url, payload);
      setBody("");
      mutate();
    } catch (err) {
      push((err as Error)?.message || String(err), "Error");
    }
  };
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <div className={s.stack}>
              <Link href="/dashboard/centres">{t("back")}</Link>
              <h2 className={classes.cardTitle}>
                <bdi>#{num(data.number)}</bdi> · {data.subject}
              </h2>
              <span className={classes.muted}>
                {data.centre} · {t(statusText(data.status))}
              </span>
            </div>
            {data.status !== "closed" && (
              <button type="button" className={classes.ghost} onClick={() => act(`/user/crm/tickets/${id}/close`, {})}>
                {t("crmeCloseRequest")}
              </button>
            )}
          </div>
          <div className={s.thread}>
            {asArray<NonNullable<Ticket["messages"]>[number]>(data.messages).map((m) => (
              <div key={m._id} className={`${s.msg} ${m.fromPatient ? s.msgMine : ""}`}>
                {m.body}
                <span className={s.msgMeta}>
                  {m.fromPatient ? t("crmeYou") : data.centre} · {at(m.at)}
                </span>
              </div>
            ))}
          </div>
          {data.status !== "closed" && (
            <div className={s.stack}>
              <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} placeholder={t("crmeReplyPlaceholder")} />
              <div className={s.row}>
                <button type="button" className={classes.primary} disabled={!body.trim()} onClick={() => act(`/user/crm/tickets/${id}/reply`, { body })}>
                  {t("crmeSendReply")}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </HandleLoading>
  );
};

const MyCentresPage = ({ id }: { id?: string }) => {
  const t = useT();
  const at = useAt();
  const num = useNum();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  useBreadCrump([
    { title: t("dashboard"), target: "/dashboard" },
    { title: t("crmeMyCentres"), target: "/dashboard/centres" },
  ]);
  const { data, error, mutate } = useSWR<(Ticket & { lastFromPatient?: boolean })[]>(id ? null : `${API}/user/crm/tickets`, (url: string) =>
    fetcher({ url }).then((r) => asArray<Ticket & { lastFromPatient?: boolean }>(r?.data)),
  );
  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <h1 className={classes.title}>{t("crmeMyCentres")}</h1>
        <span className={classes.subtitle}>{t("crmeMyCentresHint")}</span>
      </header>
      {id ? (
        <Thread id={id} />
      ) : (
        <>
          {/* centres that added the patient themselves: linked only on «وصل شود» */}
          <LinkOffers
            onChanged={() => {
              globalMutate(`${API}/user/crm/centres`);
              globalMutate(LINKS_KEY);
            }}
          />
          <NewRequest
            onDone={(nid) => {
              mutate();
              if (nid) router.push(`/dashboard/centres/${nid}`);
            }}
          />
          <section className={classes.card}>
            <h2 className={classes.cardTitle}>{t("crmeMyRequests")}</h2>
            <HandleLoading data={!!data} error={error}>
              {!asArray(data).length ? (
                <p className={classes.empty}>{t("crmeNoRequests")}</p>
              ) : (
                <ul className={s.items}>
                  {asArray<Ticket & { lastFromPatient?: boolean }>(data).map((k) => (
                    <li key={k._id} className={s.item}>
                      <Link href={`/dashboard/centres/${k._id}`} className={s.itemTitle}>
                        <bdi>#{num(k.number)}</bdi> · {k.subject}
                      </Link>
                      <span className={classes.muted}>{k.centre}</span>
                      <span className={classes.badge}>{t(statusText(k.status))}</span>
                      {!k.lastFromPatient && k.status !== "closed" && <span className={classes.badge}>{t("crmeNewAnswer")}</span>}
                      <span className={classes.muted}>{at(k.lastMessageAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </HandleLoading>
          </section>
          <MyLinks />
          <MyConsentHistory />
        </>
      )}
    </div>
  );
};

export default MyCentresPage;
