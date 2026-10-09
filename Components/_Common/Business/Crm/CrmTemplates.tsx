"use client";

import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray } from "../bizShared";
import { automationKey, automationKindsOf, CrmContext, CrmTemplate, errText, templateStatusKey, useCrm, useCrmTemplates, useCrmText } from "./crmShared";
import SmsTextField from "./SmsTextField";
import CrmAiWrite from "./CrmAiWrite";

const POPUP = "CrmTemplate";
// a template's category is one of the profile's own journeys, or general;
// the starter texts are offered for each journey (in the panel's language)
const categoriesOf = (node: string): CrmTemplate["category"][] => ["general", ...automationKindsOf(node)];
const starterKey: Record<string, string> = {
  recall: "crmStarterRecall",
  thanks: "crmStarterThanks",
  birthday: "crmStarterBirthday",
  noShow: "crmStarterNoShow",
  winback: "crmStarterWinback",
  chronic: "crmStarterChronic",
  refill: "crmStarterRefill",
  resultFollowUp: "crmStarterResultFollowUp",
  testRecall: "crmStarterTestRecall",
  renewal: "crmStarterRenewal",
};

// a category's name: a journey's own (the automation of the same kind), or "general"
const catKey = (c: CrmTemplate["category"]) => (c === "general" ? "crmTplGeneral" : automationKey[c]?.title || "crmTplGeneral");

const tone = (s: CrmTemplate["status"]) => (s === "Approved" ? crm.badgeOk : s === "Rejected" ? crm.badgeBad : s === "Pending" ? crm.badgeWarn : "");

const TemplateForm = ({ template, starter, onDone }: { template?: CrmTemplate; starter?: CrmTemplate["category"]; onDone: () => unknown }) => {
  const t = useCrmText();
  const { api, node } = useCrm();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [name, setName] = useState(template?.name || (starter ? t(catKey(starter)) : ""));
  const [category, setCategory] = useState<CrmTemplate["category"]>(template?.category || starter || "general");
  const [text, setText] = useState(template?.text || (starter ? t(starterKey[starter]) : ""));
  const [busy, setBusy] = useState(false);
  const save = async (submit: boolean) => {
    setBusy(true);
    try {
      const res = await fetcher({
        url: template ? `${API}${api}/templates/${template._id}` : `${API}${api}/templates`,
        method: template ? "PATCH" : "POST",
        payload: { name: name.trim(), category, text: text.trim() },
      });
      const id = (res.data as { _id?: string })?._id || template?._id;
      if (submit && id) await fetcher({ url: `${API}${api}/templates/${id}/submit`, method: "POST" });
      pushNotification(t(submit ? "crmSubmitted" : "bizSaved"), "Success");
      closePopup(POPUP);
      onDone();
    } catch (err) {
      pushNotification(errText(err), "Error");
      setBusy(false);
    }
  };
  const changed = !!template && template.text !== text.trim();
  return (
    <PopupCard size="wide" title={template ? template.name : t("crmNewTemplate")}>
      <div className={classes.popup}>
        {template?.status === "Rejected" && template.rejectReason && (
          <p className={crm.reject}>
            {t("crmRejectReason")}: {template.rejectReason}
          </p>
        )}
        <div className={classes.form}>
          <label className={classes.field}>
            {t("crmTplName")}
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </label>
          <label className={classes.field}>
            {t("crmTplCategory")}
            <select value={category} onChange={(e) => setCategory(e.target.value as CrmTemplate["category"])}>
              {Array.from(new Set([...categoriesOf(node), category])).map((c) => (
                <option key={c} value={c}>
                  {t(catKey(c))}
                </option>
              ))}
            </select>
          </label>
        </div>
        <CrmAiWrite
          node={node}
          onText={(r) => {
            setText(r.text);
            if (!name.trim()) setName(r.name);
            if (!template && categoriesOf(node).includes(r.category as CrmTemplate["category"])) setCategory(r.category as CrmTemplate["category"]);
          }}
        />
        <SmsTextField value={text} onChange={setText} label={t("crmCampaignText")} />
        <p className={classes.muted}>{t("crmTextRules")}</p>
        {changed && template?.status === "Approved" && <p className={crm.warnLine}>{t("crmTplReapprove")}</p>}
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup(POPUP)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.ghost} disabled={busy || name.trim().length < 2 || text.trim().length < 5} onClick={() => save(false)}>
            {t("crmSaveDraft")}
          </button>
          {(!template || template.status !== "Approved" || changed) && (
            <button type="button" className={classes.primary} disabled={busy || name.trim().length < 2 || text.trim().length < 5} onClick={() => save(true)}>
              {t("crmSubmit")}
            </button>
          )}
        </div>
      </div>
    </PopupCard>
  );
};

