"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import Link from "@/Components/i18n/Link";
import { useRouter } from "@/Components/i18n/navigation";
import { API } from "@/Components/config";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import s from "./CrmSales.module.css";
import { isoDay, useBizFormat } from "../bizShared";
import { CrmContext, useCrm, useCrmText } from "../Crm/crmShared";
import { contactName, MiniContact, useAction, useList } from "./salesShared";
import { ContactChoice, ContactPicker, contactPayload } from "./SalesWidgets";

const NEW_CONTRACT = "CrmsNewContract";
const BLOCK_POPUP = "CrmsBlock";

export type ContractState = "draft" | "active" | "expired" | "canceled";
export type Contract = {
  _id: string;
  number: number;
  subject: string;
  contact?: MiniContact | null;
  party: { name: string; phone?: string; nationalId?: string; kind: "company" | "insurer" | "person" };
  type?: { _id: string; name: string } | string | null;
  value: number;
  startDate: string;
  endDate?: string;
  state: ContractState;
  signed: boolean;
  signedAt?: string;
  signerName?: string;
  signature?: string;
  content?: string;
  note?: string;
  invoice?: string;
  link?: string;
  invoiceInfo?: { number: number; status: string; total: number; paid: number } | null;
};
export type Block = { _id: string; kind: "type" | "clause" | "template"; name: string; body?: string };
export const contractStateKey: Record<ContractState, string> = { draft: "crmsCtDraft", active: "crmsCtActive", expired: "crmsCtExpired", canceled: "crmsCtCanceled" };
export const partyKinds = ["company", "insurer", "person"] as const;

const NewContract = ({ types, templates, onDone }: { types: Block[]; templates: Block[]; onDone: (id: string) => void }) => {
  const t = useCrmText();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const [subject, setSubject] = useState("");
  const [partyKind, setPartyKind] = useState<(typeof partyKinds)[number]>("company");
  const [party, setParty] = useState({ name: "", phone: "", nationalId: "" });
  const [who, setWho] = useState<ContactChoice>({});
  const [type, setType] = useState("");
  const [value, setValue] = useState("");
  const [startDate, setStart] = useState(isoDay(new Date()));
  const [endDate, setEnd] = useState("");
  const [content, setContent] = useState("");
  const save = async () => {
    const r = await run<{ _id: string }>("POST", "/contracts", {
      subject,
      type: type || null,
      value: Number(value) || 0,
      startDate,
      endDate: endDate || null,
      content,
      ...(partyKind === "person" ? contactPayload(who) : { party: { ...party, kind: partyKind } }),
    });
    if (r?._id) {
      closePopup(NEW_CONTRACT);
      onDone(r._id);
    }
  };
  return (
    <PopupCard title={t("crmsNewContract")} size="wide">
      <div className={classes.popup}>
        <div className={s.formGrid}>
          <label className={classes.field}>
            {t("crmsSubject")}
            <input value={subject} onChange={(e) => setSubject(e.target.value)} autoFocus />
          </label>
          <label className={classes.field}>
            {t("crmsContractType")}
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">—</option>
              {types.map((x) => (
                <option key={x._id} value={x._id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmsContractValue")}
            <input inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label className={classes.field}>
            {t("crmsStartDate")}
            <input type="date" value={startDate} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className={classes.field}>
            {t("crmsEndDate")}
            <input type="date" value={endDate} min={startDate} onChange={(e) => setEnd(e.target.value)} />
          </label>
          <label className={classes.field}>
            {t("crmsPartyKind")}
            <select value={partyKind} onChange={(e) => setPartyKind(e.target.value as (typeof partyKinds)[number])}>
              {partyKinds.map((k) => (
                <option key={k} value={k}>
                  {t(`crmsParty_${k}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {partyKind === "person" ? (
          <ContactPicker value={who} onChange={setWho} />
        ) : (
          <div className={s.formGrid}>
            <label className={classes.field}>
              {t("crmsPartyName")}
              <input value={party.name} onChange={(e) => setParty({ ...party, name: e.target.value })} />
            </label>
            <label className={classes.field}>
              {t("crmsMobile")}
              <input dir="ltr" inputMode="tel" value={party.phone} onChange={(e) => setParty({ ...party, phone: e.target.value })} />
            </label>
            <label className={classes.field}>
              {t("crmsCompanyId")}
              <input dir="ltr" inputMode="numeric" value={party.nationalId} onChange={(e) => setParty({ ...party, nationalId: e.target.value.replace(/\D/g, "") })} />
            </label>
          </div>
        )}
        {templates.length > 0 && (
          <label className={classes.field}>
            {t("crmsFromTemplate")}
            <select value="" onChange={(e) => setContent(templates.find((x) => x._id === e.target.value)?.body || content)}>
              <option value="">—</option>
              {templates.map((x) => (
                <option key={x._id} value={x._id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className={classes.field}>
          {t("crmsContractText")}
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
        </label>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={!!busy || !subject.trim() || (partyKind === "person" ? !who.contact && !who.phone : !party.name.trim())} onClick={save}>
            {t("crmsCreate")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// the contract library: types (names only), reusable clauses, whole texts
const Blocks = ({ kind }: { kind: Block["kind"] }) => {
  const t = useCrmText();
  const ctx = useCrm();
  const { api, canWrite } = ctx;
  const { setPopup, closePopup } = usePopup();
  const { run } = useAction();
  const { data, error, mutate } = useList<Block>(`/contract-blocks?kind=${kind}`);
  const open = (b?: Block) =>
    setPopup(
      BLOCK_POPUP,
      <PopupCard title={t(b ? "crmsEdit" : `crmsNewBlock_${kind}`)} size={kind === "type" ? "normal" : "wide"}>
        <CreateForm<Partial<Block>>
          defaultValue={b || { kind }}
          renderer={{
            name: { type: "text", title: t("crmsName"), required: true },
            ...(kind !== "type" ? { body: { type: "area", title: t("crmsBody"), required: true } } : {}),
          }}
          onCancel={() => closePopup(BLOCK_POPUP)}
          hookProps={{
            path: b ? `${API}${api}/contract-blocks/${b._id}` : `${API}${api}/contract-blocks`,
            method: b ? "PATCH" : "POST",
            parser: "JSON",
            mutator: (inp) => ({ kind, ...inp }),
            successCb: () => {
              mutate();
              closePopup(BLOCK_POPUP);
            },
          }}
        />
      </PopupCard>,
    );
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <p className={classes.muted}>{t(`crmsBlockHint_${kind}`)}</p>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open()}>
            {t(`crmsNewBlock_${kind}`)}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNothingYet")}</p>
        ) : (
          <Table
            data={data || []}
            name={`CrmSalesBlocks_${kind}`}
            renderer={{
              name: { name: t("crmsName"), filter: "Text", value: (b) => b.name },
              ...(kind !== "type" ? { body: { name: t("crmsBody"), value: (b) => (b.body || "").slice(0, 80) } } : {}),
              ...(canWrite
                ? {
                    actions: {
                      name: "",
                      component: (b) => (
                        <TableActions>
                          <button type="button" className={crm.linkButton} onClick={() => open(b)}>
                            {t("crmsEdit")}
                          </button>
                          <button
                            type="button"
                            className={crm.linkDanger}
                            onClick={async () => {
                              if (window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/contract-blocks/${b._id}`))) mutate();
                            }}
                          >
                            {t("crmsDelete")}
                          </button>
                        </TableActions>
                      ),
                    },
                  }
                : {}),
            }}
          />
        )}
      </HandleLoading>
    </section>
  );
};

