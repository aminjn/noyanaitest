"use client";

import { useState } from "react";
import classes from "./SamplingReschedulePopup.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import usePopup from "../Hooks/usePopup";
import useNotification from "../Hooks/useNotification";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { currencize } from "../helpers/currencize";
import PopupCard from "../UI/PopupCard";
import Button from "../UI/Button";
import AreaInput from "../UI/AreaInput";
import CartSamplingSection, { SamplingDrafts } from "../Cart/CartSamplingSection";
import { ILabSampling, LabSamplingKind, SamplingMoveInfo, samplingLabId } from "./samplingTypes";
import useSamplingFormat from "./useSamplingFormat";
import { t2xsRegular, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "labSampling"];

export type SamplingProposalPayload = { ymd: string; start: number; reason?: string };

// The lab proposes the other kind - a home visit instead of the lab, or
// the other way round - at one of its free slots (backend
// Lib/labSamplingProposal.ts). The same slot picker as checkout and
// reschedule (CartSamplingSection), locked to the proposed kind; the buyer
// then accepts or declines on the order page and until then nothing changes.
const SamplingProposalPopup = ({
  sampling,
  info,
  tests,
  onSubmit,
}: {
  sampling: ILabSampling;
  info: SamplingMoveInfo;
  tests?: string[];
  onSubmit: (payload: SamplingProposalPayload) => Promise<unknown>;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string, args?: string[]) => getContent(key as ContentKey, args);
  const fmt = useSamplingFormat();
  const { closePopup } = usePopup();
  const notify = useNotification();
  const lab = samplingLabId(sampling);
  const kind: LabSamplingKind = sampling.kind === "home" ? "lab" : "home";
  const [drafts, setDrafts] = useState<SamplingDrafts>({ [lab]: { kind, slot: null } });
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const slot = drafts[lab]?.slot || null;
  const paidFee = Math.max(0, Number(sampling.fee) || 0);
  const feeNote =
    kind === "home"
      ? info.homeFee > 0
        ? t("lsProposalFeeCharge", [currencize(info.homeFee)])
        : ""
      : paidFee > 0
        ? t("lsProposalFeeRefund", [currencize(paidFee)])
        : "";

  const submit = async () => {
    if (!slot || busy) return;
    setBusy(true);
    try {
      await onSubmit({ ymd: slot.ymd, start: slot.start, ...(reason.trim() ? { reason: reason.trim() } : {}) });
      notify(t("lsProposalSent"), "Success");
      closePopup();
    } catch (err) {
      notify((err as Error)?.message || "", "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={t(kind === "home" ? "lsProposeHome" : "lsProposeLab")}>
      <div className={classes.body}>
        <span className={`${classes.muted} ${t2xsRegular}`}>
          {`${t("lsCurrentTime")}: ${fmt.longDay(sampling.ymd)} · ${fmt.range(sampling.ymd, sampling.start, sampling.end)} · ${t(sampling.kind === "home" ? "lsAtHome" : "lsAtLab")}`}
        </span>
        <span className={`${classes.muted} ${t2xsRegular}`}>{t("lsProposalHint")}</span>
        <CartSamplingSection
          bare
          lockKind
          groups={[
            {
              paraClinic: lab,
              tests: Array.isArray(tests) ? tests : [],
              home: kind === "home",
              homeFee: info.homeFee,
              homeCities: Array.isArray(info.homeCities) ? info.homeCities : [],
            },
          ]}
          value={drafts}
          onChange={setDrafts}
        />
        {!!feeNote && <span className={`${classes.fee} ${tsmRegular}`}>{feeNote}</span>}
        <AreaInput title={t("lsProposalReason")} onChange={(e) => setReason(e.target.value.slice(0, 500))} />
        <div className={classes.actions}>
          <Button variant={slot ? "Primary" : "Disable"} isLoading={busy} onClick={submit}>
            {t("lsProposalSend")}
          </Button>
          <Button variant="Neutral" mode="Outline" onClick={() => closePopup()}>
            {t("lsKeepTime")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export default SamplingProposalPopup;
