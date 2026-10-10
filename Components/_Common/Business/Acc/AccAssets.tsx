"use client";
import { flowArrow } from "@/Components/helpers/flowArrow";

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
import CostCenterSelect from "../CostCenterSelect";
import FinanceShell from "../Finance/FinanceShell";
import { parseAmount } from "../Finance/finShared";
import { AmountInput, ConfirmButton, ExportBar, MoneySelect, SimplePopup, SubNav, useAccCall, useAccGet, useAccPopup, useAccText, useView } from "./accShared";

// «دارایی‌های ثابت» (2026-10), a port of Nexxa's accounting/assets pages
// (assets, groups with the Iranian ماده‌ی ۱۴۹ presets, depreciation runs -
// straight-line or declining, never twice for one month - disposals with
// gain or loss, transfers of location / custodian, maintenance with its
// expense, IAS 16 revaluation, the report). A doctor's office has no
// revaluation desk; the rest of the profiles do.

type Asset = {
  _id: string;
  code: string;
  name: string;
  category: string;
  group?: string;
  account: string;
  acquisitionDate: string;
  inServiceDate?: string;
  cost: number;
  salvageValue: number;
  usefulLifeYears: number;
  method: "straight" | "declining";
  decliningRate: number;
  accumulatedDep: number;
  bookValue: number;
  lastDepDate?: string;
  state: "active" | "disposed";
  serial?: string;
  location?: string;
  custodian?: string;
  disposalDate?: string;
  disposalProceeds?: number;
  revaluationSurplus?: number;
  due?: number;
};
type Group = {
  _id: string;
  name: string;
  usefulLifeYears: number;
  method: "straight" | "declining";
  decliningRate: number;
  account?: string;
  // seeded from a preset: the official ماده‌ی ۱۴۹ row it follows (null: not confirmed)
  presetKey?: string;
  taxRef?: { group?: number; row?: number | null } | null;
};

// the official row of a preset group, as a hint (nothing for an owner's own group)
const TaxRefHint = ({ g }: { g?: Group }) => {
  const t = useAccText();
  const f = useBizFormat();
  if (!g?.presetKey) return null;
  const ref = g.taxRef;
  const text =
    ref && typeof ref.group === "number"
      ? typeof ref.row === "number"
        ? t("accTaxRef", [f.money(ref.group), f.money(ref.row)])
        : t("accTaxRefGroup", [f.money(ref.group)])
      : t("accTaxRefUnconfirmed");
  return <span className={classes.muted}>{text}</span>;
};
type Event = { _id: string; asset: string; assetName?: string; assetCode?: string; kind: string; date: string; note?: string; fromLocation?: string; toLocation?: string; fromCustodian?: string; toCustodian?: string; maintenanceKind?: string; cost?: number; vendor?: string; nextDueDate?: string; oldNbv?: number; fairValue?: number; surplus?: number; voucherRef?: string };

const useGroups = () => useAccGet<Group[]>("/acc/assets/groups", (d) => asArray<Group>(d));
const assetAccounts = (rows: BizAccount[]) => rows.filter((a) => a.level === "detail" && a.parentCode === "25" && a.role !== "accumulatedDepreciation");