const ContractList = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const router = useRouter();
  const ctx = useCrm();
  const { panel, canWrite } = ctx;
  const { setPopup } = usePopup();
  const [state, setState] = useState<"" | ContractState>("");
  const { data, error } = useList<Contract>(`/contracts${state ? `?state=${state}` : ""}`);
  const { data: blocks } = useList<Block>("/contract-blocks");
  const types = (blocks || []).filter((b) => b.kind === "type");
  const templates = (blocks || []).filter((b) => b.kind === "template");
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.segmented} role="tablist">
          {(["", "draft", "active", "expired", "canceled"] as const).map((x) => (
            <button key={x || "all"} type="button" role="tab" aria-selected={state === x} className={state === x ? classes.on : ""} onClick={() => setState(x)}>
              {t(x ? contractStateKey[x] : "crmsAllStatuses")}
            </button>
          ))}
        </div>
        {canWrite && (
          <button
            type="button"
            className={classes.primary}
            onClick={() =>
              setPopup(NEW_CONTRACT, <CrmContext.Provider value={ctx}><NewContract types={types} templates={templates} onDone={(id) => router.push(`${panel}/crm/contracts/${id}`)} /></CrmContext.Provider>)
            }
          >
            {t("crmsNewContract")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNoContracts")}</p>
        ) : (
          <Table
            data={data || []}
            name="CrmSalesContracts"
            renderer={{
              subject: {
                name: t("crmsSubject"),
                filter: "Text",
                value: (c) => c.subject,
                component: (c) => (
                  <Link href={`${panel}/crm/contracts/${c._id}`} className={crm.linkButton}>
                    {c.subject}
                  </Link>
                ),
              },
              number: { name: t("crmsNumber"), filter: "Number", value: (c) => c.number },
              party: { name: t("crmsParty"), filter: "Text", value: (c) => c.party?.name || contactName(c.contact) },
              type: { name: t("crmsContractType"), filter: "Set", value: (c) => (c.type && typeof c.type === "object" ? c.type.name : "—") },
              value: { name: t("crmsContractValue"), filter: "Number", value: (c) => c.value, component: (c) => <>{f.money(c.value)}</> },
              startDate: { name: t("crmsStartDate"), filter: "Date", value: (c) => new Date(c.startDate) },
              endDate: { name: t("crmsEndDate"), filter: "Date", value: (c) => (c.endDate ? new Date(c.endDate) : "—") },
              state: { name: t("crmsStatus"), filter: "Set", value: (c) => t(contractStateKey[c.state] || "crmsCtDraft") },
              signed: { name: t("crmsSigned"), filter: "Set", value: (c) => t(c.signed ? "crmsYes" : "crmsNo") },
            }}
          />
        )}
      </HandleLoading>
    </section>
  );
};

// Corporate and insurer contracts (Nexxa crm/contracts and its clause
// library): the contracts, their types, reusable clauses and templates -
// one page, its parts as tabs.
const SalesContracts = () => {
  const t = useCrmText();
  return (
    <ClientTabSystem
      items={[
        { id: "contracts", title: t("crmsTabContracts"), content: <ContractList /> },
        { id: "types", title: t("crmsTabTypes"), content: <Blocks kind="type" /> },
        { id: "clauses", title: t("crmsTabClauses"), content: <Blocks kind="clause" /> },
        { id: "templates", title: t("crmsTabTemplates"), content: <Blocks kind="template" /> },
      ]}
    />
  );
};

export default SalesContracts;
