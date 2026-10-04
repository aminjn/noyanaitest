"use client";

import { ContentKey } from "@/Components/Enums/contentKeys";
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
import { InvContext, useInvText } from "./invShared";
import InventoryItems from "./InventoryItems";
import InventoryPurchases from "./InventoryPurchases";
import InventorySuppliers from "./InventorySuppliers";
import InventoryMoves from "./InventoryMoves";

type Summary = {
  items: number;
  tracked: number;
  value: number;
  low: number;
  expired: number;
  nearExpiry: number;
  payable: number;
  drafts: number;
};

const Tiles = ({ api, refreshKey }: { api: string; refreshKey: number }) => {
  const t = useInvText();
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
      {tile(t("invStockValue"), f.money(data?.value), classes.primaryTile, t("toman"))}
      {tile(t("invLowCount"), f.money(data?.low))}
      {tile(t("invNearExpiry"), f.money(data?.nearExpiry))}
      {tile(t("invExpired"), f.money(data?.expired))}
      {tile(t("invPayable"), f.money(data?.payable), "", t("toman"))}
    </div>
  );
};

// Noyan Business inventory and purchasing (2026-10, docs/business-suite.md
// phase 2) for the panels that keep stock: pharmacy, para-clinic (lab kits),
// clinic and hospital (consumables). One page, its parts as tabs.
const InventoryPage = ({
  node,
  panel,
}: {
  node: NodeWithAcl;
  // "/pharmacypanel", "/clinicpanel", ...
  panel: string;
}) => {
  const t = useInvText();
  const hasAccess = useAcl(node);
  useBreadCrump([
    { title: t("dashboard"), target: panel },
    { title: t("financeSectionMenu"), target: `${panel}/finance` },
    { title: t("invTitle"), target: `${panel}/finance/inventory` },
  ]);
  const api = `/${node}/inv`;
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);
  return (
    <InvContext.Provider value={{ api, canWrite: hasAccess("manageInventory"), kind: node }}>
      <div className={classes.main}>
        <header className={classes.header}>
          <h1 className={classes.title}>{t("invTitle")}</h1>
          <span className={classes.subtitle}>{t("invSubtitle")}</span>
        </header>
        <Tiles api={api} refreshKey={refreshKey} />
        <ClientTabSystem
          items={[
            { id: "items", title: t("invTabItems"), content: <InventoryItems refreshKey={refreshKey} onChanged={bump} /> },
            { id: "purchases", title: t("invTabPurchases"), content: <InventoryPurchases refreshKey={refreshKey} onChanged={bump} /> },
            { id: "suppliers", title: t("invTabSuppliers"), content: <InventorySuppliers refreshKey={refreshKey} onChanged={bump} /> },
            { id: "moves", title: t("invTabMoves"), content: <InventoryMoves refreshKey={refreshKey} /> },
          ]}
        />
      </div>
    </InvContext.Provider>
  );
};

export default InventoryPage;
