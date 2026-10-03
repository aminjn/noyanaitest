"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useAcl from "@/Components/Hooks/useAcl";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import classes from "../Accounting.module.css";
import { useBizFormat } from "../bizShared";
import { CrmContext, useCrmText } from "./crmShared";
import CrmContacts from "./CrmContacts";
import CrmFollowUps from "./CrmFollowUps";
import CrmCampaigns from "./CrmCampaigns";

type Summary = {
  contacts: number;
  optedOut: number;
  lapsed: number;
  due: number;
  quota: number;
  quotaUsed: number;
  balance: number;
  window: [number, number];
};

const Tiles = ({ api, refreshKey }: { api: string; refreshKey: number }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { data, mutate } = useSWR<Summary>(`${API}${api}/summary`, (url: string) =>
    fetcher({ url }).then((res) => res.data as Summary),
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const tile = (label: string, value: string, tone = "", unit = "") => (
    <div className={`${classes.tile} ${tone}`}>
      <span className={classes.tileLabel}>{label}</span>
      <span className={classes.tileValue}>
        {value}
        {unit && <span className={classes.tileUnit}>{unit}</span>}
      </span>
    </div>
  );
  return (
    <div className={classes.tiles}>
      {tile(t("crmTileContacts"), f.money(data?.contacts), classes.primaryTile)}
      {tile(t("crmTileDue"), f.money(data?.due))}
      {tile(t("crmTileLapsed"), f.money(data?.lapsed))}
      {tile(t("crmTileQuota"), data ? `${f.money(Math.max(0, data.quota - data.quotaUsed))} / ${f.money(data.quota)}` : "—")}
      {tile(t("crmTileWallet"), f.money(data?.balance), "", t("toman"))}
    </div>
  );
};

// Noyan Business CRM and SMS campaigns (2026-10, docs/business-suite.md
// phase 4) for every provider panel: the patients and customers (built
// from the panel's own visits and orders), follow-ups, and SMS campaigns
// the super admin clears before they go out. One page, its parts as tabs.
const CrmPage = ({
  node,
  panel,
}: {
  node: NodeWithAcl;
  // "/clinicpanel", "/doctorpanel", ...
  panel: string;
}) => {
  const t = useCrmText();
  const hasAccess = useAcl(node);
  useBreadCrump([
    { title: t("dashboard"), target: panel },
    { title: t("crmTitle"), target: `${panel}/crm` },
  ]);
  const api = `/${node}/crm`;
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);
  return (
    <CrmContext.Provider value={{ api, canWrite: hasAccess("manageCrm"), canSend: hasAccess("sendCampaigns") }}>
      <div className={classes.main}>
        <header className={classes.header}>
          <h1 className={classes.title}>{t("crmTitle")}</h1>
          <span className={classes.subtitle}>{t("crmSubtitle")}</span>
        </header>
        <Tiles api={api} refreshKey={refreshKey} />
        <ClientTabSystem
          items={[
            { id: "contacts", title: t("crmTabContacts"), content: <CrmContacts refreshKey={refreshKey} onChanged={bump} /> },
            { id: "followups", title: t("crmTabFollowUps"), content: <CrmFollowUps refreshKey={refreshKey} onChanged={bump} /> },
            { id: "campaigns", title: t("crmTabCampaigns"), content: <CrmCampaigns refreshKey={refreshKey} onChanged={bump} /> },
          ]}
        />
      </div>
    </CrmContext.Provider>
  );
};

export default CrmPage;
