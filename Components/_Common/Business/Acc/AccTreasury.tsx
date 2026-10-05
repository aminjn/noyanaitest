"use client";

import { useRef, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, BizAccount, isoDay, useBiz, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import FinanceShell from "../Finance/FinanceShell";
import { Cheques } from "../Finance/FinancePayments";
import { FinPayment, parseAmount } from "../Finance/finShared";
import {
  AccountSelect,
  AccParty,
  AmountInput,
  ConfirmButton,
  ExportBar,
  MoneySelect,
  PartyPicker,
  SimplePopup,
  SubNav,
  treasuryKindKey,
  TreasuryRow,
  useAccCall,
  useAccGet,
  useAccPopup,
  useAccText,
  useAccUpload,
  useOpenVoucher,
  useTreasury,
  useView,
} from "./accShared";
import { TreasuryLedger } from "./AccBooks";
import AccSettlements from "./AccSettlements";

// «خزانه‌داری» (2026-10), a port of Nexxa's treasury pages: the tills,
// banks, card readers and petty funds with their balances (an opening
// balance booked on 5103), each one's ledger, transfers and remittances
// between them (and bank charges), the cheque register with deposit,
// endorsement (خرج چک) and undoing the last move, trust cheques (no
// voucher), cheque books, bank reconciliation with statement import and
// auto-matching, settlements and the treasury policy (a payment that
// would take a till below zero: allow / warn / block).

const OpenAccount = ({ onDone }: { onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [kind, setKind] = useState<"cash" | "bank" | "pos" | "petty">("bank");
  const [d, setD] = useState({ name: "", bankName: "", accountNumber: "", sheba: "", holder: "" });
  const [opening, setOpening] = useState("");
  const [limit, setLimit] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const save = async () => {
    const res = await call("/acc/treasury", "POST", { kind, ...d, opening: parseAmount(opening), pettyLimit: parseAmount(limit), date: isoDay(date) });
    if (res) {
      closePopup();
      onDone();
    }
  };
  const field = (k: keyof typeof d, label: string, ltr?: boolean) => (
    <label className={classes.field}>
      <span>{label}</span>
      <input value={d[k]} dir={ltr ? "ltr" : undefined} onChange={(e) => setD((p) => ({ ...p, [k]: e.target.value }))} />
    </label>
  );
  return (
    <SimplePopup title={t("accOpenTreasury")}>
      <SubNav
        value={kind}
        onChange={setKind}
        items={[
          ["bank", t("finKindBank")],
          ["cash", t("finKindCash")],
          ["pos", t("finKindPos")],
          ["petty", t("accKindPetty")],
        ]}
      />
      <div className={classes.form}>
        {field("name", t("finTillName"))}
        {(kind === "bank" || kind === "pos") && field("bankName", t("finBankName"))}
        {kind === "bank" && field("accountNumber", t("accAccountNumber"), true)}
        {kind === "bank" && field("sheba", t("accSheba"), true)}
        {kind === "petty" && field("holder", t("accPettyHolder"))}
        {kind === "petty" && <AmountInput label={t("accPettyLimit")} value={limit} onChange={setLimit} />}
        <AmountInput label={t("accOpeningBalance")} value={opening} onChange={setOpening} />
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(x) => setDate(x)} />
        </div>
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button type="button" className={classes.primary} disabled={d.name.trim().length < 2} onClick={save}>
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

// a transfer between two treasury accounts, or a bank charge
const TransferForm = ({ fee, from: fixedFrom, to: fixedTo, petty, onDone }: { fee?: boolean; from?: string; to?: string; petty?: boolean; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [from, setFrom] = useState(fixedFrom || "");
  const [to, setTo] = useState(fixedTo || "");
  const [amt, setAmt] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const save = async () => {
    const res = fee
      ? await call("/acc/bank-fee", "POST", { money: from, amount: parseAmount(amt), date: isoDay(date), description })
      : petty
        ? await call(`/acc/petty/${to}/charge`, "POST", { from, amount: parseAmount(amt), date: isoDay(date), note: description })
        : await call("/acc/transfers", "POST", { from, to, amount: parseAmount(amt), date: isoDay(date), description, reference });
    if (res) {
      closePopup();
      onDone();
    }
  };
  return (
    <SimplePopup title={fee ? t("accBankFee") : petty ? t("accChargePetty") : t("accNewTransfer")}>
      <div className={classes.form}>
        <MoneySelect value={from} onChange={setFrom} label={fee ? t("accMoney") : t("accFrom")} exclude={to} kinds={fee ? ["bank", "pos"] : undefined} />
        {!fee && <MoneySelect value={to} onChange={setTo} label={t("accTo")} exclude={from} kinds={petty ? ["petty"] : undefined} />}
        <AmountInput label={t("bizAmount")} value={amt} onChange={setAmt} />
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(x) => setDate(x)} />
        </div>
        {!fee && !petty && (
          <label className={classes.field}>
            <span>{t("accReference")}</span>
            <input value={reference} maxLength={80} onChange={(e) => setReference(e.target.value)} />
          </label>
        )}
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("bizDescription")}</span>
          <input value={description} maxLength={200} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button type="button" className={classes.primary} disabled={!from || (!fee && !to) || !parseAmount(amt)} onClick={save}>
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

type PettyStatus = { balance: number; totalSpent: number; suggested: number; spent: { _id: string; number: number; date: string; label?: string; description: string; amount: number }[] };

const PettyPanel = ({ m, onDone }: { m: TreasuryRow; onDone: () => unknown }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const { open } = useAccPopup();
  const openVoucher = useOpenVoucher();
  const { data, error, mutate } = useAccGet<PettyStatus | null>(`/acc/petty/${m._id}`, (d) => (d && typeof d === "object" ? (d as PettyStatus) : null));
  return (
    <SimplePopup title={`${m.name}${m.holder ? ` · ${m.holder}` : ""}`} wide>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <div className={classes.tiles}>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("bizBalance")}</span>
                <span className={classes.tileValue}>{f.signed(data.balance)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accPettyLimit")}</span>
                <span className={classes.tileValue}>{m.pettyLimit ? f.money(m.pettyLimit) : "—"}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accPettySpent")}</span>
                <span className={classes.tileValue}>{f.money(data.totalSpent)}</span>
              </div>
              <div className={`${classes.tile} ${classes.primaryTile}`}>
                <span className={classes.tileLabel}>{t("accPettySuggested")}</span>
                <span className={classes.tileValue}>{f.money(data.suggested)}</span>
              </div>
            </div>
            <p className={classes.muted}>{t("accPettyHint")}</p>
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("bizDate")}</th>
                    <th>{t("bizNumber")}</th>
                    <th>{t("bizDescription")}</th>
                    <th className={classes.num}>{t("bizAmount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {!asArray(data.spent).length && (
                    <tr>
                      <td colSpan={4} className={classes.empty}>
                        {t("bizEmpty")}
                      </td>
                    </tr>
                  )}
                  {asArray<PettyStatus["spent"][number]>(data.spent).map((s, i) => (
                    <tr key={`${s._id}-${i}`} className={classes.rowLink} onClick={() => openVoucher(s._id)}>
                      <td>{f.date(s.date)}</td>
                      <td>{f.money(s.number)}</td>
                      <td className={classes.wrap}>{s.label || s.description}</td>
                      <td className={classes.num}>{f.money(s.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {canWrite && (
              <div className={classes.actions}>
                <button
                  type="button"
                  className={classes.primary}
                  onClick={() =>
                    open(
                      "AccTransferForm",
                      <TransferForm
                        petty
                        to={m._id}
                        onDone={() => {
                          mutate();
                          onDone();
                        }}
                      />,
                    )
                  }
                >
                  {t("accChargePetty")}
                </button>
              </div>
            )}
          </>
        )}
      </HandleLoading>
    </SimplePopup>
  );
};

const Accounts = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const { data, error, mutate } = useTreasury();
  const rows = asArray<TreasuryRow>(data);
  const total = rows.filter((r) => r.kind !== "wallet").reduce((s, r) => s + r.balance, 0);
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <span className={classes.cardTitle}>
          {t("accTreasuryTotal")}: {f.signed(total)}
        </span>
        <div className={acc.tools}>
          <ExportBar
            printRef={ref}
            sheet={() => ({ title: t("accTreasury"), head: [t("finTillName"), t("finKind"), t("finBankName"), t("bizBalance")], rows: rows.map((r) => [r.name, t(treasuryKindKey(r.kind)), r.bankName || "", r.balance]) })}
          />
          {canWrite && (
            <>
              <button type="button" className={classes.ghost} onClick={() => open("AccTransferForm", <TransferForm onDone={() => mutate()} />)}>
                {t("accNewTransfer")}
              </button>
              <button type="button" className={classes.primary} onClick={() => open("AccOpenTreasury", <OpenAccount onDone={() => mutate()} />)}>
                {t("accOpenTreasury")}
              </button>
            </>
          )}
        </div>
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap} ref={ref}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("finTillName")}</th>
                <th>{t("finKind")}</th>
                <th>{t("finBankName")}</th>
                <th className={classes.num}>{t("bizBalance")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} style={{ opacity: r.isActive ? 1 : 0.55 }}>
                  <td className={classes.wrap}>
                    {r.name}
                    {r.holder ? <span className={fin.small}> · {r.holder}</span> : null}
                  </td>
                  <td>{t(treasuryKindKey(r.kind))}</td>
                  <td>{r.bankName || "—"}</td>
                  <td className={`${classes.num} ${r.balance < 0 ? classes.negative : ""}`}>{f.signed(r.balance)}</td>
                  <td>
                    {r.kind === "petty" && (
                      <div className={fin.rowActions}>
                        <button type="button" onClick={() => open("AccPetty", <PettyPanel m={r} onDone={() => mutate()} />)}>
                          {t("accPettyStatement")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
      <p className={classes.muted}>{t("accTreasuryHint")}</p>
    </section>
  );
};

type Transfer = { _id: string; number: number; date: string; ref: string; reference?: string; amount: number; from: string; to: string; void: boolean };

const Transfers = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const openVoucher = useOpenVoucher();
  const ref = useRef<HTMLDivElement>(null);
  const { data, error, mutate } = useAccGet<Transfer[]>("/acc/transfers", (d) => asArray<Transfer>(d));
  const rows = asArray<Transfer>(data);
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <span className={classes.cardTitle}>
          {t("accTransferred")}: {f.money(rows.filter((r) => !r.void).reduce((s, r) => s + r.amount, 0))}
        </span>
        <div className={acc.tools}>
          <ExportBar printRef={ref} sheet={() => ({ title: t("accTransfers"), head: [t("bizDate"), t("bizNumber"), t("accFrom"), t("accTo"), t("bizAmount")], rows: rows.map((r) => [f.date(r.date), r.number, r.from, r.to, r.amount]) })} />
          {canWrite && (
            <>
              <button type="button" className={classes.ghost} onClick={() => open("AccTransferForm", <TransferForm fee onDone={() => mutate()} />)}>
                {t("accBankFee")}
              </button>
              <button type="button" className={classes.primary} onClick={() => open("AccTransferForm", <TransferForm onDone={() => mutate()} />)}>
                {t("accNewTransfer")}
              </button>
            </>
          )}
        </div>
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap} ref={ref}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizDate")}</th>
                <th>{t("bizNumber")}</th>
                <th>{t("accFrom")}</th>
                <th>{t("accTo")}</th>
                <th className={classes.num}>{t("bizAmount")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!rows.length && (
                <tr>
                  <td colSpan={6} className={classes.empty}>
                    {t("bizEmpty")}
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r._id} style={{ opacity: r.void ? 0.5 : 1 }}>
                  <td>{f.date(r.date)}</td>
                  <td>
                    <button type="button" className={fin.link} onClick={() => openVoucher(r._id)}>
                      {f.money(r.number)}
                    </button>
                  </td>
                  <td className={classes.wrap}>{r.from}</td>
                  <td className={classes.wrap}>{r.to}</td>
                  <td className={classes.num}>{f.money(r.amount)}</td>
                  <td>
                    {r.void ? (
                      <span className={`${fin.pill} ${fin.toneMuted}`}>{t("finStVoid")}</span>
                    ) : (
                      canWrite && <ConfirmButton danger label={t("accVoid")} confirm={t("accVoidTransferConfirm")} onConfirm={async () => (await call(`/acc/transfers/${r._id}/void`, "POST", {})) && mutate()} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
    </section>
  );
};

// the treasury's own cheque moves beside the register's
const ChequeExtra = ({ p, refresh }: { p: FinPayment; refresh: () => unknown }) => {
  const t = useAccText();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const status = p.cheque?.status;
  if (!canWrite || !status) return null;
  return (
    <>
      {p.direction === "in" && status === "pending" && (
        <button type="button" onClick={async () => (await call(`/acc/cheques/${p._id}/deposit`, "POST", {})) && refresh()}>
          {t("accChqDeposit")}
        </button>
      )}
      {p.direction === "in" && (status === "pending" || status === "deposited") && (
        <button type="button" onClick={() => open("AccEndorse", <EndorseForm p={p} onDone={refresh} />)}>
          {t("accChqEndorse")}
        </button>
      )}
      {asArray(p.cheque?.history).length > 1 && (
        <ConfirmButton label={t("accChqRevert")} confirm={t("accChqRevertConfirm")} onConfirm={async () => (await call(`/acc/cheques/${p._id}/revert`, "POST", {})) && refresh()} />
      )}
    </>
  );
};

const EndorseForm = ({ p, onDone }: { p: FinPayment; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [party, setParty] = useState<AccParty | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  return (
    <SimplePopup title={`${t("accChqEndorse")} · ${p.cheque?.number || ""}`}>
      <p className={classes.muted}>{t("accChqEndorseHint")}</p>
      <div className={classes.form}>
        <PartyPicker value={party} onChange={setParty} kinds={["supplier", "person", "doctor", "custom"]} label={t("accEndorsedTo")} />
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(x) => setDate(x)} />
        </div>
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button
          type="button"
          className={classes.primary}
          disabled={!party}
          onClick={async () => {
            if (await call(`/acc/cheques/${p._id}/endorse`, "POST", { party: party?._id, date: isoDay(date) })) {
              closePopup();
              onDone();
            }
          }}
        >
          {t("accChqEndorse")}
        </button>
      </div>
    </SimplePopup>
  );
};

type Trust = { _id: string; serial: string; bank?: string; amount: number; dueDate: string; partyName?: string; purpose?: string };

const TrustForm = ({ trust, onDone }: { trust?: Trust; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [d, setD] = useState({ serial: trust?.serial || "", bank: trust?.bank || "", purpose: trust?.purpose || "" });
  const [amt, setAmt] = useState(trust ? String(trust.amount) : "");
  const [due, setDue] = useState<Date | null>(trust ? new Date(trust.dueDate) : null);
  const [party, setParty] = useState<AccParty | null>(null);
  return (
    <SimplePopup title={t("accTrustCheque")}>
      <div className={classes.form}>
        <label className={classes.field}>
          <span>{t("finChqNumber")}</span>
          <input value={d.serial} dir="ltr" onChange={(e) => setD((p) => ({ ...p, serial: e.target.value }))} />
        </label>
        <label className={classes.field}>
          <span>{t("finChqBank")}</span>
          <input value={d.bank} onChange={(e) => setD((p) => ({ ...p, bank: e.target.value }))} />
        </label>
        <AmountInput label={t("bizAmount")} value={amt} onChange={setAmt} />
        <div className={classes.field}>
          <DateInput title={t("finChqDue")} defaultValue={due || undefined} onChange={(x) => setDue(x)} />
        </div>
        <PartyPicker value={party} onChange={setParty} label={t("accTrustFrom")} placeholder={trust?.partyName} />
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("accTrustPurpose")}</span>
          <input value={d.purpose} onChange={(e) => setD((p) => ({ ...p, purpose: e.target.value }))} />
        </label>
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button
          type="button"
          className={classes.primary}
          disabled={!d.serial.trim() || !parseAmount(amt) || !due}
          onClick={async () => {
            if (await call("/acc/trust", "POST", { id: trust?._id, ...d, amount: parseAmount(amt), dueDate: due ? isoDay(due) : undefined, party: party?._id, partyName: party?.name || trust?.partyName })) {
              closePopup();
              onDone();
            }
          }}
        >
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

const TrustCheques = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const { data, error, mutate } = useAccGet<Trust[]>("/acc/trust", (d) => asArray<Trust>(d));
  const rows = asArray<Trust>(data);
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <span className={classes.muted}>{t("accTrustHint")}</span>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open("AccTrust", <TrustForm onDone={() => mutate()} />)}>
            {t("accNewTrust")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("finChqDue")}</th>
                <th>{t("finChqNumber")}</th>
                <th>{t("finChqBank")}</th>
                <th>{t("accTrustFrom")}</th>
                <th>{t("accTrustPurpose")}</th>
                <th className={classes.num}>{t("bizAmount")}</th>
                {canWrite && <th />}
              </tr>
            </thead>
            <tbody>
              {!rows.length && (
                <tr>
                  <td colSpan={7} className={classes.empty}>
                    {t("bizEmpty")}
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{f.date(r.dueDate)}</td>
                  <td dir="ltr">{r.serial}</td>
                  <td>{r.bank || "—"}</td>
                  <td className={classes.wrap}>{r.partyName || "—"}</td>
                  <td className={classes.wrap}>{r.purpose || "—"}</td>
                  <td className={classes.num}>{f.money(r.amount)}</td>
                  {canWrite && (
                    <td>
                      <div className={fin.rowActions}>
                        <button type="button" onClick={() => open("AccTrust", <TrustForm trust={r} onDone={() => mutate()} />)}>
                          {t("bizEdit")}
                        </button>
                        <ConfirmButton label={t("accTrustRelease")} confirm={t("accTrustReleaseConfirm")} onConfirm={async () => (await call(`/acc/trust/${r._id}`, "DELETE")) && mutate()} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
    </section>
  );
};

type Checkbook = { _id: string; money?: string; bankName?: string; serial: string; fromNo: string; toNo: string; count: number; used: number; description?: string; isActive: boolean };

const CheckbookForm = ({ book, onDone }: { book?: Checkbook; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [money, setMoney] = useState(book?.money || "");
  const [d, setD] = useState({ serial: book?.serial || "", fromNo: book?.fromNo || "", toNo: book?.toNo || "", description: book?.description || "" });
  const field = (k: keyof typeof d, label: string, ltr?: boolean) => (
    <label className={classes.field}>
      <span>{label}</span>
      <input value={d[k]} dir={ltr ? "ltr" : undefined} onChange={(e) => setD((p) => ({ ...p, [k]: e.target.value }))} />
    </label>
  );
  return (
    <SimplePopup title={t("accCheckbook")}>
      <div className={classes.form}>
        <MoneySelect value={money} onChange={setMoney} kinds={["bank"]} />
        {field("serial", t("accCheckbookSerial"), true)}
        {field("fromNo", t("accFromNo"), true)}
        {field("toNo", t("accToNo"), true)}
        {field("description", t("bizDescription"))}
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button
          type="button"
          className={classes.primary}
          disabled={!d.serial || !d.fromNo || !d.toNo}
          onClick={async () => {
            if (await call("/acc/checkbooks", "POST", { id: book?._id, money, ...d })) {
              closePopup();
              onDone();
            }
          }}
        >
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

const Checkbooks = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const { data, error, mutate } = useAccGet<Checkbook[]>("/acc/checkbooks", (d) => asArray<Checkbook>(d));
  const rows = asArray<Checkbook>(data);
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <span className={classes.muted}>{t("accCheckbookHint")}</span>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open("AccCheckbook", <CheckbookForm onDone={() => mutate()} />)}>
            {t("accNewCheckbook")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("finBankName")}</th>
                <th>{t("accCheckbookSerial")}</th>
                <th>{t("accRange")}</th>
                <th className={classes.num}>{t("accLeaves")}</th>
                <th className={classes.num}>{t("accLeavesUsed")}</th>
                {canWrite && <th />}
              </tr>
            </thead>
            <tbody>
              {!rows.length && (
                <tr>
                  <td colSpan={6} className={classes.empty}>
                    {t("bizEmpty")}
                  </td>
                </tr>
              )}
              {rows.map((b) => (
                <tr key={b._id}>
                  <td>{b.bankName || "—"}</td>
                  <td dir="ltr">{b.serial}</td>
                  <td dir="ltr">
                    {b.fromNo} – {b.toNo}
                  </td>
                  <td className={classes.num}>{f.money(b.count)}</td>
                  <td className={classes.num}>{f.money(b.used)}</td>
                  {canWrite && (
                    <td>
                      <div className={fin.rowActions}>
                        <button type="button" onClick={() => open("AccCheckbook", <CheckbookForm book={b} onDone={() => mutate()} />)}>
                          {t("bizEdit")}
                        </button>
                        <ConfirmButton danger label={t("bizDelete")} confirm={t("bizDeleteConfirm")} onConfirm={async () => (await call(`/acc/checkbooks/${b._id}`, "DELETE", undefined, t("bizDeleted"))) && mutate()} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
    </section>
  );
};

type BankLine = { _id: string; date: string; amount: number; description?: string; reference?: string; status: "open" | "matched" | "ignored"; voucher?: string };
type BookOpen = { _id: string; date: string; number: number; description: string; amount: number };
type Rec = {
  account: { _id: string; name: string; statementBalance?: number; statementDate?: string };
  bookBalance: number;
  statement: BankLine[];
  unmatchedBook: BookOpen[];
  summary: { openStatement: number; openBook: number; openBookSum: number; openStatementSum: number; difference: number | null };
};

const Import = ({ money, onDone }: { money: string; onDone: () => unknown }) => {
  const t = useAccText();
  const upload = useAccUpload();
  const { closePopup } = usePopup();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ columns: string[]; sample: unknown[][]; mapping: Record<string, number | undefined>; rows: number } | null>(null);
  const [mapping, setMapping] = useState<Record<string, number | undefined>>({});
  const [result, setResult] = useState<{ added: number; duplicates: number; invalid: number; matched: number } | null>(null);
  const pick = async (f?: File | null) => {
    if (!f) return;
    setFile(f);
    const p = (await upload(`/acc/bank/${money}/preview`, { file: f })) as typeof preview;
    if (p) {
      setPreview(p);
      setMapping(p.mapping || {});
    }
  };
  const run = async () => {
    if (!file) return;
    const r = (await upload(`/acc/bank/${money}/import`, { file, mapping: JSON.stringify(mapping) })) as typeof result;
    if (r) {
      setResult(r);
      onDone();
    }
  };
  const cols: [string, string][] = [
    ["date", t("bizDate")],
    ["amount", t("accSignedAmount")],
    ["debit", t("accWithdrawal")],
    ["credit", t("accDeposit")],
    ["description", t("bizDescription")],
    ["reference", t("accReference")],
    ["balance", t("bizBalance")],
  ];
  return (
    <SimplePopup title={t("accImportStatement")} wide>
      {result ? (
        <>
          <p className={classes.statusOk}>{t("accStatementResult", [String(result.added), String(result.duplicates), String(result.invalid), String(result.matched)])}</p>
          <div className={classes.actions}>
            <button type="button" className={classes.primary} onClick={() => closePopup()}>
              {t("close")}
            </button>
          </div>
        </>
      ) : !preview ? (
        <>
          <p className={classes.muted}>{t("accStatementHint")}</p>
          <label className={acc.chip} style={{ cursor: "pointer", alignSelf: "flex-start" }}>
            {t("accImportFile")}
            <input type="file" hidden accept=".csv,.xlsx" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
        </>
      ) : (
        <>
          <div className={classes.form}>
            {cols.map(([k, label]) => (
              <label key={k} className={classes.field}>
                <span>{label}</span>
                <select value={mapping[k] ?? ""} onChange={(e) => setMapping((m) => ({ ...m, [k]: e.target.value === "" ? undefined : Number(e.target.value) }))}>
                  <option value="">—</option>
                  {preview.columns.map((c, i) => (
                    <option key={i} value={i}>
                      {c || `#${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  {preview.columns.map((c, i) => (
                    <th key={i}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {asArray<unknown[]>(preview.sample).map((r, i) => (
                  <tr key={i}>
                    {asArray<unknown>(r).map((c, j) => (
                      <td key={j}>{String(c ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={classes.actions}>
            <button type="button" className={classes.ghost} onClick={() => closePopup()}>
              {t("bizCancel")}
            </button>
            <button type="button" className={classes.primary} disabled={mapping.date === undefined || (mapping.amount === undefined && mapping.debit === undefined && mapping.credit === undefined)} onClick={run}>
              {t("accImportN", [String(preview.rows)])}
            </button>
          </div>
        </>
      )}
    </SimplePopup>
  );
};

const BookLineForm = ({ line, onDone }: { line: BankLine; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const { data } = useBizAccounts();
  const [account, setAccount] = useState("");
  const [party, setParty] = useState<AccParty | null>(null);
  const [description, setDescription] = useState(line.description || "");
  return (
    <SimplePopup title={t("accBookLine")}>
      <p className={classes.muted}>{t("accBookLineHint")}</p>
      <div className={classes.form}>
        <AccountSelect accounts={asArray<BizAccount>(data).filter((a) => a.parentCode !== "11")} value={account} onChange={setAccount} label={t("accCounterAccount")} />
        <PartyPicker value={party} onChange={setParty} label={t("accParty")} />
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("bizDescription")}</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button
          type="button"
          className={classes.primary}
          disabled={!account}
          onClick={async () => {
            if (await call(`/acc/bank-lines/${line._id}/book`, "POST", { account, party: party?._id, description })) {
              closePopup();
              onDone();
            }
          }}
        >
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

const MatchForm = ({ line, book, onDone }: { line: BankLine; book: BookOpen[]; onDone: () => unknown }) => {
  const t = useAccText();
  const f = useBizFormat();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const candidates = book.filter((b) => Math.round(b.amount) === Math.round(line.amount));
  return (
    <SimplePopup title={t("accMatchLine")}>
      <p className={classes.muted}>{t("accMatchHint", [f.signed(line.amount)])}</p>
      <div className={classes.tableWrap}>
        <table className={classes.table}>
          <tbody>
            {!candidates.length && (
              <tr>
                <td className={classes.empty}>{t("accNoCandidates")}</td>
              </tr>
            )}
            {candidates.map((b) => (
              <tr
                key={b._id}
                className={classes.rowLink}
                onClick={async () => {
                  if (await call(`/acc/bank-lines/${line._id}/match`, "POST", { voucher: b._id })) {
                    closePopup();
                    onDone();
                  }
                }}
              >
                <td>{f.date(b.date)}</td>
                <td>{f.money(b.number)}</td>
                <td className={classes.wrap}>{b.description}</td>
                <td className={classes.num}>{f.signed(b.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SimplePopup>
  );
};

// Nexxa bank-rec + BankStatementImport: statement lines and book lines side
// by side, matched automatically (same amount, closest date in the window)
// or by hand; a line only the bank has is booked from here
const BankRec = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const openVoucher = useOpenVoucher();
  const { data: treasury } = useTreasury();
  const banks = asArray<TreasuryRow>(treasury).filter((m) => m.kind === "bank" || m.kind === "pos");
  const [sel, setSel] = useState("");
  const money = sel || banks[0]?._id || "";
  const { data, error, mutate } = useAccGet<Rec | null>(money ? `/acc/bank/${money}` : null, (d) => (d && typeof d === "object" ? (d as Rec) : null));
  const book = asArray<BookOpen>(data?.unmatchedBook);
  const stmt = asArray<BankLine>(data?.statement);
  const tone = (s: string) => (s === "matched" ? fin.toneOk : s === "ignored" ? fin.toneMuted : fin.toneWarn);
  return (
    <section className={classes.card}>
      <div className={acc.subnav}>
        {banks.map((b) => (
          <button key={b._id} type="button" className={money === b._id ? acc.on : ""} onClick={() => setSel(b._id)}>
            {b.name}
          </button>
        ))}
      </div>
      {!money ? (
        <p className={classes.empty}>{t("accNoBank")}</p>
      ) : (
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <>
              <div className={classes.tiles}>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("accBookBalance")}</span>
                  <span className={classes.tileValue}>{f.signed(data.bookBalance)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("accStatementBalance")}</span>
                  <span className={classes.tileValue}>{data.account.statementBalance !== undefined ? f.signed(data.account.statementBalance) : "—"}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("accOpenBookLines")}</span>
                  <span className={classes.tileValue}>
                    <bdi>{f.signed(data.summary.openBookSum)}</bdi>
                  </span>
                  <span className={acc.mutedSmall}>
                    {t("accCount")}: <bdi>{f.money(data.summary.openBook)}</bdi>
                  </span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("accOpenStatementLines")}</span>
                  <span className={classes.tileValue}>
                    <bdi>{f.signed(data.summary.openStatementSum)}</bdi>
                  </span>
                  <span className={acc.mutedSmall}>
                    {t("accCount")}: <bdi>{f.money(data.summary.openStatement)}</bdi>
                  </span>
                </div>
                {data.summary.difference !== null && (
                  <div className={`${classes.tile} ${data.summary.difference === 0 ? "" : classes.primaryTile}`}>
                    <span className={classes.tileLabel}>{t("accRecDifference")}</span>
                    <span className={classes.tileValue}>{f.signed(data.summary.difference)}</span>
                  </div>
                )}
              </div>
              {canWrite && (
                <div className={acc.tools}>
                  <button type="button" onClick={() => open("AccImport", <Import money={money} onDone={() => mutate()} />)}>
                    {t("accImportStatement")}
                  </button>
                  <button type="button" onClick={async () => (await call(`/acc/bank/${money}/auto-match`, "POST", {}, t("accAutoMatched"))) && mutate()}>
                    {t("accAutoMatch")}
                  </button>
                  <ConfirmButton danger label={t("accClearStatement")} confirm={t("accClearStatementConfirm")} onConfirm={async () => (await call(`/acc/bank/${money}/lines`, "DELETE")) && mutate()} />
                </div>
              )}
              <div className={`${fin.grid2} ${fin.grid2Wide}`}>
                <div className={classes.main}>
                  <h3 className={classes.cardTitle}>{t("accStatementLines")}</h3>
                  <div className={classes.tableWrap}>
                    <table className={classes.table}>
                      <tbody>
                        {!stmt.length && (
                          <tr>
                            <td className={classes.empty}>{t("bizEmpty")}</td>
                          </tr>
                        )}
                        {stmt.map((l) => (
                          <tr key={l._id}>
                            <td>{f.date(l.date)}</td>
                            <td className={classes.wrap}>{l.description || l.reference || "—"}</td>
                            <td className={`${classes.num} ${l.amount < 0 ? classes.negative : ""}`}>{f.signed(l.amount)}</td>
                            <td>
                              <span className={`${fin.pill} ${tone(l.status)}`}>{t(`accLine_${l.status}`)}</span>
                            </td>
                            <td>
                              {canWrite && (
                                <div className={fin.rowActions}>
                                  {l.status === "open" && (
                                    <>
                                      <button type="button" onClick={() => open("AccMatch", <MatchForm line={l} book={book} onDone={() => mutate()} />)}>
                                        {t("accMatch")}
                                      </button>
                                      <button type="button" onClick={() => open("AccBookLine", <BookLineForm line={l} onDone={() => mutate()} />)}>
                                        {t("accBookIt")}
                                      </button>
                                      <button type="button" onClick={async () => (await call(`/acc/bank-lines/${l._id}/ignore`, "POST", { ignored: true })) && mutate()}>
                                        {t("accIgnore")}
                                      </button>
                                    </>
                                  )}
                                  {l.status === "matched" && (
                                    <>
                                      {!!l.voucher && (
                                        <button type="button" onClick={() => openVoucher(String(l.voucher))}>
                                          {t("accOpen")}
                                        </button>
                                      )}
                                      <button type="button" onClick={async () => (await call(`/acc/bank-lines/${l._id}/unmatch`, "POST", {})) && mutate()}>
                                        {t("accUnmatch")}
                                      </button>
                                    </>
                                  )}
                                  {l.status === "ignored" && (
                                    <button type="button" onClick={async () => (await call(`/acc/bank-lines/${l._id}/ignore`, "POST", { ignored: false })) && mutate()}>
                                      {t("accRestore")}
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={classes.main}>
                  <h3 className={classes.cardTitle}>{t("accBookLinesOpen")}</h3>
                  <div className={classes.tableWrap}>
                    <table className={classes.table}>
                      <tbody>
                        {!book.length && (
                          <tr>
                            <td className={classes.empty}>{t("bizEmpty")}</td>
                          </tr>
                        )}
                        {book.map((b) => (
                          <tr key={b._id} className={classes.rowLink} onClick={() => openVoucher(b._id)}>
                            <td>{f.date(b.date)}</td>
                            <td>{f.money(b.number)}</td>
                            <td className={classes.wrap}>{b.description}</td>
                            <td className={`${classes.num} ${b.amount < 0 ? classes.negative : ""}`}>{f.signed(b.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </HandleLoading>
      )}
    </section>
  );
};

const Settings = () => {
  const t = useAccText();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { data, mutate } = useAccGet<{ negativeTreasury: string; matchDays: number } | null>("/acc/settings", (d) => (d && typeof d === "object" ? (d as { negativeTreasury: string; matchDays: number }) : null));
  const [policy, setPolicy] = useState<string | null>(null);
  const [days, setDays] = useState<string | null>(null);
  const p = policy ?? data?.negativeTreasury ?? "warn";
  const dd = days ?? String(data?.matchDays ?? 5);
  return (
    <section className={classes.card}>
      <div className={classes.form}>
        <label className={classes.field}>
          <span>{t("accNegativePolicy")}</span>
          <select value={p} disabled={!canWrite} onChange={(e) => setPolicy(e.target.value)}>
            <option value="allow">{t("accNegAllow")}</option>
            <option value="warn">{t("accNegWarn")}</option>
            <option value="block">{t("accNegBlock")}</option>
          </select>
        </label>
        <label className={classes.field}>
          <span>{t("accMatchDays")}</span>
          <input value={dd} dir="ltr" inputMode="numeric" disabled={!canWrite} onChange={(e) => setDays(e.target.value)} />
        </label>
      </div>
      <p className={classes.muted}>{t("accNegativeHint")}</p>
      {canWrite && (
        <div className={classes.actions}>
          <button type="button" className={classes.primary} onClick={async () => (await call("/acc/settings", "PUT", { negativeTreasury: p, matchDays: Number(dd) || 0 })) && mutate()}>
            {t("bizSave")}
          </button>
        </div>
      )}
    </section>
  );
};

const ChequesTab = () => {
  const t = useAccText();
  const [view, setView] = useView(["register", "trust", "books"] as const, "register");
  return (
    <div className={classes.main}>
      <SubNav
        value={view}
        onChange={setView}
        items={[
          ["register", t("accChequeRegister")],
          ["trust", t("accTrustCheques")],
          ["books", t("accCheckbooks")],
        ]}
      />
      {view === "register" && <Cheques extra={(p, refresh) => <ChequeExtra p={p} refresh={refresh} />} />}
      {view === "trust" && <TrustCheques />}
      {view === "books" && <Checkbooks />}
    </div>
  );
};

const TABS = ["accounts", "ledger", "transfers", "cheques", "bank", "settlements", "settings"] as const;

const Body = () => {
  const t = useAccText();
  const [tab, setTab] = useView(TABS, "accounts", "tab");
  return (
    <ClientTabSystem
      viewState={[tab, (v) => setTab(v as (typeof TABS)[number])]}
      items={[
        { id: "accounts", title: t("accTreasuryAccounts"), content: <Accounts /> },
        { id: "ledger", title: t("accTreasuryLedger"), content: <section className={classes.card}><TreasuryLedger /></section> },
        { id: "transfers", title: t("accTransfers"), content: <Transfers /> },
        { id: "cheques", title: t("finTabCheques"), content: <ChequesTab /> },
        { id: "bank", title: t("accBankRec"), content: <BankRec /> },
        { id: "settlements", title: t("accSettlements"), content: <AccSettlements /> },
        { id: "settings", title: t("accTreasurySettings"), content: <Settings /> },
      ]}
    />
  );
};

const AccTreasury = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="accTreasuryTitle" subtitle="accTreasurySubtitle" segment="treasury">
    <Body />
  </FinanceShell>
);

export default AccTreasury;
