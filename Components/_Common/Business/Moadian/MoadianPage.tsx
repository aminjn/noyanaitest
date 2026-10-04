"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import classes from "../Accounting.module.css";
import { useBizFormat } from "../bizShared";
import { MoadianContext, MoadianSettings, useMoadianText } from "./moadianShared";
import MoadianPurchases from "./MoadianPurchases";
import MoadianInvoices from "./MoadianInvoices";
import MoadianSettingsTab from "./MoadianSettings";
import { AiInsight } from "../Finance/Ai/finAi";

const Tiles = ({ settings }: { settings?: MoadianSettings }) => {
  const t = useMoadianText();
  const f = useBizFormat();
  const c = settings?.counts;
  const tile = (label: string, value: string, tone = "") => (
    <div className={`${classes.tile} ${tone}`}>
      <span className={classes.tileLabel}>{label}</span>
      <span className={classes.tileValue}>{value}</span>
    </div>
  );
  return (
    <div className={classes.tiles}>
      {tile(t("moaTileLink"), settings ? (settings.isActive ? t("moaLinkOn") : t("moaLinkOff")) : "—", classes.primaryTile)}
      {tile(t("moaStAccepted"), c ? f.money(c.Accepted) : "—")}
      {tile(t("moaTileWaiting"), c ? f.money(c.Queued + c.Sent) : "—")}
      {tile(t("moaStRejected"), c ? f.money(c.Rejected) : "—")}
    </div>
  );
};

// Noyan Business Moadian (2026-10, docs/business-suite.md phase 5): the
// electronic invoices of every paid visit and sale, sent to the tax
// organisation with the taxpayer's own key, for every provider panel and
// for Noyan's own invoices in the super admin. One page: the invoices and
// the link settings as tabs.
const MoadianPage = ({
  api,
  canWrite,
  platform,
  hideHeader,
}: {
  // "/pharmacy/moadian", "/admin/finance/moadian", ...
  api: string;
  canWrite: boolean;
  platform?: boolean;
  hideHeader?: boolean;
}) => {
  const t = useMoadianText();
  const { data, mutate } = useSWR<MoadianSettings | null>(`${API}${api}/settings`, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as MoadianSettings) : null)),
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  // a link not set up yet opens on its settings
  const [tab, setTab] = useState<string>("");
  useEffect(() => {
    if (data && !tab) setTab(data.isActive ? "invoices" : "settings");
  }, [data, tab]);
  return (
    <MoadianContext.Provider value={{ api, canWrite, platform: !!platform }}>
      <div className={classes.main}>
        {!hideHeader && (
          <header className={classes.header}>
            <h1 className={classes.title}>{t("moaTitle")}</h1>
            <span className={classes.subtitle}>{t(platform ? "moaSubtitlePlatform" : "moaSubtitle")}</span>
          </header>
        )}
        {hideHeader && <span className={classes.subtitle}>{t("moaSubtitlePlatform")}</span>}
        {/* the finance assistant's VAT / Moadian analysis (a provider's own books only) */}
        {!platform && /\/moadian$/.test(api) && <AiInsight kind="tax" api={api.replace(/\/moadian$/, "/biz/finance")} />}
        <Tiles settings={data || undefined} />
        <ClientTabSystem
          viewState={[tab || "invoices", setTab]}
          items={[
            { id: "invoices", title: t("moaTabInvoices"), content: <MoadianInvoices refreshKey={refreshKey} onChanged={bump} /> },
            // Noyan itself books no purchases
            ...(platform ? [] : [{ id: "purchases", title: t("moaTabPurchases"), content: <MoadianPurchases refreshKey={refreshKey} onChanged={bump} /> }]),
            {
              id: "settings",
              title: t("moaTabSettings"),
              content: <MoadianSettingsTab settings={data || undefined} onChanged={bump} />,
            },
          ]}
        />
      </div>
    </MoadianContext.Provider>
  );
};

export default MoadianPage;
