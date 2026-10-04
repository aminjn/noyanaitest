"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import { useRouter } from "@/Components/i18n/navigation";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import s from "./CrmSales.module.css";
import { useBizFormat } from "../bizShared";
import { useCrm } from "../Crm/crmShared";
import { contactName, dayOf, useAction, useList, useSalesText } from "./salesShared";
import { CopyLink } from "./SalesWidgets";
import { Block, Contract, contractStateKey } from "./SalesContracts";

// the people a corporate contract covers: added one by one or pasted
// ("name, mobile, national id, relation" a line); each becomes a contact
const Members = ({ c, onChanged }: { c: Contract; onChanged: () => void }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const { canWrite } = useCrm();
  const { run, busy } = useAction();
  const [paste, setPaste] = useState("");
  const rows = c.members || [];
  const add = async () => {
    const members = paste
      .split(/\r?\n/)
      .map((line) => line.split(/[,،\t]/).map((x) => x.trim()))
      .filter((x) => x[0])
      .map(([name, phone, nationalId, relation]) => ({ name, phone, nationalId, relation }));
    if (!members.length) return;
    if (await run("POST", `/contracts/${c._id}/members`, { members })) {
      setPaste("");
      onChanged();
    }
  };
  return (
    <section className={classes.card}>
      <h3 className={classes.cardTitle}>
        {t("crmsMembers")} · {f.money(rows.length)}
      </h3>
      {rows.length > 0 && (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("crmsName")}</th>
                <th>{t("crmsMobile")}</th>
                <th>{t("crmsNationalId")}</th>
                <th>{t("crmsRelation")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 500).map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>
                    <bdi dir="ltr">{m.phone || ""}</bdi>
                  </td>
                  <td>
                    <bdi dir="ltr">{m.nationalId || ""}</bdi>
                  </td>
                  <td>{m.relation || ""}</td>
                  <td>
                    {canWrite && (
                      <button
                        type="button"
                        className={crm.linkDanger}
                        disabled={!!busy}
                        onClick={async () => {
                          if (await run("DELETE", `/contracts/${c._id}/members/${m._id}`, undefined, { quiet: true })) onChanged();
                        }}
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {canWrite && (
        <>
          <label className={classes.field}>
            {t("crmsPasteMembers")}
            <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={4} placeholder={t("crmsPasteMembersHint")} />
          </label>
          <div className={classes.actions}>
            <button type="button" className={classes.ghost} disabled={!!busy || !paste.trim()} onClick={add}>
              {t("crmsAddMembers")}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

// One contract (Nexxa crm/contracts/[id]): its terms and text (fixed once
// signed), the signing link for the other side, in-person signing, state
// changes, the invoice it becomes - once - and "keep as a template".
const SalesContract = ({ id }: { id: string }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const router = useRouter();
  const { api, panel, canWrite } = useCrm();
  const { run, busy } = useAction();
  const { data, error, mutate } = useSWR<Contract>(`${API}${api}/contracts/${id}`, (url: string) => fetcher({ url }).then((res) => res.data as Contract));
  const { data: blocks } = useList<Block>("/contract-blocks");
  const [edit, setEdit] = useState<Partial<Contract> & { party?: Contract["party"] }>({});
  const [link, setLink] = useState("");
  useEffect(() => setEdit({}), [data?._id, data?.state, data?.signed]);
  if (!data)
    return (
      <HandleLoading data={!!data} error={error}>
        <></>
      </HandleLoading>
    );
  const c = data;
  const types = (blocks || []).filter((b) => b.kind === "type");
  const clauses = (blocks || []).filter((b) => b.kind === "clause");
  const dirty = Object.keys(edit).length > 0;
  const textLocked = c.signed || !canWrite;
  const save = async () => {
    const payload: Record<string, unknown> = {};
    for (const k of ["subject", "value", "content", "note"] as const) if (edit[k] !== undefined) payload[k] = edit[k];
    if (edit.startDate !== undefined) payload.startDate = edit.startDate;
    if (edit.endDate !== undefined) payload.endDate = edit.endDate || null;
    if (edit.type !== undefined) payload.type = edit.type || null;
    if (edit.party) payload.party = edit.party;
    if (await run("PATCH", `/contracts/${id}`, payload)) mutate();
  };
  const state = async (action: "sign" | "activate" | "cancel" | "reopen") => {
    if (action === "cancel" && !window.confirm(t("crmsConfirmCancel"))) return;
    if (await run("POST", `/contracts/${id}/state`, { action })) mutate();
  };
  const typeId = edit.type !== undefined ? (edit.type as string) : c.type && typeof c.type === "object" ? c.type._id : "";
  const party = edit.party || c.party;
  return (
    <div className={s.twoCol}>
      <div className={s.stack}>
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <h2 className={classes.cardTitle}>
              {t("crmsContractN", [f.money(c.number)])} · {c.subject}
            </h2>
            <span className={classes.badge}>{t(contractStateKey[c.state])}</span>
          </div>
          <div className={s.formGrid}>
            <label className={classes.field}>
              {t("crmsSubject")}
              <input value={edit.subject ?? c.subject} disabled={textLocked} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} />
            </label>
            <label className={classes.field}>
              {t("crmsContractType")}
              <select value={typeId} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>
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
              <input
                inputMode="numeric"
                value={edit.value ?? c.value}
                disabled={textLocked || !!c.invoice}
                onChange={(e) => setEdit({ ...edit, value: Number(e.target.value.replace(/\D/g, "")) || 0 })}
              />
            </label>
            <label className={classes.field}>
              {t("crmsStartDate")}
              <input type="date" value={edit.startDate ?? dayOf(c.startDate)} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, startDate: e.target.value })} />
            </label>
            <label className={classes.field}>
              {t("crmsEndDate")}
              <input type="date" value={edit.endDate ?? dayOf(c.endDate)} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, endDate: e.target.value })} />
            </label>
          </div>
          {!c.contact && (
            <div className={s.formGrid}>
              <label className={classes.field}>
                {t("crmsPartyName")}
                <input value={party.name} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, party: { ...party, name: e.target.value } })} />
              </label>
              <label className={classes.field}>
                {t("crmsMobile")}
                <input dir="ltr" value={party.phone || ""} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, party: { ...party, phone: e.target.value } })} />
              </label>
              <label className={classes.field}>
                {t("crmsCompanyId")}
                <input dir="ltr" value={party.nationalId || ""} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, party: { ...party, nationalId: e.target.value.replace(/\D/g, "") } })} />
              </label>
            </div>
          )}
          {!textLocked && clauses.length > 0 && (
            <label className={classes.field}>
              {t("crmsAddClause")}
              <select
                value=""
                onChange={(e) => {
                  const b = clauses.find((x) => x._id === e.target.value);
                  if (b) setEdit({ ...edit, content: `${edit.content ?? c.content ?? ""}\n\n${b.name}\n${b.body || ""}`.trim() });
                }}
              >
                <option value="">—</option>
                {clauses.map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={classes.field}>
            {t("crmsContractText")}
            <textarea value={edit.content ?? c.content ?? ""} disabled={textLocked} onChange={(e) => setEdit({ ...edit, content: e.target.value })} rows={12} />
          </label>
          <label className={classes.field}>
            {t("crmsNoteInternal")}
            <textarea value={edit.note ?? c.note ?? ""} disabled={!canWrite} onChange={(e) => setEdit({ ...edit, note: e.target.value })} />
          </label>
          {c.signed && <p className={classes.muted}>{t("crmsSignedLocked")}</p>}
          {canWrite && (
            <div className={classes.actions}>
              <button type="button" className={classes.primary} disabled={!dirty || !!busy} onClick={save}>
                {t("crmsSave")}
              </button>
              <button type="button" className={classes.ghost} disabled={!dirty} onClick={() => setEdit({})}>
                {t("crmsDiscard")}
              </button>
              {c.content && (
                <button
                  type="button"
                  className={classes.ghost}
                  disabled={!!busy}
                  onClick={async () => {
                    const name = window.prompt(t("crmsTemplateName"), c.subject);
                    if (name?.trim()) await run("POST", `/contracts/${id}/template`, { name: name.trim() });
                  }}
                >
                  {t("crmsKeepAsTemplate")}
                </button>
              )}
            </div>
          )}
        </section>
        {!c.contact && <Members c={c} onChanged={() => mutate()} />}
      </div>
      <div className={s.stack}>
        <section className={classes.card}>
          <h3 className={classes.cardTitle}>{t("crmsParty")}</h3>
          <p>
            {c.contact ? (
              <Link href={`${panel}/crm/contacts/${c.contact._id}`} className={crm.linkButton}>
                {contactName(c.contact)}
              </Link>
            ) : (
              <>
                {c.party?.name} · {t(`crmsParty_${c.party?.kind || "company"}`)}
              </>
            )}
          </p>
          {c.signed ? (
            <>
              <p className={classes.muted}>{t("crmsSignedBy", [c.signerName || "—", f.date(c.signedAt)])}</p>
              {c.signature && <img src={c.signature} alt={t("crmsSignature")} className={s.sig} />}
            </>
          ) : (
            canWrite &&
            c.state !== "canceled" && (
              <div className={classes.actions}>
                <button
                  type="button"
                  className={classes.primary}
                  disabled={!!busy}
                  onClick={async () => {
                    const r = await run<{ link: string }>("POST", `/contracts/${id}/send`, {}, { quiet: true });
                    if (r?.link) setLink(r.link);
                  }}
                >
                  {t("crmsSendToSign")}
                </button>
                <button type="button" className={classes.ghost} disabled={!!busy} onClick={() => state("sign")}>
                  {t("crmsSignedInPerson")}
                </button>
              </div>
            )
          )}
          {(link || (!c.signed && c.link && c.state !== "canceled")) && <CopyLink text={link || c.link || ""} />}
        </section>
        <section className={classes.card}>
          <h3 className={classes.cardTitle}>{t("crmsNextSteps")}</h3>
          {canWrite && (
            <div className={classes.actions}>
              {c.state === "draft" && (
                <button type="button" className={classes.ghost} disabled={!!busy} onClick={() => state("activate")}>
                  {t("crmsActivate")}
                </button>
              )}
              {(c.state === "draft" || c.state === "active") && (
                <button type="button" className={classes.danger} disabled={!!busy} onClick={() => state("cancel")}>
                  {t("crmsCancelContract")}
                </button>
              )}
              {(c.state === "canceled" || c.state === "expired") && (
                <button type="button" className={classes.ghost} disabled={!!busy} onClick={() => state("reopen")}>
                  {t("crmsReopen")}
                </button>
              )}
            </div>
          )}
          {c.invoice ? (
            <Link href={`${panel}/finance/invoices`} className={crm.linkButton}>
              {t("crmsInvoiceN", [f.money(c.invoiceInfo?.number), f.money(c.invoiceInfo?.total)])}
            </Link>
          ) : (
            canWrite &&
            c.state !== "canceled" && (
              <button
                type="button"
                className={classes.primary}
                disabled={!!busy || !(c.value > 0) || dirty}
                onClick={async () => {
                  if (await run("POST", `/contracts/${id}/invoice`, {})) mutate();
                }}
              >
                {t("crmsMakeInvoice")}
              </button>
            )
          )}
        </section>
        {canWrite && (
          <button
            type="button"
            className={crm.linkDanger}
            onClick={async () => {
              if (window.confirm(t("crmsConfirmDelete")) && (await run("DELETE", `/contracts/${id}`))) router.push(`${panel}/crm/contracts`);
            }}
          >
            {t("crmsDeleteContract")}
          </button>
        )}
      </div>
    </div>
  );
};

export default SalesContract;
