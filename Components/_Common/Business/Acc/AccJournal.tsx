"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { API, FilePath } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import { useLocale } from "@/Components/i18n/navigation";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, BizAccount, bizFileHref, isoDay, useBiz, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import { useCostCenters } from "../CostCenterSelect";
import CostCenterSelect from "../CostCenterSelect";
import { parseAmount } from "../Finance/finShared";
import JournalAiBar from "../Finance/Ai/JournalAiBar";
import {
  AccParty,
  ConfirmButton,
  errText,
  ExportBar,
  JVoucher,
  PartyPicker,
  printElement,
  RangeFilter,
  SimplePopup,
  useAccCall,
  useAccGet,
  useAccPopup,
  useAccText,
  userName,
} from "./accShared";

// The journal (دفتر روزنامه) and hand-typed vouchers, after Nexxa's
// accounting/journal + journal/new + JournalEntryEditor (2026-10): every
// voucher with its lines, searchable by number, description, reference,
// account or party; a manual voucher is a draft first (it may be saved
// unbalanced), becomes final only balanced, goes back to draft to be
// corrected; automatic vouchers are managed from their documents.
// Finalizing, reverting and deleting a final voucher need approveVouchers.

type Line = { account: string; party: AccParty | null; center: string; label: string; debit: string; credit: string };
const emptyLine = (): Line => ({ account: "", party: null, center: "", label: "", debit: "", credit: "" });

const kindKey = (v: Pick<JVoucher, "kind" | "phase">) =>
  v.kind === "manual" ? "bizKindManual" : v.kind === "opening" ? "bizKindOpening" : v.kind === "closing" ? "bizKindClosing" : "bizKindAuto";

// ------------------------------------------------------------ editor

