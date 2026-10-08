"use client";

import { useState } from "react";
import classes from "./SamplingReschedulePopup.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import usePopup from "../Hooks/usePopup";
import useNotification from "../Hooks/useNotification";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import Button from "../UI/Button";
import ConfirmationPopup from "../Admin/UI/ConfirmationPopup";
import SamplingReschedulePopup from "./SamplingReschedulePopup";
import SamplingProposalPopup, { SamplingProposalPayload } from "./SamplingProposalPopup";
import { BuyerProposalCard, LabProposalStatus } from "./SamplingProposalNotice";
import { ILabSampling, SamplingMoveInfo, SamplingMovePayload } from "./samplingTypes";
import { t2xsRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "labSampling"];

// The viewer's actions on one sampling appointment (backend
// Lib/labSamplingReschedule.ts samplingMoveInfo): "change time" for the
// buyer and the lab; for the buyer also "cancel" (its tests back in full),
// with a notice when the lab or support moved it. Why a move is not
// possible (too close to the time, no moves left) is said, not hidden.
// The lab may also propose the other kind (in-lab <-> home) at a new slot -
// shown to it with its answer, and to the buyer to accept or decline
// (backend Lib/labSamplingProposal.ts).
const SamplingActions = ({
  sampling,
  info,
  viewer,
  labName,
  tests,
  onMove,
  onCancel,
  onPropose,
  onWithdrawProposal,
  onAnswerProposal,
  walletBalance,
}: {
  sampling: ILabSampling;
  info?: SamplingMoveInfo | null;
  viewer: "buyer" | "lab";
  labName?: string;
  tests?: string[];
  onMove: (payload: SamplingMovePayload) => Promise<unknown>;
  onCancel?: () => Promise<unknown>;
  // the lab: propose / withdraw an in-lab <-> home switch
  onPropose?: (payload: SamplingProposalPayload) => Promise<unknown>;
  onWithdrawProposal?: () => Promise<unknown>;
  // the buyer: answer the lab's open proposal
  onAnswerProposal?: (answer: "accept" | "decline", address?: string) => Promise<unknown>;
  walletBalance?: number;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string, args?: string[]) => getContent(key as ContentKey, args);
  const { setPopup, closePopup } = usePopup();
  const notify = useNotification();
  const [cancelling, setCancelling] = useState(false);
  if (!info || typeof info !== "object") return null;
  const blockText =
    info.block === "tooLate"
      ? t("lsMoveTooLate", [String(info.leadMinutes)])
      : info.block === "limit"
        ? t("lsMoveLimit")
        : "";
  const canCancel = viewer === "buyer" && !!onCancel && info.canCancel;
  const proposal = info.proposal && typeof info.proposal === "object" ? info.proposal : null;
  const canPropose = viewer === "lab" && !!onPropose && !!info.canPropose;
  const buyerProposal = viewer === "buyer" && !!onAnswerProposal && proposal?.status === "open";
  const labProposal = viewer === "lab" && !!proposal;
  if (!info.canMove && !canCancel && !blockText && !canPropose && !buyerProposal && !labProposal) return null;

  const cancel = async () => {
    if (cancelling || !onCancel) return;
    setCancelling(true);
    try {
      await onCancel();
      closePopup("CancelSampling");
      notify(t("lsCancelled"), "Success");
    } catch (err) {
      notify((err as Error)?.message || "", "Error");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className={classes.body}>
      {buyerProposal && (
        <BuyerProposalCard info={info} walletBalance={walletBalance} onAnswer={onAnswerProposal!} />
      )}
      {labProposal && <LabProposalStatus proposal={proposal} onWithdraw={onWithdrawProposal} />}
      {viewer === "buyer" && info.movedByOther && canCancel && (
        <span className={`${classes.fee} ${t2xsRegular}`}>{t("lsMovedNotice")}</span>
      )}
      {!info.canMove && !!blockText && (
        <span className={`${classes.muted} ${t2xsRegular}`}>{blockText}</span>
      )}
      <div className={classes.actions}>
        {info.canMove && (
          <Button
            size="S"
            mode="Outline"
            radius="Medium"
            onClick={() =>
              setPopup(
                "RescheduleSampling",
                <SamplingReschedulePopup
                  sampling={sampling}
                  info={info}
                  labName={labName}
                  tests={tests}
                  lockKind={viewer === "lab"}
                  loadAddresses={viewer === "buyer"}
                  onSubmit={onMove}
                />,
              )
            }
          >
            {t("lsReschedule")}
          </Button>
        )}
        {canPropose && (
          <Button
            size="S"
            mode="Outline"
            radius="Medium"
            onClick={() =>
              setPopup(
                "ProposeSampling",
                <SamplingProposalPopup sampling={sampling} info={info} tests={tests} onSubmit={onPropose!} />,
              )
            }
          >
            {t(sampling.kind === "home" ? "lsProposeLab" : "lsProposeHome")}
          </Button>
        )}
        {canCancel && (
          <Button
            size="S"
            mode="Outline"
            variant="Error"
            radius="Medium"
            isLoading={cancelling}
            onClick={() =>
              setPopup(
                "CancelSampling",
                <ConfirmationPopup message={t("lsCancelConfirm")} isLoading={cancelling} onConfirm={cancel} />,
              )
            }
          >
            {t("lsCancelAppointment")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SamplingActions;
