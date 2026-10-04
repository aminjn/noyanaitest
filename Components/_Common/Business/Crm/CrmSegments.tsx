"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { CrmContext, CrmRules, CrmSegment, emptyRules, errText, presetKey, useCrm, useCrmText } from "./crmShared";
import CrmRulesForm, { useRulesSummary } from "./CrmRulesForm";

const POPUP = "CrmSegment";

const SegmentForm = ({ segment, onDone }: { segment?: CrmSegment; onDone: () => unknown }) => {
  const t = useCrmText();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [name, setName] = useState(segment?.name || "");
  const [rules, setRules] = useState<CrmRules>({ ...emptyRules(), ...(segment?.rules || {}) });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await fetcher({
        url: segment ? `${API}${api}/segments/${segment._id}` : `${API}${api}/segments`,
        method: segment ? "PATCH" : "POST",
        payload: { name: name.trim(), rules },
      });
      pushNotification(t("bizSaved"), "Success");
      closePopup(POPUP);
      onDone();
    } catch (err) {
      pushNotification(errText(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard size="wide" title={segment ? segment.name || "" : t("crmNewSegment")}>
      <div className={classes.popup}>
        <label className={classes.field}>
          {t("crmSegmentName")}
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder={t("crmSegmentNameHint")} />
        </label>
        <CrmRulesForm rules={rules} onChange={setRules} />
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup(POPUP)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || name.trim().length < 2} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// Segments (2026-10): saved, dynamic filters over the patients - the
// ready-made ones every centre has and the centre's own - each with its
// live count (and how many can get an SMS), to open as a list or to use as
// a campaign's audience.
const CrmSegments = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const summary = useRulesSummary();
  const { data, error, mutate } = useSWR<{ presets: CrmSegment[]; saved: CrmSegment[] }>(`${API}${ctx.api}/segments`, (url: string) =>
    fetcher({ url }).then((res) => res.data as { presets: CrmSegment[]; saved: CrmSegment[] }),
  );
  const open = (s?: CrmSegment) =>
    setPopup(
      POPUP,
      <CrmContext.Provider value={ctx}>
        <SegmentForm segment={s} onDone={() => mutate()} />
      </CrmContext.Provider>,
    );
  const remove = async (s: CrmSegment) => {
    if (!window.confirm(t("crmDeleteSegmentConfirm", [s.name || ""]))) return;
    try {
      await fetcher({ url: `${API}${ctx.api}/segments/${s._id}`, method: "DELETE" });
      mutate();
    } catch (err) {
      pushNotification(errText(err), "Error");
    }
  };
  const card = (s: CrmSegment) => (
    <li key={s._id} className={crm.segCard}>
      <div className={crm.segHead}>
        <span className={crm.segName}>{s.preset ? t(presetKey[s.preset] || s.preset) : s.name}</span>
        <span className={crm.segCount}>{f.money(s.count)}</span>
      </div>
      <span className={classes.muted}>{summary(s.rules).join(" · ") || t("crmRuleCountAll")}</span>
      <span className={classes.muted}>{t("crmReachable", [f.money(s.reachable)])}</span>
      <div className={crm.rowActions}>
        <Link href={`${ctx.panel}/crm/contacts?segment=${encodeURIComponent(s._id)}`} className={crm.linkButton}>
          {t("crmViewContacts")}
        </Link>
        {ctx.canWrite && s.reachable > 0 && (
          <Link href={`${ctx.panel}/crm/campaigns?segment=${encodeURIComponent(s._id)}`} className={crm.linkButton}>
            {t("crmCampaignToSegment")}
          </Link>
        )}
        {ctx.canWrite && !s.preset && (
          <>
            <button type="button" className={crm.linkButton} onClick={() => open(s)}>
              {t("bizEdit")}
            </button>
            <button type="button" className={crm.linkDanger} onClick={() => remove(s)}>
              {t("bizDelete")}
            </button>
          </>
        )}
      </div>
    </li>
  );
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <>
          <section className={classes.card}>
            <div className={classes.cardHead}>
              <span className={classes.cardTitle}>{t("crmSavedSegments")}</span>
              {ctx.canWrite && (
                <button type="button" className={classes.primary} onClick={() => open()}>
                  {t("crmNewSegment")}
                </button>
              )}
            </div>
            {asArray<CrmSegment>(data.saved).length === 0 ? (
              <p className={classes.empty}>{t("crmNoSegments")}</p>
            ) : (
              <ul className={crm.segGrid}>{asArray<CrmSegment>(data.saved).map(card)}</ul>
            )}
          </section>
          <section className={classes.card}>
            <span className={classes.cardTitle}>{t("crmPresetSegments")}</span>
            <ul className={crm.segGrid}>{asArray<CrmSegment>(data.presets).map(card)}</ul>
          </section>
        </>
      )}
    </HandleLoading>
  );
};

export default CrmSegments;
