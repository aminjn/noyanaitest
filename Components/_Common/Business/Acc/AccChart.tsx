"use client";

import { useEffect, useRef, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, BizAccount, useBiz, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import { ConfirmButton, ExportBar, PARTY_KINDS, partyKindKey, SimplePopup, SubNav, useAccCall, useAccPopup, useAccText, useAccUpload, useView } from "./accShared";
import { LedgerView } from "./AccBooks";

// The chart of accounts (2026-10), after Nexxa's account-groups,
// total-accounts, moein-accounts, accounts (the tree) and the coding
// import: گروه > کل > معین, each a page of its own here as a sub-view.
// System accounts (with a role) keep their place: they may be renamed and
// told which تفصیلی kinds they take, never deleted or deactivated. An
// account of the owner's own goes when it has no children and no lines;
// otherwise it is deactivated.

const LEVEL_KEY = { group: "accLevelGroup", total: "accLevelTotal", detail: "accLevelDetail" } as const;
const TYPES = ["asset", "liability", "equity", "income", "expense"] as const;
const typeKey = (t: string) => `accType_${t}`;

const AccountForm = ({ level, account, accounts, onDone }: { level: "group" | "total" | "detail"; account?: BizAccount; accounts: BizAccount[]; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const parents = accounts.filter((a) => a.level === (level === "detail" ? "total" : "group"));
  const [name, setName] = useState(account?.name || "");
  const [code, setCode] = useState("");
  const [parentCode, setParentCode] = useState(account?.parentCode || "");
  const [type, setType] = useState<string>(account?.type || "asset");
  const [description, setDescription] = useState(account?.description || "");
  const [nature, setNature] = useState<string>(account?.nature || "");
  const [permanent, setPermanent] = useState<boolean>(account?.permanent ?? true);
  const [kinds, setKinds] = useState<string[]>(account?.tafsiliKinds || []);
  const [isActive, setActive] = useState(account?.isActive !== false);
  const [busy, setBusy] = useState(false);
  const system = !!account?.role;
  const save = async () => {
    setBusy(true);
    const payload: Record<string, unknown> = { name: name.trim(), description: description.trim() };
    if (level === "detail") payload.tafsiliKinds = kinds;
    if (!system) Object.assign(payload, { nature: nature || undefined, permanent, isActive });
    const res = account
      ? await call(`/acc/accounts/${account._id}`, "PATCH", { ...payload, ...(level === "detail" && !system && parentCode !== account.parentCode ? { parentCode } : {}) })
      : await call("/acc/accounts", "POST", { ...payload, level, code: code.trim() || undefined, parentCode: level === "group" ? undefined : parentCode, type });
    setBusy(false);
    if (res) {
      closePopup();
      onDone();
    }
  };
  return (
    <SimplePopup title={account ? t("accEditAccount", [account.code]) : t("accNewAccountOf", [t(LEVEL_KEY[level])])}>
      <div className={classes.form}>
        {level !== "group" && (!account || (level === "detail" && !system)) && (
          <label className={classes.field}>
            <span>{t(level === "detail" ? "accLevelTotal" : "accLevelGroup")}</span>
            <select value={parentCode} onChange={(e) => setParentCode(e.target.value)}>
              <option value="">{t("bizSelect")}</option>
              {parents
                .filter((p) => !account || p.type === account.type)
                .map((p) => (
                  <option key={p._id} value={p.code}>
                    {p.code} · {p.name}
                  </option>
                ))}
            </select>
          </label>
        )}
        {level === "group" && !account && (
          <label className={classes.field}>
            <span>{t("accAccountType")}</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((x) => (
                <option key={x} value={x}>
                  {t(typeKey(x))}
                </option>
              ))}
            </select>
          </label>
        )}
        {!account && (
          <label className={classes.field}>
            <span>{t("accCodeOptional")}</span>
            <input value={code} dir="ltr" inputMode="numeric" maxLength={12} onChange={(e) => setCode(e.target.value)} />
          </label>
        )}
        <label className={classes.field}>
          <span>{t("bizName")}</span>
          <input value={name} maxLength={200} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("accAccountDescription")}</span>
          <input value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} />
        </label>
        {!system && (
          <>
            <label className={classes.field}>
              <span>{t("accNature")}</span>
              <select value={nature} onChange={(e) => setNature(e.target.value)}>
                <option value="">{t("accNatureAuto")}</option>
                <option value="debit">{t("accNatureDebit")}</option>
                <option value="credit">{t("accNatureCredit")}</option>
                <option value="both">{t("accNatureBoth")}</option>
              </select>
            </label>
            <label className={classes.field}>
              <span>{t("accPermanence")}</span>
              <select value={permanent ? "1" : "0"} onChange={(e) => setPermanent(e.target.value === "1")}>
                <option value="1">{t("accPermanent")}</option>
                <option value="0">{t("accTemporary")}</option>
              </select>
            </label>
          </>
        )}
      </div>
      {level === "detail" && (
        <div className={classes.field}>
          <span>{t("accTafsiliKinds")}</span>
          <div className={acc.checks}>
            {PARTY_KINDS.map((k) => (
              <label key={k}>
                <input type="checkbox" checked={kinds.includes(k)} onChange={(e) => setKinds((p) => (e.target.checked ? [...p, k] : p.filter((x) => x !== k)))} />
                {t(partyKindKey(k))}
              </label>
            ))}
          </div>
          <span className={acc.mutedSmall}>{t("accTafsiliKindsHint")}</span>
        </div>
      )}
      {account && !system && (
        <label className={fin.check} style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setActive(e.target.checked)} />
          {t("accActive")}
        </label>
      )}
      {system && <p className={classes.muted}>{t("accSystemLocked")}</p>}
      <div className={classes.actions}>
        {account && !system && (
          <ConfirmButton
            danger
            label={t("bizDelete")}
            confirm={t("bizDeleteAccountConfirm")}
            onConfirm={async () => {
              if (await call(`/acc/accounts/${account._id}`, "DELETE", undefined, t("bizDeleted"))) {
                closePopup();
                onDone();
              }
            }}
          />
        )}
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button type="button" className={classes.primary} disabled={busy || name.trim().length < 2 || (!account && level !== "group" && !parentCode)} onClick={save}>
          {t("bizSave")}
        </button>
      </div>
    </SimplePopup>
  );
};

