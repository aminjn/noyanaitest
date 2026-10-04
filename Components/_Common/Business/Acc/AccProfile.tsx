"use client";

import { useRef, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, BizAccount, isoDay, useBiz, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import { parseAmount } from "../Finance/finShared";
import { AccParty, AmountInput, ConfirmButton, ExportBar, monthStart, MoneySelect, PartyPicker, RangeFilter, rangeQs, SimplePopup, useAccCall, useAccGet, useAccPopup, useAccText, useOpenVoucher } from "./accShared";

// The per-profile layer of the finance pages (2026-10): what each kind of
// provider sees first on its overview (a pharmacy its distributors,
// post-dated cheques and the subsidy difference; a hospital the insurers,
// the doctors' share and inpatient deposits; an insurer its claims payable
// and reserves; a doctor what Noyan owes it and its visits by type), the
// everyday entries only that profile has, and income in the profile's own
// grouping (visit type, drug class, lab section, ward, insurer).

type Profile = NodeWithAcl;

// the tiles of each profile: account roles, read from the chart's balances
const TILES: Record<Profile, { role: string; key: string }[]> = {
  doctor: [
    { role: "noyanPending", key: "accTileNoyanPending" },
    { role: "receivable", key: "accTileReceivable" },
    { role: "insuranceReceivable", key: "accTileInsurers" },
    { role: "payable", key: "accTilePayable" },
  ],
  clinic: [
    { role: "insuranceReceivable", key: "accTileInsurers" },
    { role: "doctorsSharePayable", key: "accTileDoctorsShare" },
    { role: "patientDeposits", key: "accTileDeposits" },
    { role: "payable", key: "accTilePayable" },
  ],
  hospital: [
    { role: "insuranceReceivable", key: "accTileInsurers" },
    { role: "doctorsSharePayable", key: "accTileDoctorsShare" },
    { role: "patientDeposits", key: "accTileDeposits" },
    { role: "inventory", key: "accTileDrugStock" },
  ],
  pharmacy: [
    { role: "payable", key: "accTileDistributors" },
    { role: "chequesPayable", key: "accTileChequesIssued" },
    { role: "subsidyReceivable", key: "accTileSubsidy" },
    { role: "insuranceReceivable", key: "accTileRxInsurers" },
  ],
  paraClinic: [
    { role: "insuranceReceivable", key: "accTileInsurers" },
    { role: "supplies", key: "accTileKits" },
    { role: "payable", key: "accTilePayable" },
    { role: "receivable", key: "accTileReceivable" },
  ],
  insurance: [
    { role: "claimsPayable", key: "accTileClaimsPayable" },
    { role: "claimReserve", key: "accTileReserve" },
    { role: "receivable", key: "accTilePolicyholders" },
    { role: "corporateReceivable", key: "accTileCorporate" },
  ],
};

type Entry = { key: string; partyKind: string; needsParty: boolean; money: boolean };

const EntryForm = ({ entry, onDone }: { entry: Entry; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [amt, setAmt] = useState("");
  const [party, setParty] = useState<AccParty | null>(null);
  const [money, setMoney] = useState("");
  const [description, setDescription] = useState("");
  const [release, setRelease] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  return (
    <SimplePopup title={t(`accEntry_${entry.key}`)}>
      <p className={classes.muted}>{t(`accEntryHint_${entry.key}`)}</p>
      <div className={classes.form}>
        <AmountInput label={t("bizAmount")} value={amt} onChange={setAmt} />
        {entry.needsParty && <PartyPicker value={party} onChange={setParty} kinds={[entry.partyKind]} label={t("accParty")} />}
        {entry.money && <MoneySelect value={money} onChange={setMoney} />}
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(x) => setDate(x)} />
        </div>
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("bizDescription")}</span>
          <input value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      {entry.key === "reserve" && (
        <label className={fin.check} style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={release} onChange={(e) => setRelease(e.target.checked)} />
          {t("accReserveRelease")}
        </label>
      )}
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button
          type="button"
          className={classes.primary}
          disabled={!parseAmount(amt) || (entry.needsParty && !party) || (entry.money && !money)}
          onClick={async () => {
            if (await call(`/acc/profile/entries/${entry.key}`, "POST", { amount: parseAmount(amt), party: party?._id, money: money || undefined, description, date: isoDay(date), release })) {
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

// the profile's tiles and its own entries, on top of the overview
export const AccProfilePanel = ({ node }: { node: Profile }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const { open } = useAccPopup();
  const { data: accounts, mutate } = useBizAccounts();
  const { data: profile } = useAccGet<{ entries: Entry[] } | null>("/acc/profile", (d) => (d && typeof d === "object" ? (d as { entries: Entry[] }) : null));
  const rows = asArray<BizAccount>(accounts);
  const tiles = (TILES[node] || []).map((x) => ({ ...x, account: rows.find((a) => a.role === x.role) })).filter((x) => x.account);
  if (!tiles.length && !asArray(profile?.entries).length) return null;
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <h2 className={classes.cardTitle}>{t(`accProfileTitle_${node}`)}</h2>
        {canWrite && (
          <div className={acc.tools}>
            {asArray<Entry>(profile?.entries).map((e) => (
              <button key={e.key} type="button" onClick={() => open("AccEntry", <EntryForm entry={e} onDone={() => mutate()} />)}>
                {t(`accEntry_${e.key}`)}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={classes.tiles}>
        {tiles.map((x) => (
          <div key={x.role} className={classes.tile}>
            <span className={classes.tileLabel}>{t(x.key)}</span>
            <span className={classes.tileValue}>
              {f.signed(x.account!.balance)}
              <span className={classes.tileUnit}>{t("toman")}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

type Income = { accounts: { _id: string; code: string; name: string; net: number }[]; centers: { _id: string; name: string; net: number }[]; insurers: { _id: string; name: string; billed: number; received: number; open: number }[] };
type PEntry = { _id: string; number: number; date: string; kind: string; description: string; label?: string; amount: number; void: boolean };

// income in the profile's own grouping, and its entries
export const AccProfileIncome = ({ node }: { node: Profile }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const openVoucher = useOpenVoucher();
  const ref = useRef<HTMLDivElement>(null);
  const [from, setFrom] = useState<Date | null>(monthStart());
  const [to, setTo] = useState<Date | null>(null);
  const { data, error } = useAccGet<Income | null>(`/acc/profile/income?${rangeQs(from, to)}`, (d) => (d && typeof d === "object" ? (d as Income) : null));
  const { data: entries, mutate } = useAccGet<PEntry[]>("/acc/profile/entries", (d) => asArray<PEntry>(d));
  const accs = asArray<Income["accounts"][number]>(data?.accounts);
  const centers = asArray<Income["centers"][number]>(data?.centers);
  const insurers = asArray<Income["insurers"][number]>(data?.insurers);
  const total = accs.reduce((s, a) => s + a.net, 0);
  return (
    <section className={classes.card}>
      <RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo} />
      <HandleLoading data={!!data} error={error}>
        <div ref={ref} className={classes.main}>
          <div className={acc.bar}>
            <h3 className={classes.cardTitle}>{t(`accIncomeBy_${node}`)}</h3>
            <ExportBar
              printRef={ref}
              sheet={() => ({
                title: t(`accIncomeBy_${node}`),
                head: [t("bizCode"), t("bizName"), t("bizAmount"), "%"],
                rows: accs.map((a) => [a.code, a.name, a.net, total ? Math.round((a.net / total) * 1000) / 10 : 0]),
              })}
            />
          </div>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <tbody>
                {!accs.length && (
                  <tr>
                    <td className={classes.empty}>{t("bizEmpty")}</td>
                  </tr>
                )}
                {accs.map((a) => (
                  <tr key={a._id}>
                    <td className={classes.wrap}>{a.name}</td>
                    <td className={classes.num}>{f.money(a.net)}</td>
                    <td className={classes.num}>{total ? `${f.money(Math.round((a.net / total) * 100))}٪` : "—"}</td>
                  </tr>
                ))}
                {!!accs.length && (
                  <tr className={classes.footRow}>
                    <td>{t("bizTotal")}</td>
                    <td className={classes.num}>{f.money(total)}</td>
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {!!centers.length && (
            <>
              <h3 className={classes.cardTitle}>{t(`accCentersBy_${node}`)}</h3>
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <tbody>
                    {centers.map((c) => (
                      <tr key={c._id || "none"}>
                        <td className={classes.wrap}>{c._id ? c.name : t("bizNoCostCenter")}</td>
                        <td className={classes.num}>{f.money(c.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {!!insurers.length && (
            <>
              <h3 className={classes.cardTitle}>{t("accByInsurer")}</h3>
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("finInsurer")}</th>
                      <th className={classes.num}>{t("accBilled")}</th>
                      <th className={classes.num}>{t("accReceived")}</th>
                      <th className={classes.num}>{t("accRemaining")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insurers.map((i) => (
                      <tr key={i._id}>
                        <td className={classes.wrap}>{i.name}</td>
                        <td className={classes.num}>{f.money(i.billed)}</td>
                        <td className={classes.num}>{f.money(i.received)}</td>
                        <td className={classes.num}>{f.money(i.open)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </HandleLoading>
      {!!asArray(entries).length && (
        <>
          <h3 className={classes.cardTitle}>{t("accProfileEntries")}</h3>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <tbody>
                {asArray<PEntry>(entries).map((e) => (
                  <tr key={e._id} style={{ opacity: e.void ? 0.5 : 1 }}>
                    <td>{f.date(e.date)}</td>
                    <td>
                      <button type="button" className={fin.link} onClick={() => openVoucher(e._id)}>
                        {t(`accEntry_${e.kind}`)}
                      </button>
                    </td>
                    <td className={classes.wrap}>{e.label || e.description}</td>
                    <td className={classes.num}>{f.money(e.amount)}</td>
                    <td>
                      {e.void ? (
                        <span className={`${fin.pill} ${fin.toneMuted}`}>{t("finStVoid")}</span>
                      ) : (
                        canWrite && <ConfirmButton danger label={t("accVoid")} confirm={t("accVoidEntryConfirm")} onConfirm={async () => (await call(`/acc/profile/entries/${e._id}/void`, "POST", {})) && mutate()} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};
