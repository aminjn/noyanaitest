"use client";

import { useState } from "react";
import ActionInbox, { InboxAction } from "@/Components/UI/ActionInbox";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import Badge from "@/Components/UI/Badge";
import Link from "@/Components/i18n/Link";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { tehranDateFormat } from "@/Components/helpers/tehranTime";
import { fetcher } from "@/Components/helpers/fetcher";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import {
  contractActionsOf,
  ContractSide,
  contractStatusOf,
  IInsuranceContract,
  lastDayOf,
  providerKindKey,
  providerPath,
} from "./insuranceContracts";
import { EndContractPopup, RejectContractPopup } from "./ContractPopups";
import classes from "./InsuranceContracts.module.css";

const NS: ContentNamespace[] = ["common", "insuranceContracts"];

// One list of insurer contracts for both sides (2026-10): the provider
// panels see the insurer, the insurer's panel the provider. Each row shows
// the status as this side reads it, the validity, the reason of a
// rejection / an end, and only the one-way steps this side may take now.
const ContractList = ({
  items,
  side,
  base,
  canEdit,
  mutate,
  highlight,
}: {
  items: IInsuranceContract[];
  side: ContractSide;
  // e.g. `${API}/doctor/insurer-contract` or `${API}/insurance/contract`
  base: string;
  canEdit: boolean;
  mutate: () => unknown;
  highlight?: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const dateFormat = tehranDateFormat(intlTag, { dateStyle: "medium" });
  const fmt = (d?: Date | string | null) => {
    if (!d) return "";
    const date = d instanceof Date ? d : new Date(d);
    return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
  };
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState<string | null>(null);

  const post = async (c: IInsuranceContract, action: "approve" | "cancel") => {
    if (busy) return;
    setBusy(c._id);
    try {
      await fetcher({ url: `${base}/${c._id}/${action}`, method: "POST" });
      pushNotification(getContent("icDone"), "Success");
      await mutate();
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusy(null);
    }
  };

  const validity = (c: IInsuranceContract) => {
    const until = lastDayOf(c.validUntil);
    if (c.validFrom && until) return getContent("icRange", [fmt(c.validFrom), fmt(until)]);
    if (c.validFrom) return getContent("icSince", [fmt(c.validFrom)]);
    if (until) return getContent("icTill", [fmt(until)]);
    return getContent("icAlways");
  };

  return (
    <ActionInbox
      highlight={highlight}
      items={items.map((c) => {
        const other = side === "provider" ? c.insurance : c.provider;
        const name = other?.name || "—";
        const href =
          side === "provider"
            ? other?.slug
              ? `/insurance/${other.slug}`
              : ""
            : other?.slug
              ? `${providerPath[c.providerKind] || ""}/${other.slug}`
              : "";
        const status = contractStatusOf(c, side);
        const can = contractActionsOf(c, side);
        const actions: InboxAction[] = [];
        if (canEdit && can.answer) {
          actions.push({
            label: getContent(side === "provider" ? "icAccept" : "icApprove"),
            kind: "primary",
            onClick: () => post(c, "approve"),
            disabled: busy === c._id,
          });
          actions.push({
            label: getContent("icReject"),
            kind: "ghost",
            onClick: () =>
              setPopup("ContractReject", <RejectContractPopup url={`${base}/${c._id}/reject`} mutate={mutate} />),
            disabled: busy === c._id,
          });
        }
        if (canEdit && can.withdraw)
          actions.push({
            label: getContent("icWithdraw"),
            kind: "ghost",
            onClick: () => post(c, "cancel"),
            disabled: busy === c._id,
          });
        if (canEdit && can.end)
          actions.push({
            label: getContent("icEnd"),
            kind: "danger",
            onClick: () => setPopup("ContractEnd", <EndContractPopup url={`${base}/${c._id}/end`} mutate={mutate} />),
            disabled: busy === c._id,
          });
        const reason =
          c.status === "Rejected"
            ? c.rejectReason
            : c.status === "Ended" || c.endsAt
              ? c.endReason
              : c.status === "Pending"
                ? c.note
                : "";
        return {
          id: c._id,
          lead: <InitialAvatar name={name} seed={other?._id || c._id} size="2.5rem" />,
          title: href ? (
            <Link href={href} target="_blank">
              {name}
            </Link>
          ) : (
            name
          ),
          subtitle: (
            <span className={classes.subtitle}>
              <Badge color={status.color} size="S">
                {getContent(status.key, status.date ? [fmt(status.date)] : undefined)}
              </Badge>
              {side === "insurer" && <span>{getContent(providerKindKey[c.providerKind])}</span>}
              <span>{validity(c)}</span>
            </span>
          ),
          body: reason ? (
            <>
              {getContent(c.status === "Pending" ? "icNote" : "icReason")}: {reason}
            </>
          ) : undefined,
          actions,
        };
      })}
    />
  );
};

export default ContractList;
