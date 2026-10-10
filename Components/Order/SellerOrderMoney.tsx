"use client";

import { Fragment, ReactNode } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { currencize } from "@/Components/helpers/currencize";
import Table, { TableRenderer } from "@/Components/Admin/UI/Table";
import List from "@/Components/Admin/UI/List";
import DataPair from "@/Components/Admin/UI/DataPair";
import Title from "@/Components/Admin/UI/Title";
import Badge, { BadgeColor } from "@/Components/UI/Badge";
import classes from "./SellerOrderMoney.module.css";

// A seller's money on its own lines of a cart order (2026-10, backend
// Lib/orderSellerMoney.ts), shared by the pharmacy and the lab panels: per
// line and in total, the sale price, the club discount, the discount code
// (the seller's own share, and the part NoyanAI pays - which never lowers
// the seller's income), the supplementary insurer's share and where its
// claim stands, what the buyer paid, the commission and the payout.

const NS: ContentNamespace[] = ["common", "sellerOrderMoney"];

export type SellerClaimStatus = "candidate" | "inClaim" | "paid" | "rejected" | "reimburse";

export interface ISellerLineMoney {
  line: string;
  status: string;
  listPrice: number;
  clubDiscount: number;
  sellerPromo: number;
  platformPromo: number;
  promoReduced: number;
  sale: number;
  tax: number;
  insurerShare: number;
  claim: SellerClaimStatus | null;
  buyerPaid: number;
  refunded: number;
  commission: number;
  commissionPercent: number;
  payout: number;
  held: boolean;
  estimated: boolean;
}

export interface ISellerMoneyTotals {
  listPrice: number;
  clubDiscount: number;
  sellerPromo: number;
  platformPromo: number;
  promoReduced: number;
  sale: number;
  tax: number;
  insurerShare: number;
  buyerPaid: number;
  refunded: number;
  commission: number;
  payout: number;
  insurerReceivable: number;
}

export interface ISellerOrderMoney {
  lines?: ISellerLineMoney[];
  totals?: ISellerMoneyTotals;
  promo?: { title?: string; code?: string; fundedBy?: "platform" | "seller" } | null;
  insurer?: string | null;
}

const claimKey: Record<SellerClaimStatus, ContentKey> = {
  candidate: "moneyClaimCandidate",
  inClaim: "moneyClaimInList",
  paid: "moneyClaimPaid",
  rejected: "moneyClaimRejected",
  reimburse: "moneyClaimReimburse",
};

const claimColor: Record<SellerClaimStatus, BadgeColor> = {
  candidate: "Warning",
  inClaim: "Info",
  paid: "Success",
  rejected: "Error",
  reimburse: "Disabled",
};

const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

