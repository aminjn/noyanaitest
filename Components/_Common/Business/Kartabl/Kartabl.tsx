"use client";
import { flowArrow } from "@/Components/helpers/flowArrow";

import { ReactNode, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import usePopup from "@/Components/Hooks/usePopup";
import useAcl from "@/Components/Hooks/useAcl";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useNotification from "@/Components/Hooks/useNotification";
import PopupCard from "@/Components/UI/PopupCard";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import crm from "../Crm/Crm.module.css";
import { asArray, BizContext, useBizFormat } from "../bizShared";
import { ConfirmButton, errText, useAccText } from "../Acc/accShared";
import { CrmContext } from "../Crm/crmShared";
import { PROFILES, profileOf } from "../CrmSales/salesShared";
import { DiscountRequest } from "../CrmSales/SalesPlan";
import { CreditRequest, FINANCE_KINDS, FinanceKind, FinanceRequestForm, NEW_REQ, PickDiscountTarget } from "./KartablForms";

// The panel's one «کارتابل» (2026-10, backend Lib/business/kartabl.ts):
// everything that waits for a decision, in one list - the finance requests
// (petty cash, expense, payment, cheque, transfer, invoice), a return of an
// issued invoice, a treatment plan above the threshold, a discount, a credit
// limit, and a workflow's approval step. Doctolib Pro and Docplanner keep
// one "to approve" list per practice; NoyanAI had three (the finance desk,
// the CRM sales approvals, the CRM inbox). One-way actions: approve, reject
// with a reason, reopen a rejected one, cancel your own; «اجرا» applies an
// approved item whose effect could not run by itself (a closed year).

type Kind = FinanceKind | "plan" | "discount" | "credit" | "flow";
type Status = "pending" | "approved" | "rejected" | "cancelled" | "done";
type Item = {
  _id: string;
  kind: Kind;
  number: number;
  requester?: string;
  requesterName?: string;
  title?: string;
  detail?: string;
  amount: number;
  percent?: number;
  requestedLimit?: number;
  description?: string;
  status: Status;
  chain: string[];
  chainNames?: string[];
  level: number;
  decisions?: { name?: string; decision: "approved" | "rejected" | "reopened"; note?: string; at: string }[];
  decidedAt?: string;
  rejectReason?: string;
  partyName?: string;
  plan?: { _id: string; number: number; subject: string } | null;
  invoice?: { _id: string; number: number; total: number } | null;
  contact?: { _id: string; name?: string; phone?: string } | null;
  returnDoc?: { _id: string; number: number } | null;
  error?: string;
  myTurn?: boolean;
  createdAt: string;
};
type Data = {
  items: Item[];
  counts: { kind: Kind; status: Status; n: number }[];
  team: { _id: string; name: string; owner?: boolean }[];
  me: string;
  isOwner: boolean;
  can: { finance: boolean; crm: boolean; approveFinance: boolean; manageCrm: boolean };
  profile: string;
};

const ALL_KINDS: Kind[] = [...FINANCE_KINDS, "plan", "discount", "credit", "flow"];
const SALES_KINDS: Kind[] = ["plan", "discount", "credit"];
// the kinds this profile can have: the filter offers only those (an insurer
// files no returns; each profile's own sales approvals)
const kindsFor = (profile: string) =>
  ALL_KINDS.filter(
    (k) =>
      !SALES_KINDS.includes(k) || ((PROFILES as Record<string, { approvals: readonly string[] }>)[profile]?.approvals || SALES_KINDS).includes(k),
  ).filter((k) => !(profile === "insurance" && k === "return"));
const STATUSES: Status[] = ["pending", "approved", "done", "rejected", "cancelled"];
export const kindKey = (k: Kind) => (SALES_KINDS.includes(k) ? `crmsApKind_${k}` : k === "flow" ? "kartablKind_flow" : `accReq_${k}`);
const tone = (s: Status) => ({ pending: fin.toneInfo, approved: fin.toneWarn, done: fin.toneOk, rejected: fin.toneBad, cancelled: fin.toneMuted })[s] || fin.toneMuted;
const POPUP = "KartablDecide";

const pick = (d: unknown): Data => {
  const x = (d || {}) as Partial<Data>;
  return {
    // an item missing its chain is shown with none, not a crash
    items: asArray<Item>(x.items).map((r) => ({ ...r, chain: asArray<string>(r.chain), chainNames: asArray<string>(r.chainNames) })),
    counts: asArray<Data["counts"][number]>(x.counts),
    team: asArray<Data["team"][number]>(x.team),
    me: String(x.me || ""),
    isOwner: !!x.isOwner,
    can: { finance: false, crm: false, approveFinance: false, manageCrm: false, ...(x.can || {}) },
    profile: String(x.profile || ""),
  };
};

const RejectForm = ({ onDone }: { onDone: (note: string) => void }) => {
  const t = useAccText();
  const { closePopup } = usePopup();
  const [note, setNote] = useState("");
  return (
    <PopupCard title={t("accReject")}>
      <div className={classes.popup}>
        <label className={classes.field}>
          {t("crmeRejectReason")}
          <textarea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} autoFocus />
        </label>
        <p className={classes.muted}>{t("accRejectNeedsReason")}</p>
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.danger}
            disabled={!note.trim()}
            onClick={() => {
              closePopup(POPUP);
              onDone(note.trim());
            }}
          >
            {t("accReject")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// what may be filed from here: the finance kinds with the accounting module
// and finance access; a discount or credit with the CRM module, CRM writing
// access and a profile that has them
const NewRequestMenu = ({ kinds, onPick }: { kinds: Kind[]; onPick: (k: Kind) => void }) => {
  const t = useAccText();
  const { closePopup } = usePopup();
  return (
    <PopupCard title={t("accNewRequest")}>
      <div className={classes.popup}>
        <div className={classes.actions}>
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              className={classes.ghost}
              onClick={() => {
                closePopup(NEW_REQ);
                onPick(k);
              }}
            >
              {t(kindKey(k))}
            </button>
          ))}
        </div>
      </div>
    </PopupCard>
  );
};