const AssetForm = ({ onDone }: { onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const { data: groups } = useGroups();
  const { data: accounts } = useBizAccounts();
  const [d, setD] = useState({ name: "", code: "", serial: "", location: "", custodian: "", vendor: "" });
  const [group, setGroup] = useState("");
  const [account, setAccount] = useState("");
  const [cost, setCost] = useState("");
  const [salvage, setSalvage] = useState("");
  const [prior, setPrior] = useState("");
  const [life, setLife] = useState("");
  const [method, setMethod] = useState("");
  const [rate, setRate] = useState("");
  const [book, setBook] = useState<"money" | "payable" | "opening" | "none">("money");
  const [money, setMoney] = useState("");
  const [center, setCenter] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [inService, setInService] = useState<Date | null>(null);
  const g = asArray<Group>(groups).find((x) => x._id === group);
  const field = (k: keyof typeof d, label: string, ltr?: boolean) => (
    <label className={classes.field}>
      <span>{label}</span>
      <input value={d[k]} dir={ltr ? "ltr" : undefined} onChange={(e) => setD((p) => ({ ...p, [k]: e.target.value }))} />
    </label>
  );
  const save = async () => {
    const res = await call("/acc/assets", "POST", {
      ...d,
      group: group || undefined,
      account: account || undefined,
      cost: parseAmount(cost),
      salvageValue: parseAmount(salvage),
      usefulLifeYears: life ? Number(life) : undefined,
      method: method || undefined,
      decliningRate: rate ? Number(rate) : undefined,
      acquisitionDate: isoDay(date),
      inServiceDate: inService ? isoDay(inService) : undefined,
      book,
      money: book === "money" ? money : undefined,
      priorDepreciation: book === "opening" ? parseAmount(prior) : undefined,
      center: center || undefined,
    });
    if (res) {
      closePopup();
      onDone();
    }
  };
  return (
    <SimplePopup title={t("accNewAsset")} wide>
      <div className={classes.form}>
        {field("name", t("accAssetName"))}
        {field("code", t("accCodeOptional"), true)}
        <label className={classes.field}>
          <span>{t("accAssetGroup")}</span>
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">{t("accNoGroup")}</option>
            {asArray<Group>(groups).map((x) => (
              <option key={x._id} value={x._id}>
                {x.name}
              </option>
            ))}
          </select>
          <TaxRefHint g={g} />
        </label>
        <label className={classes.field}>
          <span>{t("accAssetAccount")}</span>
          <select value={account} onChange={(e) => setAccount(e.target.value)}>
            <option value="">{t("accFromGroup")}</option>
            {assetAccounts(asArray<BizAccount>(accounts)).map((a) => (
              <option key={a._id} value={a._id}>
                {a.code} · {a.name}
              </option>
            ))}
          </select>
        </label>
        <AmountInput label={t("accCost")} value={cost} onChange={setCost} />
        <label className={classes.field}>
          <span>{t("accSalvage")}</span>
          <AmountInput value={salvage} onChange={setSalvage} />
          <span className={classes.muted}>{t("accSalvageTaxHint")}</span>
        </label>
        <label className={classes.field}>
          <span>{t("accMethod")}</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">{g ? t(g.method === "declining" ? "accDeclining" : "accStraight") : t("accStraight")}</option>
            <option value="straight">{t("accStraight")}</option>
            <option value="declining">{t("accDeclining")}</option>
          </select>
        </label>
        <label className={classes.field}>
          <span>{t("accUsefulLife")}</span>
          <input value={life} dir="ltr" inputMode="numeric" placeholder={g ? String(g.usefulLifeYears) : "5"} onChange={(e) => setLife(e.target.value)} />
        </label>
        <label className={classes.field}>
          <span>{t("accDecliningRate")}</span>
          <input value={rate} dir="ltr" inputMode="decimal" placeholder={g ? String(g.decliningRate) : "0"} onChange={(e) => setRate(e.target.value)} />
        </label>
        <div className={classes.field}>
          <DateInput title={t("accAcquisitionDate")} defaultValue={date} onChange={(x) => setDate(x)} />
        </div>
        <div className={classes.field}>
          <DateInput title={t("accInServiceDate")} defaultValue={inService || undefined} onChange={(x) => setInService(x)} />
          <span className={classes.muted}>{t("accInServiceHint")}</span>
        </div>
        {field("serial", t("accSerial"), true)}
        {field("location", t("accLocation"))}
        {field("custodian", t("accCustodian"))}
        <CostCenterSelect value={center} onChange={setCenter} />
      </div>
      <div className={classes.field}>
        <span>{t("accBookPurchase")}</span>
        <SubNav
          value={book}
          onChange={setBook}
          items={[
            ["money", t("accPaidFromTreasury")],
            ["payable", t("accOnCredit")],
            ["opening", t("accExistingAsset")],
            ["none", t("accNoVoucher")],
          ]}
        />
      </div>
      <div className={classes.form}>
        {book === "money" && <MoneySelect value={money} onChange={setMoney} />}
        {book === "payable" && field("vendor", t("finVendor"))}
        {book === "opening" && <AmountInput label={t("accPriorDepreciation")} value={prior} onChange={setPrior} />}
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button type="button" className={classes.primary} disabled={d.name.trim().length < 2 || !parseAmount(cost) || (book === "money" && !money)} onClick={save}>
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

const ActionForm = ({ asset, kind, onDone }: { asset: Asset; kind: "dispose" | "revalue" | "transfer" | "maintenance"; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [date, setDate] = useState<Date>(new Date());
  const [amt, setAmt] = useState("");
  const [money, setMoney] = useState("");
  const [note, setNote] = useState("");
  const [location, setLocation] = useState(asset.location || "");
  const [custodian, setCustodian] = useState(asset.custodian || "");
  const [mkind, setMkind] = useState("repair");
  const [vendor, setVendor] = useState("");
  const [next, setNext] = useState<Date | null>(null);
  const [book, setBook] = useState(true);
  const title = { dispose: t("accDispose"), revalue: t("accRevalue"), transfer: t("accTransferAsset"), maintenance: t("accMaintenance") }[kind];
  const save = async () => {
    const payload =
      kind === "dispose"
        ? { date: isoDay(date), proceeds: parseAmount(amt), money: money || undefined, note }
        : kind === "revalue"
          ? { date: isoDay(date), fairValue: parseAmount(amt), note }
          : kind === "transfer"
            ? { date: isoDay(date), location, custodian, note }
            : { date: isoDay(date), kind: mkind, cost: parseAmount(amt), vendor, note, nextDueDate: next ? isoDay(next) : undefined, book: book && !!parseAmount(amt), money: money || undefined };
    if (await call(`/acc/assets/${asset._id}/${kind}`, "POST", payload)) {
      closePopup("AccAssetAction");
      onDone();
    }
  };
  return (
    <SimplePopup title={`${title} · ${asset.name}`}>
      <p className={classes.muted}>{t(`accHint_${kind}`)}</p>
      <div className={classes.form}>
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(x) => setDate(x)} />
        </div>
        {kind === "dispose" && <AmountInput label={t("accProceeds")} value={amt} onChange={setAmt} />}
        {kind === "dispose" && parseAmount(amt) > 0 && <MoneySelect value={money} onChange={setMoney} />}
        {kind === "revalue" && <AmountInput label={t("accFairValue")} value={amt} onChange={setAmt} />}
        {kind === "transfer" && (
          <>
            <label className={classes.field}>
              <span>{t("accLocation")}</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} />
            </label>
            <label className={classes.field}>
              <span>{t("accCustodian")}</span>
              <input value={custodian} onChange={(e) => setCustodian(e.target.value)} />
            </label>
          </>
        )}
        {kind === "maintenance" && (
          <>
            <label className={classes.field}>
              <span>{t("accMaintenanceKind")}</span>
              <select value={mkind} onChange={(e) => setMkind(e.target.value)}>
                {["repair", "service", "inspection", "upgrade"].map((k) => (
                  <option key={k} value={k}>
                    {t(`accMnt_${k}`)}
                  </option>
                ))}
              </select>
            </label>
            <AmountInput label={t("accCost")} value={amt} onChange={setAmt} />
            <label className={classes.field}>
              <span>{t("finVendor")}</span>
              <input value={vendor} onChange={(e) => setVendor(e.target.value)} />
            </label>
            <div className={classes.field}>
              <DateInput title={t("accNextDue")} onChange={(x) => setNext(x)} onClear={() => setNext(null)} />
            </div>
            {parseAmount(amt) > 0 && <MoneySelect value={money} onChange={setMoney} />}
          </>
        )}
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("accNote")}</span>
          <input value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
      {kind === "maintenance" && (
        <label className={fin.check} style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={book} onChange={(e) => setBook(e.target.checked)} />
          {t("accBookExpense")}
        </label>
      )}
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup("AccAssetAction")}>
          {t("bizCancel")}
        </button>
        <button type="button" className={kind === "dispose" ? classes.danger : classes.primary} disabled={kind === "revalue" && !amt} onClick={save}>
          {title}
        </button>
      </div>
    </SimplePopup>
  );
};