const SellerOrderMoney = ({
  money,
  names,
  tableName,
}: {
  money?: ISellerOrderMoney | null;
  // a line's name by its id
  names: Record<string, string>;
  tableName: string;
}) => {
  const getContent = useScopedLocale(NS);
  const lines = Array.isArray(money?.lines) ? money!.lines.filter((l) => !!l?.line) : [];
  if (!lines.length) return null;
  const totals = money?.totals;
  const toman = (v: unknown) => `${currencize(n(v))} ${getContent("toman")}`;
  const minus = (v: unknown) => (n(v) > 0 ? `− ${toman(v)}` : "-");
  const any = (k: keyof ISellerLineMoney) => lines.some((l) => n(l[k]) > 0);
  const claimBadge = (claim: SellerClaimStatus | null) =>
    claim && claimKey[claim] ? (
      <Badge color={claimColor[claim]} size="S">
        {getContent(claimKey[claim])}
      </Badge>
    ) : null;
  const code = money?.promo?.code || money?.promo?.title || "";

  const renderer: TableRenderer<ISellerLineMoney> = {
    name: {
      name: getContent("name"),
      value: (node) => names[node.line] || "",
      component: (node) => (
        <span className={node.status === "cancelled" ? classes.cancelled : undefined}>{names[node.line] || "-"}</span>
      ),
    },
    listPrice: { name: getContent("moneyListPrice"), value: (node) => node.listPrice, component: (node) => toman(node.listPrice), filter: "Number" },
  };
  if (any("clubDiscount"))
    renderer.clubDiscount = { name: getContent("moneyClubDiscount"), value: (node) => node.clubDiscount, component: (node) => minus(node.clubDiscount), filter: "Number" };
  if (any("sellerPromo"))
    renderer.sellerPromo = { name: getContent("moneySellerPromo"), value: (node) => node.sellerPromo, component: (node) => minus(node.sellerPromo), filter: "Number" };
  if (any("platformPromo"))
    renderer.platformPromo = { name: getContent("moneyPlatformPromo"), value: (node) => node.platformPromo, component: (node) => (n(node.platformPromo) > 0 ? toman(node.platformPromo) : "-"), filter: "Number" };
  if (any("insurerShare") || lines.some((l) => !!l.claim))
    renderer.insurerShare = {
      name: getContent("moneyInsurerShare"),
      value: (node) => node.insurerShare,
      component: (node) => (
        <span className={classes.cell}>
          {n(node.insurerShare) > 0 ? toman(node.insurerShare) : "-"}
          {claimBadge(node.claim)}
        </span>
      ),
      filter: "Number",
    };
  if (any("tax"))
    renderer.tax = { name: getContent("moneyTax"), value: (node) => node.tax, component: (node) => toman(node.tax), filter: "Number" };
  renderer.buyerPaid = {
    name: getContent("moneyBuyerPaid"),
    value: (node) => node.buyerPaid,
    component: (node) => toman(node.buyerPaid),
    filter: "Number",
  };
  // a cancelled line: what went back to the buyer
  if (lines.some((l) => l.status === "cancelled"))
    renderer.refunded = {
      name: getContent("moneyRefunded"),
      value: (node) => node.refunded,
      component: (node) => (node.status === "cancelled" ? toman(node.refunded) : "-"),
      filter: "Number",
    };
  renderer.commission = {
    name: getContent("moneyCommission"),
    value: (node) => node.commission,
    component: (node) =>
      node.status === "cancelled" ? "-" : `${toman(node.commission)} (${currencize(n(node.commissionPercent))}%)`,
    filter: "Number",
  };
  renderer.payout = {
    name: getContent("moneyPayout"),
    value: (node) => node.payout,
    component: (node) => (
      <span className={classes.cell}>
        <strong>{node.status === "cancelled" ? "-" : toman(node.payout)}</strong>
        {node.status !== "cancelled" && (node.estimated || node.held) && (
          <Badge color={node.estimated ? "Disabled" : "Info"} size="S">
            {getContent(node.estimated ? "moneyEstimated" : "moneyHeld")}
          </Badge>
        )}
      </span>
    ),
    filter: "Number",
  };

  const pairs: [ContentKey, ReactNode][] = [];
  if (totals) {
    pairs.push(["moneyListPrice", toman(totals.listPrice)]);
    if (n(totals.clubDiscount) > 0) pairs.push(["moneyClubDiscount", minus(totals.clubDiscount)]);
    if (n(totals.sellerPromo) > 0) pairs.push(["moneySellerPromo", minus(totals.sellerPromo)]);
    if (n(totals.sellerPromo) > 0 || n(totals.clubDiscount) > 0) pairs.push(["moneySale", toman(totals.sale)]);
    if (n(totals.tax) > 0) pairs.push(["moneyTax", toman(totals.tax)]);
    if (n(totals.insurerShare) > 0)
      pairs.push([
        "moneyInsurerShare",
        <span key="ins" className={classes.cell}>
          {minus(totals.insurerShare)}
          {!!money?.insurer && <small className={classes.note}>{money.insurer}</small>}
        </span>,
      ]);
    if (n(totals.platformPromo) > 0)
      pairs.push([
        "moneyPlatformPromo",
        <span key="pp" className={classes.cell}>
          {toman(totals.platformPromo)}
          <small className={classes.note}>{getContent("moneyPlatformPromoNote")}</small>
        </span>,
      ]);
    pairs.push(["moneyBuyerPaid", toman(totals.buyerPaid)]);
    pairs.push(["moneyCommission", minus(totals.commission)]);
    pairs.push(["moneyPayout", <strong key="po">{toman(totals.payout)}</strong>]);
    if (n(totals.insurerReceivable) > 0) pairs.push(["moneyInsurerReceivable", toman(totals.insurerReceivable)]);
    if (n(totals.refunded) > 0) pairs.push(["moneyRefunded", toman(totals.refunded)]);
  }

  return (
    <div className={classes.main}>
      <Title>{getContent("sellerMoneyTitle")}</Title>
      {!!code && (
        <p className={classes.hint}>
          {getContent(money?.promo?.fundedBy === "seller" ? "moneyCodeSeller" : "moneyCodePlatform", [code])}
        </p>
      )}
      {n(totals?.promoReduced) > 0 && (
        <p className={classes.hint}>{getContent("moneyPromoReducedNote", [currencize(n(totals?.promoReduced))])}</p>
      )}
      <Table name={tableName} data={lines} renderer={renderer} />
      {!!pairs.length && (
        <Fragment>
          <Title>{getContent("moneyTotals")}</Title>
          <List>
            {pairs.map(([key, value]) => (
              <DataPair key={key} title={getContent(key)} value={value} />
            ))}
          </List>
        </Fragment>
      )}
      {lines.some((l) => l.estimated && l.status !== "cancelled") && (
        <p className={classes.hint}>{getContent("moneyEstimatedNote")}</p>
      )}
    </div>
  );
};

export default SellerOrderMoney;
