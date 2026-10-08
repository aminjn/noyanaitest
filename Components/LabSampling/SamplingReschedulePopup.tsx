"use client";

import { useState } from "react";
import useSWR from "swr";
import classes from "./SamplingReschedulePopup.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useScopedLocale from "../Hooks/useScopedLocale";
import usePopup from "../Hooks/usePopup";
import useNotification from "../Hooks/useNotification";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { currencize } from "../helpers/currencize";
import PopupCard from "../UI/PopupCard";
import Button from "../UI/Button";
import CartSamplingSection, { SamplingDrafts } from "../Cart/CartSamplingSection";
import { IUserAddress } from "../Dashboard/Address/DashboardManageAddressesPage";
import {
  ILabSampling,
  SamplingMoveInfo,
  SamplingMovePayload,
  samplingLabId,
} from "./samplingTypes";
import useSamplingFormat from "./useSamplingFormat";
import { t2xsRegular, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "labSampling"];

const addressIdOf = (a: ILabSampling["address"]) =>
  !a ? undefined : typeof a === "string" ? a : a._id;

// Moving a sampling appointment (backend Lib/labSamplingReschedule.ts;
// Doctolib / Halodoc self-service reschedule): the same picker as at
// checkout (CartSamplingSection) for another free slot of the lab - and for
// the buyer, in-lab <-> home with the fee difference on the wallet. The lab
// (`lockKind`) only moves the time.
const SamplingReschedulePopup = ({
  sampling,
  info,
  labName,
  tests,
  lockKind,
  loadAddresses,
  onSubmit,
}: {
  sampling: ILabSampling;
  info: SamplingMoveInfo;
  labName?: string;
  tests?: string[];
  lockKind?: boolean;
  // the buyer's own addresses, for a home visit
  loadAddresses?: boolean;
  onSubmit: (payload: SamplingMovePayload) => Promise<unknown>;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string, args?: string[]) => getContent(key as ContentKey, args);
  const fmt = useSamplingFormat();
  const { closePopup } = usePopup();
  const notify = useNotification();
  const lab = samplingLabId(sampling);
  const [drafts, setDrafts] = useState<SamplingDrafts>({
    [lab]: { kind: sampling.kind, slot: null, address: addressIdOf(sampling.address) },
  });
  const [busy, setBusy] = useState(false);
  const { data: addresses } = useSWR<IUserAddress[]>(
    loadAddresses && !lockKind ? `${API}/user/address` : null,
    (url: string) => fetcher({ url }).then((res) => (Array.isArray(res?.data) ? res.data : [])),
  );
  const draft = drafts[lab] || { kind: sampling.kind, slot: null };
  const switchKind = !lockKind && info.canSwitchKind && (info.home || sampling.kind === "home");
  const paidFee = Math.max(0, Number(sampling.fee) || 0);
  const feeNote =
    draft.kind === sampling.kind
      ? ""
      : draft.kind === "home"
        ? info.homeFee > 0
          ? t("lsMoveFeeCharge", [currencize(info.homeFee)])
          : ""
        : paidFee > 0
          ? t("lsMoveFeeRefund", [currencize(paidFee)])
          : "";
  const ready = !!draft.slot && (draft.kind !== "home" || lockKind || !!draft.address);

  const submit = async () => {
    if (!ready || busy || !draft.slot) return;
    setBusy(true);
    try {
      await onSubmit({
        ...(lockKind ? {} : { kind: draft.kind }),
        ymd: draft.slot.ymd,
        start: draft.slot.start,
        ...(!lockKind && draft.kind === "home" && draft.address ? { address: draft.address } : {}),
      });
      notify(t("lsMoved"), "Success");
      closePopup();
    } catch (err) {
      notify((err as Error)?.message || "", "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={t("lsReschedule")}>
      <div className={classes.body}>
        <span className={`${classes.muted} ${t2xsRegular}`}>
          {`${t("lsCurrentTime")}: ${fmt.longDay(sampling.ymd)} · ${fmt.range(sampling.ymd, sampling.start, sampling.end)} · ${t(sampling.kind === "home" ? "lsAtHome" : "lsAtLab")}`}
        </span>
        {info.movesLeft !== null && (
          <span className={`${classes.muted} ${t2xsRegular}`}>
            {t("lsMovesLeft", [String(info.movesLeft)])}
          </span>
        )}
        <CartSamplingSection
          bare
          lockKind={lockKind || !switchKind}
          groups={[
            {
              paraClinic: lab,
              name: labName,
              tests: Array.isArray(tests) ? tests : [],
              home: switchKind && info.home,
              homeFee: info.homeFee,
              homeCities: Array.isArray(info.homeCities) ? info.homeCities : [],
            },
          ]}
          addresses={addresses}
          value={drafts}
          onChange={setDrafts}
        />
        {!!feeNote && <span className={`${classes.fee} ${tsmRegular}`}>{feeNote}</span>}
        <div className={classes.actions}>
          <Button variant={ready ? "Primary" : "Disable"} isLoading={busy} onClick={submit}>
            {t("lsMoveConfirm")}
          </Button>
          <Button variant="Neutral" mode="Outline" onClick={() => closePopup()}>
            {t("lsKeepTime")}
          </Button>
        </div>
      </div>
    </PopupCard>
  );
};

export default SamplingReschedulePopup;