// SMS templates (2026-10): the centre's reusable texts with variables
// ({name}, {org}, the tracked {link}, the visit's {review} link...), the
// real length in SMS parts, and the one-time approval by Noyan that lets
// automations and one-off sends use them. Starter texts for each journey.
const CrmTemplates = () => {
  const t = useCrmText();
  const ctx = useCrm();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useCrmTemplates();
  const open = (template?: CrmTemplate, starter?: CrmTemplate["category"]) =>
    setPopup(
      POPUP,
      <CrmContext.Provider value={ctx}>
        <TemplateForm template={template} starter={starter} onDone={() => mutate()} />
      </CrmContext.Provider>,
    );
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      pushNotification(t(ok), "Success");
      mutate();
    } catch (err) {
      pushNotification(errText(err), "Error");
    }
  };
  const rows = asArray<CrmTemplate>(data);
  return (
    <>
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <span className={classes.cardTitle}>{t("crmNavTemplates")}</span>
          {ctx.canWrite && (
            <button type="button" className={classes.primary} onClick={() => open()}>
              {t("crmNewTemplate")}
            </button>
          )}
        </div>
        <p className={classes.muted}>{t("crmTplApprovalHint")}</p>
        <HandleLoading data={!!data} error={error}>
          {rows.length === 0 ? (
            <p className={classes.empty}>{t("crmNoTemplates")}</p>
          ) : (
            <ul className={crm.segGrid}>
              {rows.map((x) => (
                <li key={x._id} className={crm.segCard}>
                  <div className={crm.segHead}>
                    <span className={crm.segName}>{x.name}</span>
                    <span className={`${classes.badge} ${tone(x.status)}`}>{t(templateStatusKey[x.status] || "crmStDraft")}</span>
                  </div>
                  <span className={crm.tags}>
                    <span className={crm.tag}>{t(catKey(x.category))}</span>
                    {!!x.automations && <span className={crm.tag}>{t("crmTplUsedBy", [String(x.automations)])}</span>}
                  </span>
                  <p className={crm.tplText} dir="auto">
                    {x.text}
                  </p>
                  {x.status === "Rejected" && x.rejectReason && <span className={crm.rejectInline}>{x.rejectReason}</span>}
                  {ctx.canWrite && (
                    <div className={crm.rowActions}>
                      <button type="button" className={crm.linkButton} onClick={() => open(x)}>
                        {t("bizEdit")}
                      </button>
                      {(x.status === "Draft" || x.status === "Rejected") && (
                        <button
                          type="button"
                          className={crm.linkButton}
                          onClick={() => act(() => fetcher({ url: `${API}${ctx.api}/templates/${x._id}/submit`, method: "POST" }), "crmSubmitted")}
                        >
                          {t("crmSubmit")}
                        </button>
                      )}
                      <button
                        type="button"
                        className={crm.linkDanger}
                        onClick={() =>
                          window.confirm(t("crmTplDeleteConfirm", [x.name])) &&
                          act(() => fetcher({ url: `${API}${ctx.api}/templates/${x._id}`, method: "DELETE" }), "bizDeleted")
                        }
                      >
                        {t("bizDelete")}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </HandleLoading>
      </section>
      {ctx.canWrite && (
        <section className={classes.card}>
          <span className={classes.cardTitle}>{t("crmStarters")}</span>
          <p className={classes.muted}>{t("crmStartersHint")}</p>
          <ul className={crm.segGrid}>
            {automationKindsOf(ctx.node).map((c) => (
              <li key={c} className={crm.segCard}>
                <span className={crm.segName}>{t(catKey(c))}</span>
                <p className={crm.tplText} dir="auto">
                  {t(starterKey[c])}
                </p>
                <div className={crm.rowActions}>
                  <button type="button" className={crm.linkButton} onClick={() => open(undefined, c)}>
                    {t("crmUseStarter")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};

export default CrmTemplates;
