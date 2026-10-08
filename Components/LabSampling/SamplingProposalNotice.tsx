"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import classes from "./SamplingReschedulePopup.module.css";
import cartClasses from "../Cart/CartSamplingSection.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useScopedLocale from "../Hooks/useScopedLocale";
import useNotification from "../Hooks/useNotification";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { currencize } from "../helpers/currencize";
import { tehranDateFormat } from "../helpers/tehranTime";
import { useIntlLocale, useListSeparator } from "../i18n/navigation";
import Button from "../UI/Button";
import WalletShortfallTopUp from "../Payment/WalletShortfallTopUp";
import { addressCityLabel, IUserAddress } from "../Dashboard/Address/DashboardManageAddressesPage";
import { SamplingMoveInfo, SamplingProposal } from "./samplingTypes";
import useSamplingFormat from "./useSamplingFormat";
import { t2xsRegular, tsmDemiBold, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "labSampling"];

const statusKey: Record<string, string> = {
  open: "lsProposalPending",
  accepted: "lsProposalAccepted",
  declined: "lsProposalDeclined",
  withdrawn: "lsProposalWithdrawn",
  expired: "lsProposalExpired",
  closed: "lsProposalClosed",
};

const cityIdOf = (a: IUserAddress) => (!a.city ? "" : typeof a.city === "string" ? a.city : a.city._id);

const usePlaceText = () => {
  const getContent = useScopedLocale(NS);
  const fmt = useSamplingFormat();
  return (p: SamplingProposal) =>
    `${getContent((p.kind === "home" ? "lsAtHome" : "lsAtLab") as ContentKey)} · ${fmt.longDay(p.ymd)} · ${fmt.range(p.ymd, p.start, p.end)}`;
};

