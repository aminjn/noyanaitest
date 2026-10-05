"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import PopupCard from "@/Components/UI/PopupCard";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import classes from "@/Components/_Common/Business/Accounting.module.css";
import { asArray, useBizFormat } from "@/Components/_Common/Business/bizShared";
import l from "./LinkOffers.module.css";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const MY_CRM_NS: ContentNamespace[] = ["common", "bizCrm"];

// Patient-consented record linking (2026-10, backend
// Lib/business/crmService/link.ts). A centre that added the patient itself
// (by hand, a CSV import or its web form) is shown here as an offer: only
// the centre's name and kind, nothing of the record, until the patient
// says «وصل شود». «این من نیستم» ends the offer for good (the centre is told
// the number may be wrong); «بعداً» asks again in a week. Linked records
// can be unlinked from /dashboard/centres, and every step is in the
// patient's own consent history.

type Offer = { _id: string; ownerKind: string; ownerId: string; centre: string; offeredAt: string };
type LinkRow = {
  contact: string;
  offer?: string;
  ownerKind: string;
  ownerId: string;
  centre: string;
  status: "linked" | "unlinked";
  source: LinkSource;
  since?: string;
};
type LinkSource = "manual" | "csv" | "webform" | "visit";
type HistoryRow = {
  _id: string;
  at: string;
  action: "offered" | "linked" | "declined" | "dismissed-later" | "unlinked" | "withdrawn";
  actor: "patient" | "system";
  source: LinkSource;
  centre: string;
  ownerKind: string;
  phone: string;
};

const KIND_KEY: Record<string, string> = {
  doctor: "clkKind_doctor",
  clinic: "clkKind_clinic",
  hospital: "clkKind_hospital",
  pharmacy: "clkKind_pharmacy",
  paraClinic: "clkKind_paraClinic",
  insurance: "clkKind_insurance",
};
export const LINK_SOURCE_KEY: Record<LinkSource, string> = {
  manual: "clkSrc_manual",
  csv: "clkSrc_csv",
  webform: "clkSrc_webform",
  visit: "clkSrc_visit",
};
const ACTION_KEY: Record<HistoryRow["action"], string> = {
  offered: "clkAct_offered",
  linked: "clkAct_linked",
  declined: "clkAct_declined",
  "dismissed-later": "clkAct_later",
  unlinked: "clkAct_unlinked",
  withdrawn: "clkAct_withdrawn",
};

export const OFFERS_KEY = `${API}/user/crm/link-offers`;
export const LINKS_KEY = `${API}/user/crm/links`;
const HISTORY_KEY = `${API}/user/crm/consent-log`;

const useT = () => {
  const getContent = useScopedLocale(MY_CRM_NS);
  return useCallback((k: string, v?: string[]) => getContent(k as ContentKey, v), [getContent]);
};
const post = (url: string) => fetcher({ url: `${API}${url}`, method: "POST", bodyParser: "JSON", payload: {} });
const errText = (err: unknown) => (err as Error)?.message || String(err);

const ConfirmPopup = ({ id, title, message, onConfirm }: { id: string; title: string; message: string; onConfirm: () => Promise<unknown> }) => {
  const { closePopup } = usePopup();
  const [busy, setBusy] = useState(false);
  return (
    <PopupCard title={title}>
      <ConfirmationPopup
        message={message}
        isLoading={busy}
        onConfirm={async () => {
          setBusy(true);
          await onConfirm().finally(() => setBusy(false));
          closePopup(id);
        }}
      />
    </PopupCard>
  );
};