const AssetDetail = ({ id, onChanged, revalue }: { id: string; onChanged: () => unknown; revalue: boolean }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const { closePopup } = usePopup();
  const { data, error, mutate } = useAccGet<{ asset: Asset; events: Event[]; schedule: { month: number; dep: number; accumulated: number; bookValue: number }[] } | null>(`/acc/assets/${id}`, (d) =>
    d && typeof d === "object" ? (d as { asset: Asset; events: Event[]; schedule: { month: number; dep: number; accumulated: number; bookValue: number }[] }) : null,
  );
  const changed = () => {
    mutate();
    onChanged();
  };
  const a = data?.asset;
  return (
    <SimplePopup title={a ? `${a.code} · ${a.name}` : t("accAssets")} wide>
      <HandleLoading data={!!data} error={error}>
        {!!a && (
          <>
            <div className={classes.tiles}>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accCost")}</span>
                <span className={classes.tileValue}>{f.money(a.cost)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accAccumulated")}</span>
                <span className={classes.tileValue}>{f.money(a.accumulatedDep)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accBookValue")}</span>
                <span className={classes.tileValue}>{f.money(a.bookValue)}</span>
              </div>
            </div>
            <dl className={fin.kv}>
              <div>
                <dt>{t("accMethod")}</dt>
                <dd>
                  {t(a.method === "declining" ? "accDeclining" : "accStraight")} · {a.method === "declining" ? `${f.money(a.decliningRate)}٪` : t("accYearsN", [f.money(a.usefulLifeYears)])}
                </dd>
              </div>
              <div>
                <dt>{t("accAcquisitionDate")}</dt>
                <dd>{f.date(a.acquisitionDate)}</dd>
              </div>
              {a.inServiceDate && (
                <div>
                  <dt>{t("accInServiceDate")}</dt>
                  <dd>{f.date(a.inServiceDate)}</dd>
                </div>
              )}
              <div>
                <dt>{t("accLocation")}</dt>
                <dd>{[a.location, a.custodian].filter(Boolean).join(" · ") || "—"}</dd>
              </div>
              {a.state === "disposed" && (
                <div>
                  <dt>{t("accDisposedOn")}</dt>
                  <dd>
                    <bdi>{f.date(a.disposalDate)}</bdi> · <bdi>{f.money(a.disposalProceeds)}</bdi>
                  </dd>
                </div>
              )}
            </dl>
            {canWrite && a.state === "active" && (
              <div className={acc.tools}>
                <button type="button" onClick={() => open("AccAssetAction", <ActionForm asset={a} kind="transfer" onDone={changed} />)}>
                  {t("accTransferAsset")}
                </button>
                <button type="button" onClick={() => open("AccAssetAction", <ActionForm asset={a} kind="maintenance" onDone={changed} />)}>
                  {t("accMaintenance")}
                </button>
                {revalue && (
                  <button type="button" onClick={() => open("AccAssetAction", <ActionForm asset={a} kind="revalue" onDone={changed} />)}>
                    {t("accRevalue")}
                  </button>
                )}
                <button type="button" onClick={() => open("AccAssetAction", <ActionForm asset={a} kind="dispose" onDone={changed} />)}>
                  {t("accDispose")}
                </button>
                {!a.lastDepDate && (
                  <ConfirmButton
                    danger
                    label={t("bizDelete")}
                    confirm={t("accDeleteAssetConfirm")}
                    onConfirm={async () => {
                      if (await call(`/acc/assets/${a._id}`, "DELETE", undefined, t("bizDeleted"))) {
                        closePopup();
                        onChanged();
                      }
                    }}
                  />
                )}
              </div>
            )}
            {!!asArray(data?.schedule).length && (
              <>
                <h3 className={classes.cardTitle}>{t("accSchedule")}</h3>
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("accMonthN")}</th>
                        <th className={classes.num}>{t("accDepreciation")}</th>
                        <th className={classes.num}>{t("accAccumulated")}</th>
                        <th className={classes.num}>{t("accBookValue")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asArray<{ month: number; dep: number; accumulated: number; bookValue: number }>(data?.schedule)
                        .slice(0, 12)
                        .map((r) => (
                          <tr key={r.month}>
                            <td>{f.money(r.month)}</td>
                            <td className={classes.num}>{f.money(r.dep)}</td>
                            <td className={classes.num}>{f.money(r.accumulated)}</td>
                            <td className={classes.num}>{f.money(r.bookValue)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {!!asArray(data?.events).length && <EventsTable events={asArray<Event>(data?.events)} onChanged={changed} />}
          </>
        )}
      </HandleLoading>
    </SimplePopup>
  );
};

const EventsTable = ({ events, onChanged, showAsset }: { events: Event[]; onChanged: () => unknown; showAsset?: boolean }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const detail = (e: Event) =>
    e.kind === "transfer"
      ? `${[e.fromLocation, e.fromCustodian].filter(Boolean).join(" · ") || "—"}${flowArrow()}${[e.toLocation, e.toCustodian].filter(Boolean).join(" · ") || "—"}`
      : e.kind === "maintenance"
        ? `${t(`accMnt_${e.maintenanceKind || "repair"}`)} · ${f.money(e.cost)}${e.vendor ? ` · ${e.vendor}` : ""}${e.nextDueDate ? ` · ${t("accNextDue")} ${f.date(e.nextDueDate)}` : ""}`
        : `${f.money(e.oldNbv)} → ${f.money(e.fairValue)} (${f.signed(e.surplus)})`;
  return (
    <div className={classes.tableWrap}>
      <table className={classes.table}>
        <thead>
          <tr>
            <th>{t("bizDate")}</th>
            {showAsset && <th>{t("accAssets")}</th>}
            <th>{t("accEvent")}</th>
            <th>{t("accNote")}</th>
            {canWrite && <th />}
          </tr>
        </thead>
        <tbody>
          {!events.length && (
            <tr>
              <td colSpan={5} className={classes.empty}>
                {t("bizEmpty")}
              </td>
            </tr>
          )}
          {events.map((e) => (
            <tr key={e._id}>
              <td>{f.date(e.date)}</td>
              {showAsset && <td className={classes.wrap}>{[e.assetCode, e.assetName].filter(Boolean).join(" · ")}</td>}
              <td className={classes.wrap}>{detail(e)}</td>
              <td className={classes.wrap}>{e.note || "—"}</td>
              {canWrite && (
                <td>
                  {e.kind !== "transfer" && (
                    <ConfirmButton danger label={e.kind === "revaluation" ? t("accUndo") : t("bizDelete")} confirm={t("bizDeleteConfirm")} onConfirm={async () => (await call(`/acc/assets/events/${e._id}`, "DELETE")) && onChanged()} />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AssetList = ({ state, revalue }: { state: "active" | "disposed"; revalue: boolean }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const { data, error, mutate } = useAccGet<Asset[]>(`/acc/assets?state=${state}${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : ""}`, (d) => asArray<Asset>(d));
  const rows = asArray<Asset>(data);
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <div className={classes.filters}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("bizSearch")} aria-label={t("bizSearch")} />
        </div>
        <div className={acc.tools}>
          <ExportBar
            printRef={ref}
            sheet={() => ({
              title: t(state === "active" ? "accAssets" : "accDisposals"),
              head: [t("bizCode"), t("accAssetName"), t("accAssetGroup"), t("accCost"), t("accAccumulated"), t("accBookValue"), t("accLocation")],
              rows: rows.map((a) => [a.code, a.name, a.category, a.cost, a.accumulatedDep, a.bookValue, a.location || ""]),
            })}
          />
          {canWrite && state === "active" && (
            <button type="button" className={classes.primary} onClick={() => open("AccAssetForm", <AssetForm onDone={() => mutate()} />)}>
              {t("accNewAsset")}
            </button>
          )}
        </div>
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap} ref={ref}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizCode")}</th>
                <th>{t("accAssetName")}</th>
                <th>{t("accAssetGroup")}</th>
                <th className={classes.num}>{t("accCost")}</th>
                <th className={classes.num}>{t("accAccumulated")}</th>
                <th className={classes.num}>{t("accBookValue")}</th>
                {state === "disposed" && <th>{t("accDisposedOn")}</th>}
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
              {rows.map((a) => (
                <tr key={a._id} className={classes.rowLink} onClick={() => open("AccAsset", <AssetDetail id={a._id} onChanged={() => mutate()} revalue={revalue} />)}>
                  <td>{a.code}</td>
                  <td className={classes.wrap}>{a.name}</td>
                  <td className={classes.wrap}>{a.category || "—"}</td>
                  <td className={classes.num}>{f.money(a.cost)}</td>
                  <td className={classes.num}>{f.money(a.accumulatedDep)}</td>
                  <td className={classes.num}>{f.money(a.bookValue)}</td>
                  {state === "disposed" && <td>{f.date(a.disposalDate)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
    </section>
  );
};

const GroupForm = ({ group, onDone }: { group?: Group; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const { data: accounts } = useBizAccounts();
  const [name, setName] = useState(group?.name || "");
  const [life, setLife] = useState(String(group?.usefulLifeYears ?? 5));
  const [method, setMethod] = useState<string>(group?.method || "straight");
  const [rate, setRate] = useState(String(group?.decliningRate ?? 0));
  const [account, setAccount] = useState(group?.account || "");
  return (
    <SimplePopup title={group ? group.name : t("accNewGroup")}>
      <TaxRefHint g={group} />
      <div className={classes.form}>
        <label className={classes.field}>
          <span>{t("accAssetName")}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className={classes.field}>
          <span>{t("accMethod")}</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="straight">{t("accStraight")}</option>
            <option value="declining">{t("accDeclining")}</option>
          </select>
        </label>
        <label className={classes.field}>
          <span>{t("accUsefulLife")}</span>
          <input value={life} dir="ltr" inputMode="numeric" onChange={(e) => setLife(e.target.value)} />
        </label>
        <label className={classes.field}>
          <span>{t("accDecliningRate")}</span>
          <input value={rate} dir="ltr" inputMode="decimal" onChange={(e) => setRate(e.target.value)} />
        </label>
        <label className={classes.field}>
          <span>{t("accAssetAccount")}</span>
          <select value={account} onChange={(e) => setAccount(e.target.value)}>
            <option value="">{t("bizSelect")}</option>
            {assetAccounts(asArray<BizAccount>(accounts)).map((a) => (
              <option key={a._id} value={a._id}>
                {a.code} · {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button
          type="button"
          className={classes.primary}
          disabled={name.trim().length < 2}
          onClick={async () => {
            if (await call("/acc/assets/groups", "POST", { id: group?._id, name, usefulLifeYears: Number(life) || 5, method, decliningRate: Number(rate) || 0, account: account || undefined })) {
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

const Groups = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const { data, error, mutate } = useGroups();
  const rows = asArray<Group>(data);
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <span className={classes.muted}>{t("accGroupsHint")}</span>
        {canWrite && (
          <div className={acc.tools}>
            <button type="button" onClick={async () => (await call("/acc/assets/groups/seed", "POST", {})) && mutate()}>
              {t("accSeedGroups")}
            </button>
            <button type="button" className={classes.primary} onClick={() => open("AccGroupForm", <GroupForm onDone={() => mutate()} />)}>
              {t("accNewGroup")}
            </button>
          </div>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("accAssetName")}</th>
                <th>{t("accMethod")}</th>
                <th className={classes.num}>{t("accUsefulLife")}</th>
                <th className={classes.num}>{t("accDecliningRate")}</th>
                {canWrite && <th />}
              </tr>
            </thead>
            <tbody>
              {!rows.length && (
                <tr>
                  <td colSpan={5} className={classes.empty}>
                    {t("bizEmpty")}
                  </td>
                </tr>
              )}
              {rows.map((g) => (
                <tr key={g._id}>
                  <td className={classes.wrap}>
                    <div>{g.name}</div>
                    <TaxRefHint g={g} />
                  </td>
                  <td>{t(g.method === "declining" ? "accDeclining" : "accStraight")}</td>
                  <td className={classes.num}>{f.money(g.usefulLifeYears)}</td>
                  <td className={classes.num}>{f.money(g.decliningRate)}</td>
                  {canWrite && (
                    <td>
                      <div className={fin.rowActions}>
                        <button type="button" onClick={() => open("AccGroupForm", <GroupForm group={g} onDone={() => mutate()} />)}>
                          {t("bizEdit")}
                        </button>
                        <ConfirmButton danger label={t("bizDelete")} confirm={t("bizDeleteConfirm")} onConfirm={async () => (await call(`/acc/assets/groups/${g._id}`, "DELETE", undefined, t("bizDeleted"))) && mutate()} />
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

const Depreciation = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const call = useAccCall();
  const { data, error, mutate } = useAccGet<Asset[]>("/acc/assets?state=active", (d) => asArray<Asset>(d));
  const rows = asArray<Asset>(data);
  const due = rows.reduce((s, a) => s + (a.due || 0), 0);
  return (
    <section className={classes.card}>
      <div className={acc.bar}>
        <span className={classes.cardTitle}>{t("accDepDue", [f.money(due)])}</span>
        {canWrite && (
          <button type="button" className={classes.primary} disabled={!due} onClick={async () => (await call("/acc/assets/depreciate", "POST", {}, t("accDepDone"))) && mutate()}>
            {t("accRunDepreciation")}
          </button>
        )}
      </div>
      <p className={classes.muted}>{t("accDepHint")}</p>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("accAssetName")}</th>
                <th>{t("accLastRun")}</th>
                <th className={classes.num}>{t("accBookValue")}</th>
                <th className={classes.num}>{t("accDueNow")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a._id}>
                  <td className={classes.wrap}>{a.name}</td>
                  <td>{a.lastDepDate ? f.date(a.lastDepDate) : "—"}</td>
                  <td className={classes.num}>{f.money(a.bookValue)}</td>
                  <td className={classes.num}>{f.money(a.due)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
    </section>
  );
};

const Events = ({ kind }: { kind: "transfer" | "maintenance" | "revaluation" }) => {
  const { data, error, mutate } = useAccGet<Event[]>(`/acc/assets/events?kind=${kind}`, (d) => asArray<Event>(d));
  return (
    <section className={classes.card}>
      <HandleLoading data={!!data} error={error}>
        <EventsTable events={asArray<Event>(data)} onChanged={() => mutate()} showAsset />
      </HandleLoading>
    </section>
  );
};

const Report = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { data, error } = useAccGet<{ groups: { name: string; count: number; cost: number; accumulated: number; bookValue: number; disposed: number }[]; totals: { count: number; cost: number; accumulated: number }; due: Event[] } | null>(
    "/acc/assets/report",
    (d) => (d && typeof d === "object" ? (d as never) : null),
  );
  return (
    <section className={classes.card}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <div className={classes.tiles}>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accActiveAssets")}</span>
                <span className={classes.tileValue}>{f.money(data.totals.count)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accCost")}</span>
                <span className={classes.tileValue}>{f.money(data.totals.cost)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("accBookValue")}</span>
                <span className={classes.tileValue}>{f.money(data.totals.cost - data.totals.accumulated)}</span>
              </div>
            </div>
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("accAssetGroup")}</th>
                    <th className={classes.num}>{t("accCount")}</th>
                    <th className={classes.num}>{t("accCost")}</th>
                    <th className={classes.num}>{t("accAccumulated")}</th>
                    <th className={classes.num}>{t("accBookValue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {asArray<{ name: string; count: number; cost: number; accumulated: number; bookValue: number }>(data.groups).map((g, i) => (
                    <tr key={i}>
                      <td className={classes.wrap}>{g.name || "—"}</td>
                      <td className={classes.num}>{f.money(g.count)}</td>
                      <td className={classes.num}>{f.money(g.cost)}</td>
                      <td className={classes.num}>{f.money(g.accumulated)}</td>
                      <td className={classes.num}>{f.money(g.bookValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!!asArray(data.due).length && (
              <>
                <h3 className={classes.cardTitle}>{t("accServiceDue")}</h3>
                <EventsTable events={asArray<Event>(data.due)} onChanged={() => undefined} showAsset />
              </>
            )}
          </>
        )}
      </HandleLoading>
    </section>
  );
};

const Body = ({ node }: { node: NodeWithAcl }) => {
  const t = useAccText();
  const revalue = node !== "doctor";
  const TABS = ["assets", "groups", "depreciation", "disposals", "transfers", "maintenance", "revaluations", "report"] as const;
  const [tab, setTab] = useView(TABS, "assets", "tab");
  return (
    <ClientTabSystem
      viewState={[tab, (v) => setTab(v as (typeof TABS)[number])]}
      items={[
        { id: "assets", title: t("accAssets"), content: <AssetList state="active" revalue={revalue} /> },
        { id: "groups", title: t("accAssetGroups"), content: <Groups /> },
        { id: "depreciation", title: t("accDepreciation"), content: <Depreciation /> },
        { id: "disposals", title: t("accDisposals"), content: <AssetList state="disposed" revalue={revalue} /> },
        { id: "transfers", title: t("accTransfersTab"), content: <Events kind="transfer" /> },
        { id: "maintenance", title: t("accMaintenance"), content: <Events kind="maintenance" /> },
        { id: "revaluations", title: t("accRevaluations"), content: <Events kind="revaluation" />, exclude: !revalue },
        { id: "report", title: t("accAssetReport"), content: <Report /> },
      ]}
    />
  );
};

const AccAssets = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="accAssetsTitle" subtitle="accAssetsSubtitle" segment="assets">
    <Body node={node} />
  </FinanceShell>
);

export default AccAssets;