// The lab's side (agenda, incoming order page): its latest proposal and how
// it ended; an open one can be withdrawn.
export const LabProposalStatus = ({
  proposal,
  onWithdraw,
}: {
  proposal?: SamplingProposal | null;
  onWithdraw?: () => Promise<unknown>;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string) => getContent(key as ContentKey);
  const notify = useNotification();
  const place = usePlaceText();
  const [busy, setBusy] = useState(false);
  if (!proposal || typeof proposal !== "object" || !proposal.ymd) return null;
  const withdraw = async () => {
    if (busy || !onWithdraw) return;
    setBusy(true);
    try {
      await onWithdraw();
      notify(t("lsProposalWithdrawn"), "Success");
    } catch (err) {
      notify((err as Error)?.message || "", "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={classes.body}>
      <span className={`${proposal.status === "open" ? classes.fee : classes.muted} ${t2xsRegular}`}>
        {`${t(statusKey[proposal.status] || "lsProposalClosed")}: ${place(proposal)}`}
      </span>
      {proposal.status === "open" && !!onWithdraw && (
        <div className={classes.actions}>
          <Button size="S" mode="Outline" variant="Neutral" radius="Medium" isLoading={busy} onClick={withdraw}>
            {t("lsProposalWithdraw")}
          </Button>
        </div>
      )}
    </div>
  );
};

// The buyer's side (order page): the lab's open proposal, what it costs or
// gives back, and accept / decline. A home visit is at one of the buyer's
// addresses the lab serves; when the wallet can't cover the home fee, the
// SEP top-up is offered first (WalletShortfallTopUp) and the buyer comes
// back here to accept. Not answering keeps the booked appointment.
export const BuyerProposalCard = ({
  info,
  walletBalance,
  onAnswer,
}: {
  info: SamplingMoveInfo;
  walletBalance?: number;
  onAnswer: (answer: "accept" | "decline", address?: string) => Promise<unknown>;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string, args?: string[]) => getContent(key as ContentKey, args);
  const notify = useNotification();
  const intl = useIntlLocale();
  const listSep = useListSeparator();
  const place = usePlaceText();
  const proposal = info?.proposal;
  const isOpen = !!proposal && proposal.status === "open" && !!proposal.ymd;
  const isHome = proposal?.kind === "home";
  const { data: addresses } = useSWR<IUserAddress[]>(
    isOpen && isHome ? `${API}/user/address` : null,
    (url: string) => fetcher({ url }).then((res) => (Array.isArray(res?.data) ? res.data : [])),
  );
  const cities = useMemo(() => (Array.isArray(info?.homeCities) ? info.homeCities : []), [info?.homeCities]);
  const list = Array.isArray(addresses) ? addresses : [];
  const served = list.filter((a) => cities.includes(cityIdOf(a)));
  const [picked, setPicked] = useState<string | undefined>();
  const address = picked || served[served.length - 1]?._id;
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  if (!isOpen || !proposal) return null;

  const feeDelta = Number(proposal.feeDelta) || 0;
  const short = typeof walletBalance === "number" && feeDelta > 0 && walletBalance < feeDelta;
  const ready = !short && (!isHome || !!address);
  let expires = "";
  try {
    expires = proposal.expiresAt
      ? tehranDateFormat(intl, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(proposal.expiresAt))
      : "";
  } catch {
    expires = "";
  }

  const answer = async (a: "accept" | "decline") => {
    if (busy || (a === "accept" && !ready)) return;
    setBusy(a);
    try {
      await onAnswer(a, a === "accept" && isHome ? address : undefined);
      notify(t(a === "accept" ? "lsMoved" : "lsProposalDeclinedDone"), "Success");
    } catch (err) {
      notify((err as Error)?.message || "", "Error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={classes.body}>
      <span className={tsmDemiBold}>{t("lsProposalTitle")}</span>
      <span className={tsmRegular}>{place(proposal)}</span>
      {!!proposal.reason && <span className={`${classes.muted} ${t2xsRegular}`}>{proposal.reason}</span>}
      {feeDelta !== 0 && (
        <span className={`${classes.fee} ${t2xsRegular}`}>
          {feeDelta > 0
            ? t("lsMoveFeeCharge", [currencize(feeDelta)])
            : t("lsMoveFeeRefund", [currencize(-feeDelta)])}
        </span>
      )}
      {isHome && (
        <div className={cartClasses.addresses}>
          <span className={`${classes.muted} ${t2xsRegular}`}>{t("lsHomeAddress")}</span>
          {!!addresses && !served.length && (
            <span className={`${classes.muted} ${t2xsRegular}`}>{t("lsNoHomeAddress")}</span>
          )}
          {list.map((a) => {
            const inArea = cities.includes(cityIdOf(a));
            return (
              <button
                key={a._id}
                type="button"
                disabled={!inArea}
                className={`${cartClasses.address} ${address === a._id ? cartClasses.activeAddress : ""}`}
                onClick={() => setPicked(a._id)}
              >
                <span className={tsmRegular}>{a.displayName}</span>
                <span className={t2xsRegular}>
                  {[addressCityLabel(a.city, listSep), a.address].filter(Boolean).join(" - ")}
                </span>
                {!inArea && <span className={t2xsRegular}>{t("lsAddressOutOfArea")}</span>}
              </button>
            );
          })}
        </div>
      )}
      {short && <WalletShortfallTopUp balance={walletBalance!} total={feeDelta} />}
      {!!expires && <span className={`${classes.muted} ${t2xsRegular}`}>{t("lsProposalExpiresHint", [expires])}</span>}
      <div className={classes.actions}>
        <Button
          size="S"
          radius="Medium"
          variant={ready ? "Primary" : "Disable"}
          isLoading={busy === "accept"}
          onClick={() => answer("accept")}
        >
          {t("lsProposalAccept")}
        </Button>
        <Button
          size="S"
          mode="Outline"
          variant="Neutral"
          radius="Medium"
          isLoading={busy === "decline"}
          onClick={() => answer("decline")}
        >
          {t("lsProposalDecline")}
        </Button>
      </div>
    </div>
  );
};