// the offers banner: on the dashboard home, «پیام به مراکز» and «باشگاه‌های من»
export const LinkOffers = ({ onChanged }: { onChanged?: () => unknown }) => {
  const t = useT();
  const f = useBizFormat();
  const push = useNotification();
  const { setPopup } = usePopup();
  const { data, mutate } = useSWR<Offer[]>(OFFERS_KEY, (url: string) => fetcher({ url }).then((r) => asArray<Offer>(r?.data)), {
    revalidateOnFocus: false,
  });
  const [busy, setBusy] = useState("");
  const offers = asArray<Offer>(data);
  if (!offers.length) return null;

  const act = async (o: Offer, action: "link" | "decline" | "later") => {
    setBusy(o._id);
    try {
      await post(`/user/crm/link-offers/${o._id}/${action}`);
      push(t(action === "link" ? "clkLinked" : action === "decline" ? "clkDeclined" : "clkSnoozed"), "Success");
      await mutate();
      onChanged?.();
    } catch (err) {
      push(errText(err), "Error");
      mutate();
    } finally {
      setBusy("");
    }
  };

  return (
    <section className={l.wrap} aria-label={t("clkOffersTitle")}>
      {offers.map((o) => (
        <article key={o._id} className={l.offer}>
          <div className={l.head}>
            <span className={l.centre}>{o.centre}</span>
            {!!KIND_KEY[o.ownerKind] && <span className={classes.badge}>{t(KIND_KEY[o.ownerKind])}</span>}
            <span className={classes.muted}>{f.date(o.offeredAt)}</span>
          </div>
          <p className={l.question}>{t("clkOfferText", [o.centre])}</p>
          <div className={l.shared}>
            <strong>{t("clkSharedTitle")}</strong>
            <ul>
              <li>{t("clkSharedYou")}</li>
              <li>{t("clkSharedCentre")}</li>
            </ul>
            <span className={classes.muted}>{t("clkSharedNothingElse")}</span>
            <span className={classes.muted}>{t("clkMatchedOn")}</span>
          </div>
          <div className={l.actions}>
            <button type="button" className={classes.primary} disabled={busy === o._id} onClick={() => act(o, "link")}>
              {t("clkLink")}
            </button>
            <button
              type="button"
              className={classes.ghost}
              disabled={busy === o._id}
              onClick={() =>
                setPopup(
                  "CrmLinkNotMe",
                  <ConfirmPopup id="CrmLinkNotMe" title={t("clkNotMe")} message={t("clkNotMeConfirm")} onConfirm={() => act(o, "decline")} />,
                )
              }
            >
              {t("clkNotMe")}
            </button>
            <button type="button" className={l.later} disabled={busy === o._id} onClick={() => act(o, "later")}>
              {t("clkLater")}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
};

// the patient's linked records (and unlinked ones, to link again)
export const MyLinks = () => {
  const t = useT();
  const f = useBizFormat();
  const push = useNotification();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useSWR<LinkRow[]>(LINKS_KEY, (url: string) => fetcher({ url }).then((r) => asArray<LinkRow>(r?.data)));
  const rows = asArray<LinkRow>(data);
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      push(t(ok), "Success");
    } catch (err) {
      push(errText(err), "Error");
    }
    mutate();
  };
  return (
    <section className={classes.card}>
      <h2 className={classes.cardTitle}>{t("clkLinksTitle")}</h2>
      <p className={classes.muted}>{t("clkLinksHint")}</p>
      {error && !data ? null : !rows.length ? (
        <p className={classes.empty}>{t("clkLinksEmpty")}</p>
      ) : (
        <ul className={l.list}>
          {rows.map((r) => (
            <li key={r.contact} className={l.row}>
              <div className={l.rowMain}>
                <span className={l.centre}>{r.centre}</span>
                <span className={l.meta}>
                  {!!KIND_KEY[r.ownerKind] && <span className={classes.badge}>{t(KIND_KEY[r.ownerKind])}</span>}
                  <span className={`${classes.badge} ${r.status === "linked" ? l.on : l.off}`}>{t(r.status === "linked" ? "clkStatusLinked" : "clkStatusUnlinked")}</span>
                  <span className={classes.muted}>
                    {t(LINK_SOURCE_KEY[r.source] || "clkSrc_manual")}
                    {r.since ? ` · ${t("clkSince", [f.date(r.since)])}` : ""}
                  </span>
                </span>
              </div>
              {r.status === "linked" ? (
                <button
                  type="button"
                  className={classes.ghost}
                  onClick={() =>
                    setPopup(
                      "CrmUnlink",
                      <ConfirmPopup
                        id="CrmUnlink"
                        title={t("clkUnlink")}
                        message={t("clkUnlinkConfirm", [r.centre])}
                        onConfirm={() => run(() => post(`/user/crm/links/${r.contact}/unlink`), "clkUnlinked")}
                      />,
                    )
                  }
                >
                  {t("clkUnlink")}
                </button>
              ) : (
                !!r.offer && (
                  <button type="button" className={classes.ghost} onClick={() => run(() => post(`/user/crm/link-offers/${r.offer}/link`), "clkLinked")}>
                    {t("clkRelink")}
                  </button>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

// the patient's own consent history, newest first (phone masked)
export const MyConsentHistory = () => {
  const t = useT();
  const tag = useIntlLocale();
  const at = (v?: string) => {
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? new Intl.DateTimeFormat(tag, { dateStyle: "medium", timeStyle: "short" }).format(d) : "—";
  };
  const [open, setOpen] = useState(false);
  const { data } = useSWR<HistoryRow[]>(open ? HISTORY_KEY : null, (url: string) => fetcher({ url }).then((r) => asArray<HistoryRow>(r?.data)));
  const rows = asArray<HistoryRow>(data);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <h2 className={classes.cardTitle}>{t("clkHistoryTitle")}</h2>
        <button type="button" className={classes.ghost} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {t(open ? "clkHide" : "clkShow")}
        </button>
      </div>
      <p className={classes.muted}>{t("clkHistoryHint")}</p>
      {open &&
        (!data ? null : !rows.length ? (
          <p className={classes.empty}>{t("clkHistoryEmpty")}</p>
        ) : (
          <ol className={l.list}>
            {rows.map((r) => (
              <li key={r._id} className={l.row}>
                <div className={l.rowMain}>
                  <span>
                    <strong>{t(ACTION_KEY[r.action] || "clkAct_offered")}</strong> · {r.centre}
                  </span>
                  <span className={classes.muted}>
                    {t(r.actor === "patient" ? "clkByYou" : "clkBySystem")} · {t(LINK_SOURCE_KEY[r.source] || "clkSrc_manual")} ·{" "}
                    <bdi dir="ltr">{r.phone}</bdi>
                  </span>
                </div>
                <span className={classes.muted}>{at(r.at)}</span>
              </li>
            ))}
          </ol>
        ))}
    </section>
  );
};