// one level as a list (Nexxa's account-groups / total-accounts / moein-accounts)
const LevelList = ({ level, rows, onChanged }: { level: "group" | "total" | "detail"; rows: BizAccount[]; onChanged: () => unknown }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { canWrite } = useBiz();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const list = rows.filter((a) => a.level === level && (!q.trim() || a.name.includes(q.trim()) || a.code.startsWith(q.trim())));
  const parentName = (code?: string) => rows.find((a) => a.code === code)?.name || "";
  return (
    <>
      <div className={acc.bar}>
        <div className={classes.filters}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("bizSearch")} aria-label={t("bizSearch")} />
        </div>
        <div className={acc.tools}>
          <ExportBar
            printRef={ref}
            sheet={() => ({
              title: t(LEVEL_KEY[level]),
              head: [t("bizCode"), t("bizName"), t("accParent"), t("accAccountType"), t("bizBalance")],
              rows: list.map((a) => [a.code, a.name, parentName(a.parentCode), t(typeKey(a.type)), Math.round(a.balance || 0)]),
            })}
          />
          {canWrite && (
            <button type="button" className={classes.primary} onClick={() => open("AccAccountForm", <AccountForm level={level} accounts={rows} onDone={onChanged} />)}>
              {t("accNewAccountOf", [t(LEVEL_KEY[level])])}
            </button>
          )}
        </div>
      </div>
      <div className={classes.tableWrap} ref={ref}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>{t("bizCode")}</th>
              <th>{t("bizName")}</th>
              {level !== "group" && <th>{t("accParent")}</th>}
              <th>{t("accAccountType")}</th>
              {level === "detail" && <th>{t("accTafsiliKinds")}</th>}
              <th className={classes.num}>{t("bizBalance")}</th>
              {canWrite && <th />}
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id} style={{ opacity: a.isActive === false ? 0.55 : 1 }}>
                <td>{a.code}</td>
                <td className={classes.wrap}>
                  {a.name}
                  {!!a.role && <span className={classes.badge} style={{ marginInlineStart: "0.5rem" }}>{t("bizSystem")}</span>}
                  {a.isActive === false && <span className={classes.badge} style={{ marginInlineStart: "0.5rem" }}>{t("accInactive")}</span>}
                </td>
                {level !== "group" && <td className={classes.wrap}>{parentName(a.parentCode)}</td>}
                <td>{t(typeKey(a.type))}</td>
                {level === "detail" && <td className={classes.wrap}>{asArray<string>(a.tafsiliKinds).map((k) => t(partyKindKey(k))).join("، ") || "—"}</td>}
                <td className={classes.num}>{f.signed(a.balance)}</td>
                {canWrite && (
                  <td>
                    <button type="button" className={classes.ghost} onClick={() => open("AccAccountForm", <AccountForm level={level} account={a} accounts={rows} onDone={onChanged} />)}>
                      {t("bizEdit")}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// the whole tree with balances; a row opens its ledger
const Tree = ({ rows }: { rows: BizAccount[] }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [hideEmpty, setHideEmpty] = useState(true);
  const shown = hideEmpty ? rows.filter((a) => a.level !== "detail" || a.balance || a.pD || a.pC) : rows;
  return (
    <>
      <div className={acc.bar}>
        <label className={classes.muted} style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={hideEmpty} onChange={(e) => setHideEmpty(e.target.checked)} />
          {t("bizHideEmpty")}
        </label>
        <ExportBar
          printRef={ref}
          sheet={() => ({ title: t("accChartTree"), head: [t("bizCode"), t("bizName"), t("accLevel"), t("bizBalance")], rows: shown.map((a) => [a.code, a.name, t(LEVEL_KEY[a.level]), Math.round(a.balance || 0)]) })}
        />
      </div>
      <div className={classes.tableWrap} ref={ref}>
        <table className={`${classes.table} ${acc.tree}`}>
          <thead>
            <tr>
              <th>{t("bizCode")}</th>
              <th>{t("bizName")}</th>
              <th className={classes.num}>{t("bizBalance")}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((a) => (
              <tr
                key={a._id}
                className={`${a.level === "group" ? classes.groupRow : a.level === "total" ? classes.totalRow : ""} ${classes.rowLink}`}
                onClick={() => open("AccLedger", <SimplePopup title={`${a.code} · ${a.name}`} wide><LedgerView fixed={{ account: a._id }} /></SimplePopup>)}
              >
                <td>{a.code}</td>
                <td className={`${classes.wrap} ${a.level === "total" ? acc.depth1 : a.level === "detail" ? acc.depth2 : ""}`}>
                  {a.name}
                  {a.isActive === false && <span className={classes.badge} style={{ marginInlineStart: "0.5rem" }}>{t("accInactive")}</span>}
                </td>
                <td className={classes.num}>{f.signed(a.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// Nexxa importCoding: «code name» lines, or an Excel / CSV file
const CodingImport = ({ onChanged }: { onChanged: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const upload = useAccUpload();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ added: number; skipped: string[] } | null>(null);
  const done = (r: unknown) => {
    if (!r) return;
    setResult(r as { added: number; skipped: string[] });
    onChanged();
  };
  return (
    <div className={classes.main}>
      <p className={classes.muted}>{t("accCodingHint")}</p>
      <label className={classes.field}>
        <span>{t("accCodingText")}</span>
        <textarea value={text} rows={8} dir="auto" onChange={(e) => setText(e.target.value)} placeholder={"1 دارایی‌های جاری\n11 موجودی نقد\n1120 بانک ملت"} />
      </label>
      <div className={acc.tools}>
        <button type="button" disabled={text.trim().length < 3} onClick={async () => done(await call("/acc/coding", "POST", { text }, t("accImported")))}>
          {t("accImport")}
        </button>
        <label className={acc.chip} style={{ cursor: "pointer" }}>
          {t("accImportFile")}
          <input type="file" hidden accept=".csv,.xlsx" onChange={async (e) => e.target.files?.[0] && done(await upload("/acc/coding", { file: e.target.files[0] }))} />
        </label>
        <button type="button" onClick={async () => (await call("/acc/accounts/auto-link", "POST", {}, t("accAutoLinked"))) && onChanged()}>
          {t("accAutoLink")}
        </button>
      </div>
      {!!result && (
        <p className={classes.statusOk}>
          {t("accCodingResult", [String(result.added), String(asArray(result.skipped).length)])}
        </p>
      )}
    </div>
  );
};

const VIEWS = ["tree", "group", "total", "detail", "import"] as const;

const AccChart = ({ refreshKey }: { refreshKey: number }) => {
  const t = useAccText();
  const { canWrite } = useBiz();
  const { data, error, mutate } = useBizAccounts();
  const [view, setView] = useView(VIEWS, "tree");
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const rows = asArray<BizAccount>(data);
  return (
    <section className={classes.card}>
      <SubNav
        value={view}
        onChange={setView}
        items={[
          ["tree", t("accChartTree")],
          ["group", t("accLevelGroups")],
          ["total", t("accLevelTotals")],
          ["detail", t("accLevelDetails")],
          ...(canWrite ? ([["import", t("accCodingImport")]] as [(typeof VIEWS)[number], string][]) : []),
        ]}
      />
      <HandleLoading data={!!data} error={error}>
        {view === "tree" && <Tree rows={rows} />}
        {(view === "group" || view === "total" || view === "detail") && <LevelList level={view} rows={rows} onChanged={() => mutate()} />}
        {view === "import" && <CodingImport onChanged={() => mutate()} />}
      </HandleLoading>
    </section>
  );
};

export default AccChart;