export const VoucherEditor = ({ voucher, onDone }: { voucher?: JVoucher; onDone: () => unknown }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { canApprove, api } = useBiz();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const { data: accounts } = useBizAccounts();
  const { data: centersData } = useCostCenters();
  const centers = asArray<{ _id: string; name: string; isActive: boolean }>(centersData).filter((c) => c.isActive);
  const all = asArray<BizAccount>(accounts);
  const details = all.filter((a) => a.level === "detail");
  const byId = useMemo(() => new Map(details.map((a) => [a._id, a])), [details]);
  const [date, setDate] = useState<Date>(voucher ? new Date(voucher.date) : new Date());
  const [description, setDescription] = useState(voucher?.description || "");
  const [reference, setReference] = useState(voucher?.reference || "");
  const [center, setCenter] = useState(voucher?.center || "");
  const [attachments, setAttachments] = useState<string[]>(voucher?.attachments || []);
  const [lines, setLines] = useState<Line[]>(
    voucher?.lines?.length
      ? voucher.lines.map((l) => ({
          account: l.account,
          party: l.party ? ({ _id: l.party._id, code: l.party.code, name: l.party.name, kind: l.party.kind } as AccParty) : null,
          center: l.center || "",
          label: l.label || "",
          debit: l.debit ? String(l.debit) : "",
          credit: l.credit ? String(l.credit) : "",
        }))
      : [emptyLine(), emptyLine()],
  );
  const [busy, setBusy] = useState(false);
  const debit = lines.reduce((s, l) => s + parseAmount(l.debit), 0);
  const credit = lines.reduce((s, l) => s + parseAmount(l.credit), 0);
  const diff = debit - credit;
  const balanced = debit > 0 && Math.abs(diff) < 0.01;
  const set = (i: number, patch: Partial<Line>) => setLines((p) => p.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  // Nexxa autoBalance: the difference on the first line with an account
  // and no amount (or the last)
  const autoBalance = () => {
    if (Math.abs(diff) < 0.01) return;
    setLines((ls) => {
      const idx = ls.findIndex((l) => l.account && !parseAmount(l.debit) && !parseAmount(l.credit));
      const i = idx >= 0 ? idx : ls.length - 1;
      return ls.map((l, j) => (j === i ? (diff > 0 ? { ...l, credit: String(Math.abs(diff)), debit: "" } : { ...l, debit: String(Math.abs(diff)), credit: "" }) : l));
    });
  };
  const copyDesc = () => {
    const first = lines.find((l) => l.label.trim())?.label || description;
    if (first) setLines((ls) => ls.map((l) => (l.account ? { ...l, label: l.label || first } : l)));
  };

  const payload = () => ({
    date: isoDay(date),
    description: description.trim(),
    reference: reference.trim() || undefined,
    center: center || undefined,
    attachments,
    lines: lines
      .filter((l) => l.account && (parseAmount(l.debit) || parseAmount(l.credit)))
      .map((l) => ({ account: l.account, party: l.party?._id, center: l.center || undefined, label: l.label.trim() || undefined, debit: parseAmount(l.debit), credit: parseAmount(l.credit) })),
  });

  const save = async (finalize: boolean) => {
    if (busy) return;
    setBusy(true);
    const res = (voucher
      ? await call(`/acc/vouchers/${voucher._id}`, "PATCH", payload(), finalize ? "" : undefined)
      : await call("/acc/vouchers", "POST", payload(), finalize ? "" : undefined)) as { _id?: string } | null;
    if (res && finalize && res._id) {
      const done = await call(`/acc/vouchers/${res._id}/finalize`, "POST", {}, t("accFinalized"));
      if (!done) {
        setBusy(false);
        onDone();
        return;
      }
    }
    setBusy(false);
    if (res) {
      closePopup();
      onDone();
    }
  };

  return (
    <SimplePopup title={voucher ? t("accEditVoucher", [f.money(voucher.number)]) : t("accNewVoucher")} wide>
      {/* Nexxa's "build the voucher with AI" bar (a new voucher only): the
          lines come from the panel's own chart, the user checks and saves */}
      {!voucher && /^\/(doctor|clinic|hospital|pharmacy|paraClinic|insurance)\/biz$/.test(api) && (
        <JournalAiBar
          api={`${api}/finance`}
          onDraft={(d) => {
            setLines(d.lines.map((l) => ({ ...emptyLine(), account: l.account, label: l.label, debit: l.debit ? String(l.debit) : "", credit: l.credit ? String(l.credit) : "" })));
            if (d.description) setDescription(d.description);
          }}
        />
      )}
      <div className={classes.form}>
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
        </div>
        <label className={classes.field}>
          <span>{t("accReference")}</span>
          <input value={reference} maxLength={80} onChange={(e) => setReference(e.target.value)} />
        </label>
        <CostCenterSelect value={center} onChange={setCenter} />
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("bizDescription")}</span>
          <input value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      <div className={classes.lines}>
        <div className={`${acc.editLine} ${acc.editHead}`}>
          <span>{t("bizAccount")}</span>
          <span>{t("accParty")}</span>
          <span>{t("bizCostCenter")}</span>
          <span>{t("bizLabel")}</span>
          <span>{t("bizDebit")}</span>
          <span>{t("bizCredit")}</span>
          <span />
        </div>
        {lines.map((l, i) => {
          const a = byId.get(l.account);
          const kinds = a?.tafsiliKinds?.length ? a.tafsiliKinds : undefined;
          return (
            <div key={i} className={acc.editLine}>
              <select value={l.account} aria-label={t("bizAccount")} onChange={(e) => set(i, { account: e.target.value })}>
                <option value="">{t("bizSelect")}</option>
                {details
                  .filter((x) => x.isActive !== false || x._id === l.account)
                  .map((x) => (
                    <option key={x._id} value={x._id}>
                      {x.code} · {x.name}
                    </option>
                  ))}
              </select>
              <PartyPicker value={l.party} kinds={kinds} onChange={(p) => set(i, { party: p })} />
              <select value={l.center} aria-label={t("bizCostCenter")} onChange={(e) => set(i, { center: e.target.value })}>
                <option value="">{t("accVoucherCenter")}</option>
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input value={l.label} maxLength={300} aria-label={t("bizLabel")} onChange={(e) => set(i, { label: e.target.value })} />
              <input inputMode="numeric" dir="ltr" value={l.debit} aria-label={t("bizDebit")} onChange={(e) => set(i, { debit: e.target.value, credit: e.target.value ? "" : l.credit })} />
              <input inputMode="numeric" dir="ltr" value={l.credit} aria-label={t("bizCredit")} onChange={(e) => set(i, { credit: e.target.value, debit: e.target.value ? "" : l.debit })} />
              <button type="button" className={classes.removeLine} disabled={lines.length <= 2} aria-label={t("bizDelete")} onClick={() => setLines((p) => p.filter((_, j) => j !== i))}>
                ×
              </button>
            </div>
          );
        })}
        <div className={acc.tools}>
          <button type="button" onClick={() => setLines((p) => [...p, emptyLine()])}>
            {t("bizAddLine")}
          </button>
          <button type="button" onClick={autoBalance} disabled={balanced}>
            {t("accAutoBalance")}
          </button>
          <button type="button" onClick={copyDesc}>
            {t("accCopyLabel")}
          </button>
        </div>
      </div>
      <Attachments value={attachments} onChange={setAttachments} />
      <div className={classes.cardHead}>
        <span className={balanced ? classes.statusOk : classes.statusBad}>
          {t("bizDebit")}: {f.money(debit)} · {t("bizCredit")}: {f.money(credit)} · {balanced ? t("bizBalanced") : t("bizDiff", [f.money(Math.abs(diff))])}
        </span>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup()}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.ghost} disabled={busy || description.trim().length < 2} onClick={() => save(false)}>
            {t("accSaveDraft")}
          </button>
          {canApprove && (
            <button type="button" className={classes.primary} disabled={busy || !balanced || description.trim().length < 2} onClick={() => save(true)}>
              {t("accSaveFinal")}
            </button>
          )}
        </div>
      </div>
      {!canApprove && <p className={classes.muted}>{t("accDraftOnlyHint")}</p>}
    </SimplePopup>
  );
};