const Kartabl = ({ node, panel }: { node: NodeWithAcl; panel: string }) => {
  const t = useAccText();
  const f = useBizFormat();
  const hasAccess = useAcl(node);
  const push = useNotification();
  const { setPopup } = usePopup();
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [kind, setKind] = useState<"" | Kind>("");
  const [status, setStatus] = useState<"" | Status>("");
  const [busy, setBusy] = useState("");
  useBreadCrump([
    { title: t("dashboard"), target: panel },
    { title: t("crmeNavInbox"), target: `${panel}/kartabl` },
  ]);
  // "mine": what waits for me (pending at my level, approved and mine to
  // apply); "all": everything I may see, in any state unless one is picked
  const q = new URLSearchParams({ scope, ...(kind ? { kind } : {}), ...(status ? { status } : scope === "all" ? { status: "any" } : {}) });
  const { data, error, mutate } = useSWR<Data>(`${API}/${node}/kartabl?${q}`, (url: string) => fetcher({ url }).then((res) => pick(res.data)), { keepPreviousData: true });
  const { data: modules } = useSWR<string[]>(`${API}/${node}/license/modules`, (url: string) =>
    fetcher({ url })
      .then((res) => asArray<string>(res.data))
      .catch(() => []),
  );
  const profile = profileOf(node);
  const can = data?.can;
  const fileable = useMemo<Kind[]>(() => {
    const mods = modules || [];
    const out: Kind[] = [];
    if (can?.finance && mods.includes("accounting")) out.push(...FINANCE_KINDS);
    if (can?.manageCrm && mods.includes("crm")) out.push(...(PROFILES[profile].approvals.filter((k) => k !== "plan") as Kind[]));
    return out;
  }, [modules, can, profile]);

  const bizCtx = { api: `/${node}/biz`, canWrite: hasAccess("manageAccounting"), canApprove: hasAccess("approveVouchers") };
  const crmCtx = { api: `/${node}/crm`, panel, node, canWrite: hasAccess("manageCrm"), canSend: hasAccess("sendCampaigns") };
  const withCtx = (n: ReactNode) => (
    <BizContext.Provider value={bizCtx}>
      <CrmContext.Provider value={crmCtx}>{n}</CrmContext.Provider>
    </BizContext.Provider>
  );
  const openForm = (k: Kind) => {
    const done = () => mutate();
    if (k === "credit") setPopup(NEW_REQ, withCtx(<CreditRequest onDone={done} />));
    else if (k === "discount")
      setPopup(NEW_REQ, withCtx(<PickDiscountTarget onPick={(target) => setPopup("CrmsPlanDiscount", withCtx(<DiscountRequest {...target} onDone={done} />))} />));
    else if ((FINANCE_KINDS as readonly string[]).includes(k)) setPopup("AccRequestForm", withCtx(<FinanceRequestForm kind={k as FinanceKind} onDone={done} />));
  };
  // ?new=<kind> opens its form (a "ask for credit" link elsewhere)
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("new") as Kind | null;
    if (k && fileable.includes(k)) openForm(k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileable.length]);

  const act = async (r: Item, path: string, payload: Record<string, unknown> = {}) => {
    setBusy(r._id);
    try {
      await fetcher({ url: `${API}/${node}/kartabl/${r._id}/${path}`, method: "POST", payload });
      push(t("bizSaved"), "Success");
      mutate();
    } catch (err) {
      push(errText(err), "Error");
    } finally {
      setBusy("");
    }
  };
  const nameOf = (r: Item, i: number) => data?.team.find((m) => m._id === r.chain[i])?.name || r.chainNames?.[i] || "—";
  const isMine = (r: Item) => !!data && (r.requester === data.me || data.isOwner);
  const canExecute = (r: Item) =>
    !!can && r.kind !== "flow" && ((FINANCE_KINDS as readonly string[]).includes(r.kind) && r.kind !== "return" ? can.approveFinance : r.kind === "return" ? can.approveFinance || can.manageCrm : can.manageCrm);
  const subject = (r: Item): ReactNode => {
    if (r.kind === "flow") return [r.title, r.detail].filter(Boolean).join(" · ") || "—";
    if (r.plan && typeof r.plan === "object")
      return (
        <Link href={`${panel}/crm/plans/${r.plan._id}`} className={crm.linkButton}>
          {t("crmsPlanN", [f.money(r.plan.number)])} · {r.plan.subject}
        </Link>
      );
    if (r.kind === "return" && r.returnDoc && typeof r.returnDoc === "object")
      return (
        <Link href={`${panel}/crm/returns`} className={crm.linkButton}>
          {t("crmeInFromReturn")} #{f.money(r.returnDoc.number)}
          {r.contact?.name ? ` · ${r.contact.name}` : ""}
        </Link>
      );
    if (r.invoice && typeof r.invoice === "object") return t("crmsInvoiceN", [f.money(r.invoice.number), f.money(r.invoice.total)]);
    return [r.contact?.name || r.contact?.phone, r.partyName, r.description].filter(Boolean).join(" · ") || "—";
  };
  const amountOf = (r: Item) => (r.kind === "credit" ? f.money(r.requestedLimit || 0) : r.kind === "discount" && r.percent ? f.percent(r.percent) : r.kind === "flow" ? "—" : f.money(r.amount));
  const pendingN = asArray<Data["counts"][number]>(data?.counts)
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + c.n, 0);

  return (
    <div className={classes.main}>
      <div className={fin.headRow}>
        <header className={classes.header}>
          <h1 className={classes.title}>{t("crmeNavInbox")}</h1>
          <span className={classes.subtitle}>{t("kartablSubtitle")}</span>
        </header>
        {fileable.length > 0 && (
          <button type="button" className={classes.primary} onClick={() => setPopup(NEW_REQ, <NewRequestMenu kinds={fileable} onPick={openForm} />)}>
            {t("accNewRequest")}
          </button>
        )}
      </div>
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <div className={classes.segmented} role="tablist">
            {(["mine", "all"] as const).map((s) => (
              <button key={s} type="button" role="tab" aria-selected={scope === s} className={scope === s ? classes.on : ""} onClick={() => setScope(s)}>
                {t(s === "mine" ? "kartablMine" : "kartablAll")}
                {s === "all" && pendingN > 0 ? ` (${f.money(pendingN)})` : ""}
              </button>
            ))}
          </div>
          <div className={classes.filters}>
            <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} aria-label={t("accRequestKind")}>
              <option value="">{t("kartablAllKinds")}</option>
              {kindsFor(profile).map((k) => (
                <option key={k} value={k}>
                  {t(kindKey(k))}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} aria-label={t("accState")}>
              <option value="">{t("accAllStates")}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`accReqSt_${s}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <HandleLoading data={!!data} error={error}>
          {data && !data.items.length ? (
            <p className={classes.empty}>{t(scope === "mine" ? "kartablEmptyMine" : "bizEmpty")}</p>
          ) : (
            <Table<Item>
              data={data?.items || []}
              name="Kartabl"
              renderer={{
                number: { name: t("bizNumber"), filter: "Number", value: (r) => r.number },
                kind: { name: t("accRequestKind"), filter: "Set", value: (r) => t(kindKey(r.kind)) },
                subject: { name: t("bizDescription"), value: (r) => [r.title, r.description, r.partyName].filter(Boolean).join(" "), component: (r) => <>{subject(r)}</> },
                amount: { name: t("bizAmount"), value: (r) => (r.kind === "credit" ? r.requestedLimit || 0 : r.amount), component: (r) => <>{amountOf(r)}</> },
                requester: { name: t("accRequester"), filter: "Set", value: (r) => data?.team.find((m) => m._id === r.requester)?.name || r.requesterName || "—" },
                chain: {
                  name: t("accApprovers"),
                  value: (r) => r.chain.map((_, i) => nameOf(r, i)).join(flowArrow()) || t("accNoApprovers"),
                  component: (r) => <>{r.chain.map((_, i) => (i === r.level && r.status === "pending" ? `▸${nameOf(r, i)}` : nameOf(r, i))).join(flowArrow()) || t("accNoApprovers")}</>,
                },
                status: {
                  name: t("accState"),
                  filter: "Set",
                  value: (r) => t(`accReqSt_${r.status}`),
                  component: (r) => (
                    <span className={classes.wrap}>
                      <span className={`${fin.pill} ${tone(r.status)}`}>{t(`accReqSt_${r.status}`)}</span>
                      {r.status === "rejected" && !!r.rejectReason && <span className={classes.muted}> {t("crmeReasonN", [r.rejectReason])}</span>}
                      {!!r.error && r.status === "approved" && <span className={classes.statusBad}> {r.error}</span>}
                    </span>
                  ),
                },
                createdAt: { name: t("kartablDate"), filter: "Date", value: (r) => new Date(r.createdAt), component: (r) => <>{f.date(r.createdAt)}</> },
                decidedAt: { name: t("kartablDecidedAt"), filter: "Date", value: (r) => (r.decidedAt ? new Date(r.decidedAt) : null), component: (r) => <>{r.decidedAt ? f.date(r.decidedAt) : "—"}</> },
                actions: {
                  name: "",
                  width: 260,
                  component: (r) => (
                    <TableActions>
                      {r.status === "pending" && (r.myTurn || data?.isOwner) && (
                        <>
                          <button type="button" className={crm.linkButton} disabled={busy === r._id} onClick={() => act(r, "decide", { decision: "approved" })}>
                            {t("accApprove")}
                          </button>
                          <button
                            type="button"
                            className={crm.linkDanger}
                            disabled={busy === r._id}
                            onClick={() => setPopup(POPUP, <RejectForm onDone={(note) => act(r, "decide", { decision: "rejected", note })} />)}
                          >
                            {t("accReject")}
                          </button>
                        </>
                      )}
                      {r.status === "approved" && canExecute(r) && (
                        <button type="button" className={crm.linkButton} disabled={busy === r._id} onClick={() => act(r, "execute")}>
                          {t("accExecute")}
                        </button>
                      )}
                      {r.status === "rejected" && r.kind !== "flow" && r.chain.length > 0 && isMine(r) && (
                        <ConfirmButton label={t("kartablReopen")} confirm={t("kartablReopenConfirm")} onConfirm={() => act(r, "reopen")} />
                      )}
                      {(r.status === "pending" || r.status === "approved") && r.kind !== "flow" && isMine(r) && (
                        <ConfirmButton danger label={t("bizCancel")} confirm={t("accCancelRequestConfirm")} onConfirm={() => act(r, "cancel")} />
                      )}
                    </TableActions>
                  ),
                },
              }}
            />
          )}
        </HandleLoading>
      </section>
    </div>
  );
};

export default Kartabl;