// the scans behind a voucher (uploaded through the finance upload)
const Attachments = ({ value, onChange, readOnly }: { value: string[]; onChange?: (v: string[]) => void; readOnly?: boolean }) => {
  const t = useAccText();
  const { api } = useBiz();
  const push = useNotification();
  const [busy, setBusy] = useState(false);
  const upload = async (file?: File | null) => {
    if (!file || !onChange) return;
    setBusy(true);
    try {
      const res = await fetcher({ url: `${API}${api}/finance/upload`, method: "POST", payload: { file }, bodyParser: "FORM" });
      const path = String(res.data?.file || "");
      if (path) onChange([...value, path]);
    } catch (err) {
      push(errText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const href = (a: string) => bizFileHref(api, a);
  return (
    <div className={classes.field}>
      <span>{t("accAttachments")}</span>
      <div className={acc.tools}>
        {value.map((a, i) => (
          <span key={a} className={acc.chip}>
            <a href={href(a)} target="_blank" rel="noreferrer" className={fin.link}>
              {t("accAttachmentN", [String(i + 1)])}
            </a>
            {!readOnly && onChange && (
              <button type="button" aria-label={t("bizDelete")} onClick={() => onChange(value.filter((x) => x !== a))}>
                ×
              </button>
            )}
          </span>
        ))}
        {!readOnly && onChange && (
          <label className={acc.chip} style={{ cursor: "pointer" }}>
            {busy ? "…" : t("accAddAttachment")}
            <input type="file" hidden accept="image/*,application/pdf" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        )}
        {readOnly && !value.length && <span className={acc.mutedSmall}>—</span>}
      </div>
    </div>
  );
};

// ------------------------------------------------------- one voucher

const VoucherLines = ({ v }: { v: JVoucher }) => {
  const t = useAccText();
  const f = useBizFormat();
  return (
    <div className={classes.tableWrap}>
      <table className={classes.table}>
        <thead>
          <tr>
            <th>{t("bizAccount")}</th>
            <th>{t("accParty")}</th>
            <th>{t("bizLabel")}</th>
            <th className={classes.num}>{t("bizDebit")}</th>
            <th className={classes.num}>{t("bizCredit")}</th>
          </tr>
        </thead>
        <tbody>
          {asArray<JVoucher["lines"][number]>(v.lines).map((l, i) => (
            <tr key={i}>
              <td className={classes.wrap}>
                {l.code} · {l.accountName || "—"}
              </td>
              <td className={classes.wrap}>{l.party ? `${l.party.code} · ${l.party.name}` : "—"}</td>
              <td className={classes.wrap}>{l.label || "—"}</td>
              <td className={classes.num}>{l.debit ? f.money(l.debit) : "—"}</td>
              <td className={classes.num}>{l.credit ? f.money(l.credit) : "—"}</td>
            </tr>
          ))}
          <tr className={classes.footRow}>
            <td colSpan={3}>{t("bizTotal")}</td>
            <td className={classes.num}>{f.money(asArray<JVoucher["lines"][number]>(v.lines).reduce((s, l) => s + l.debit, 0))}</td>
            <td className={classes.num}>{f.money(asArray<JVoucher["lines"][number]>(v.lines).reduce((s, l) => s + l.credit, 0))}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// the actions a voucher allows the viewer (Nexxa journal row actions)
const VoucherActions = ({ v, onChanged, inPopup }: { v: JVoucher; onChanged: () => unknown; inPopup?: boolean }) => {
  const t = useAccText();
  const { canWrite, canApprove } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const { closePopup } = usePopup();
  if (!v.manual) return <span className={acc.mutedSmall}>{t(v.phase ? "bizClosingNote" : "accAutoManaged")}</span>;
  const draft = v.state === "draft";
  const after = () => {
    if (inPopup) closePopup("AccVoucher");
    onChanged();
  };
  return (
    <div className={acc.tools} data-noprint>
      {draft && canApprove && (
        <button type="button" onClick={async () => (await call(`/acc/vouchers/${v._id}/finalize`, "POST", {}, t("accFinalized"))) && after()}>
          {t("accFinalize")}
        </button>
      )}
      {!draft && canApprove && (
        <ConfirmButton label={t("accRevert")} confirm={t("accRevertConfirm")} onConfirm={async () => (await call(`/acc/vouchers/${v._id}/revert`, "POST", {}, t("accReverted"))) && after()} />
      )}
      {draft && canWrite && (
        <button type="button" onClick={() => open("AccVoucherEditor", <VoucherEditor voucher={v} onDone={after} />)}>
          {t("bizEdit")}
        </button>
      )}
      {((draft && canWrite) || (!draft && canApprove)) && (
        <ConfirmButton
          danger
          label={t("bizDelete")}
          confirm={t("bizDeleteConfirm")}
          onConfirm={async () => (await call(draft ? `/acc/vouchers/${v._id}/draft` : `/acc/vouchers/${v._id}`, "DELETE", undefined, t("bizDeleted"))) && after()}
        />
      )}
    </div>
  );
};

const VoucherHead = ({ v }: { v: JVoucher }) => {
  const t = useAccText();
  const f = useBizFormat();
  return (
    <div>
      <span className={acc.num}>{t("accVoucherNo", [f.money(v.number)])}</span>
      {v.state === "draft" && <span className={`${fin.pill} ${fin.toneWarn}`}>{t("accDraft")}</span>}
      <span className={`${classes.badge} ${v.kind === "manual" ? classes.badgeManual : classes.badgeAuto}`}>{t(kindKey(v))}</span>
      <span className={acc.mutedSmall}>{f.date(v.date)}</span>
      {!!v.reference && (
        <span className={acc.mutedSmall} dir="ltr">
          {v.reference}
        </span>
      )}
      <span className={classes.wrap}>{v.description}</span>
    </div>
  );
};

export const VoucherPopup = ({ id, onChanged }: { id: string; onChanged?: () => unknown }) => {
  const t = useAccText();
  const f = useBizFormat();
  const locale = useLocale();
  const call = useAccCall();
  const { canWrite } = useBiz();
  const sheet = useRef<HTMLDivElement>(null);
  const { data, error, mutate } = useAccGet<JVoucher | null>(`/acc/vouchers/${id}`, (d) => (d && typeof d === "object" ? (d as JVoucher) : null));
  const changed = () => {
    mutate();
    onChanged?.();
  };
  return (
    <SimplePopup title={data ? t("accVoucherNo", [f.money(data.number)]) : t("accJournal")} wide>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <div ref={sheet}>
              <div className={acc.bar}>
                <VoucherHead v={data} />
              </div>
              <VoucherLines v={data} />
              {!!data.actualDate && <p className={classes.muted}>{t("bizActualDateNote", [f.date(data.actualDate)])}</p>}
            </div>
            <Attachments
              value={asArray<string>(data.attachments)}
              readOnly={!canWrite}
              onChange={async (list) => (await call(`/acc/vouchers/${data._id}/attachments`, "PUT", { attachments: list })) && changed()}
            />
            <div className={acc.bar}>
              <VoucherActions v={data} onChanged={changed} inPopup />
              <div className={acc.tools}>
                <button type="button" onClick={() => printElement(sheet.current, t("accVoucherNo", [f.money(data.number)]), ["fa", "ar", "ur"].includes(locale))}>
                  {t("accPrint")}
                </button>
              </div>
            </div>
            {!!asArray(data.history).length && (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("accAuditWhen")}</th>
                      <th>{t("accAuditAction")}</th>
                      <th>{t("accAuditBy")}</th>
                      <th className={classes.num}>{t("bizTotal")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asArray<NonNullable<JVoucher["history"]>[number]>(data.history).map((h) => (
                      <tr key={h._id}>
                        <td>{f.date(h.createdAt)}</td>
                        <td>{t(`accAudit_${h.action}`)}</td>
                        <td>{userName(h.by)}</td>
                        <td className={classes.num}>{h.after?.total !== undefined ? f.money(h.after.total) : h.before?.total !== undefined ? f.money(h.before.total) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </HandleLoading>
    </SimplePopup>
  );
};

// ------------------------------------------------------------ the list

const LIMIT = 20;

const AccJournal = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite, api } = useBiz();
  const { open } = useAccPopup();
  const printRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [state, setState] = useState("");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  useEffect(() => {
    const h = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(h);
  }, [q]);
  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (query) params.set("q", query);
  if (kind) params.set("kind", kind);
  if (state) params.set("state", state);
  if (from) params.set("from", isoDay(from));
  if (to) params.set("to", isoDay(to));
  const { data, error, mutate, isValidating } = useAccGet<{ items: JVoucher[]; total: number }>(`/acc/journal?${params}`, (d) => {
    const x = (d || {}) as { items?: unknown; total?: unknown };
    return { items: asArray<JVoucher>(x.items), total: Number(x.total) || 0 };
  });
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const changed = () => {
    mutate();
    onChanged();
  };
  const pages = Math.max(1, Math.ceil((data?.total || 0) / LIMIT));
  const sheet = () => ({
    title: t("accJournal"),
    head: [t("bizNumber"), t("bizDate"), t("bizDescription"), t("bizCode"), t("bizAccount"), t("accParty"), t("bizLabel"), t("bizDebit"), t("bizCredit"), t("accState")],
    rows: asArray<JVoucher>(data?.items).flatMap((v) =>
      v.lines.map((l) => [v.number, f.date(v.date), v.description, l.code, l.accountName || "", l.party?.name || "", l.label || "", l.debit, l.credit, v.state === "draft" ? t("accDraft") : t("accFinal")]),
    ),
  });
  // the whole filtered journal for export, not just the page
  const exportAll = async () => {
    const p = new URLSearchParams(params);
    p.set("page", "1");
    p.set("limit", "2000");
    p.set("export", "1");
    const res = await fetcher({ url: `${API}${api}/acc/journal?${p}` }).catch(() => null);
    return asArray<JVoucher>(res?.data?.items);
  };
  const [full, setFull] = useState<JVoucher[] | null>(null);
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <div className={classes.filters}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("accJournalSearch")} aria-label={t("bizSearch")} />
          <select value={kind} onChange={(e) => (setKind(e.target.value), setPage(1))} aria-label={t("bizKind")}>
            <option value="">{t("bizAllKinds")}</option>
            <option value="manual">{t("bizKindManual")}</option>
            <option value="auto">{t("bizKindAuto")}</option>
            <option value="opening">{t("bizKindOpening")}</option>
            <option value="closing">{t("bizKindClosing")}</option>
          </select>
          <select value={state} onChange={(e) => (setState(e.target.value), setPage(1))} aria-label={t("accState")}>
            <option value="">{t("accAllStates")}</option>
            <option value="final">{t("accFinal")}</option>
            <option value="draft">{t("accDraft")}</option>
          </select>
        </div>
        <div className={acc.tools}>
          <ExportBar
            sheet={() => {
              const s = sheet();
              if (!full) return s;
              return { ...s, rows: full.flatMap((v) => v.lines.map((l) => [v.number, f.date(v.date), v.description, l.code, l.accountName || "", l.party?.name || "", l.label || "", l.debit, l.credit, v.state === "draft" ? t("accDraft") : t("accFinal")])) };
            }}
            printRef={printRef}
            extra={
              <button type="button" onClick={async () => setFull(await exportAll())}>
                {full ? t("accExportAllReady", [f.money(full.length)]) : t("accExportAll")}
              </button>
            }
          />
          {canWrite && (
            <button type="button" className={classes.primary} onClick={() => open("AccVoucherEditor", <VoucherEditor onDone={changed} />)}>
              {t("accNewVoucher")}
            </button>
          )}
        </div>
      </div>
      <RangeFilter from={from} to={to} setFrom={(d) => (setFrom(d), setPage(1))} setTo={(d) => (setTo(d), setPage(1))} />
      <HandleLoading data={!!data} error={error}>
        <div ref={printRef} className={classes.main} style={{ opacity: isValidating ? 0.6 : 1 }}>
          {!!data && !data.items.length && <p className={classes.empty}>{query || kind || state || from || to ? t("accNoMatch") : t("bizNoVouchers")}</p>}
          {asArray<JVoucher>(data?.items).map((v) => (
            <div key={v._id} className={`${acc.voucher} ${v.state === "draft" ? acc.voucherDraft : ""}`}>
              <div className={acc.voucherHead}>
                <VoucherHead v={v} />
                <div>
                  <button type="button" className={fin.link} onClick={() => open("AccVoucher", <VoucherPopup id={v._id} onChanged={changed} />)}>
                    {t("accOpen")}
                  </button>
                  <VoucherActions v={v} onChanged={changed} />
                </div>
              </div>
              <VoucherLines v={v} />
            </div>
          ))}
        </div>
      </HandleLoading>
      {pages > 1 && (
        <div className={classes.pagination}>
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("bizPrev")}
          </button>
          <span>{t("bizPage", [f.money(page), f.money(pages)])}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            {t("bizNext")}
          </button>
        </div>
      )}
    </section>
  );
};

export default AccJournal;
