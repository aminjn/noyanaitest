"use client";

import { useState } from "react";
import useSWR from "swr";
import classes from "./Sampling.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useNotification from "@/Components/Hooks/useNotification";
import useAcl from "@/Components/Hooks/useAcl";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import Button from "@/Components/UI/Button";
import Badge, { BadgeColor } from "@/Components/UI/Badge";
import DateInput from "@/Components/UI/DateInput";
import Link from "@/Components/i18n/Link";
import { useListSeparator } from "@/Components/i18n/navigation";
import { currencize } from "@/Components/helpers/currencize";
import { addDaysYmd, tehranTodayYmd, tehranYmd } from "@/Components/helpers/tehranTime";
import {
  addressCityLabel,
  IUserAddress,
  localPhone,
} from "@/Components/Dashboard/Address/DashboardManageAddressesPage";
import useSamplingFormat from "@/Components/LabSampling/useSamplingFormat";
import {
  ILabSampling,
  LabSamplingKind,
  SamplingMoveInfo,
  SamplingMovePayload,
  samplingStatusKey,
} from "@/Components/LabSampling/samplingTypes";
import SamplingActions from "@/Components/LabSampling/SamplingActions";
import { SamplingMoves } from "@/Components/LabSampling/SamplingInfo";
import { t2xsRegular, tsmDemiBold, tsmRegular } from "@/Components/UI/Typography";

const NS: ContentNamespace[] = ["common", "labSampling"];

type AgendaItem = ILabSampling & {
  order: string;
  buyer?: { username?: string; phone?: string };
  address?: IUserAddress | null;
  tests?: { _id: string; name: string; status: string }[];
  // what the lab may do with it (backend Lib/labSamplingReschedule.ts)
  move?: SamplingMoveInfo | null;
};

type Agenda = {
  ymd: string;
  enabled: boolean;
  closed: boolean;
  items: AgendaItem[];
  slots: { kind: LabSamplingKind; start: number; end: number; capacity: number; booked: number }[];
};

const statusColor: Record<string, BadgeColor> = {
  lsStatusAwaiting: "Warning",
  lsStatusConfirmed: "Info",
  lsStatusCollected: "Success",
  lsStatusDone: "Success",
  lsStatusCancelled: "Disabled",
};

// The lab's day of samplings (Halodoc / SnappDoctor lab partner apps): every
// appointment of the day in time order, in the lab or at a patient's home,
// with what to confirm and whose sample was taken; and how full each slot is.
const SamplingAgendaTab = ({
  initialDate,
  onOpenSettings,
}: {
  initialDate?: string;
  onOpenSettings: () => void;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string, args?: string[]) => getContent(key as ContentKey, args);
  const fmt = useSamplingFormat();
  const listSep = useListSeparator();
  const notify = useNotification();
  const hasAccess = useAcl("paraClinic");
  const canMutate = hasAccess("mutateOrders");
  const [ymd, setYmd] = useState<string>(
    initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : tehranTodayYmd(),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const { data, error, mutate } = useSWR<Agenda>(
    `${API}/paraClinic/sampling?date=${ymd}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const act = async (item: AgendaItem, action: "confirm" | "collected") => {
    if (busy) return;
    setBusy(item._id);
    try {
      await fetcher({
        url: `${API}/paraClinic/sampling/${item._id}`,
        method: "PATCH",
        payload: { action },
      });
      await mutate();
    } catch (err) {
      notify((err as Error)?.message || "", "Error");
    } finally {
      setBusy(null);
    }
  };

  // another slot of the same kind; the buyer is told and may cancel
  const move = async (item: AgendaItem, payload: SamplingMovePayload) => {
    await fetcher({
      url: `${API}/paraClinic/sampling/${item._id}`,
      method: "PATCH",
      payload: { action: "reschedule", ymd: payload.ymd, start: payload.start },
    });
    await mutate();
  };

  // in-lab <-> home is a proposal the buyer answers (backend
  // Lib/labSamplingProposal.ts)
  const patch = async (item: AgendaItem, payload: Record<string, unknown>) => {
    await fetcher({ url: `${API}/paraClinic/sampling/${item._id}`, method: "PATCH", payload });
    await mutate();
  };

  const items = Array.isArray(data?.items) ? data!.items : [];
  const slots = Array.isArray(data?.slots) ? data!.slots : [];

  return (
    <WithTitle title={t("lsAgenda")}>
      <div className={classes.stack}>
        <div className={classes.toolbar}>
          <Button size="S" mode="Outline" radius="Medium" onClick={() => setYmd(addDaysYmd(ymd, -1))}>
            {t("lsPrevDay")}
          </Button>
          <span className={`${classes.dayTitle} ${tsmDemiBold}`}>{fmt.longDay(ymd)}</span>
          <Button size="S" mode="Outline" radius="Medium" onClick={() => setYmd(addDaysYmd(ymd, 1))}>
            {t("lsNextDay")}
          </Button>
          <Button size="S" mode="Outline" variant="Neutral" radius="Medium" onClick={() => setYmd(tehranTodayYmd())}>
            {t("lsToday")}
          </Button>
          <DateInput
            key={ymd}
            title={t("lsPickDay")}
            defaultValue={ymd}
            onChange={(d) => setYmd(tehranYmd(d))}
          />
        </div>
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <div className={classes.stack}>
              {!data.enabled && (
                <div className={`${classes.notice} ${t2xsRegular}`}>
                  {t("lsNotEnabled")}{" "}
                  <button type="button" className={`${classes.link} ${classes.linkButton}`} onClick={onOpenSettings}>
                    {t("lsSettings")}
                  </button>
                </div>
              )}
              {data.closed && <div className={`${classes.notice} ${t2xsRegular}`}>{t("lsDayClosed")}</div>}
              {!!slots.length && (
                <div className={classes.stack}>
                  <span className={`${classes.muted} ${t2xsRegular}`}>{t("lsSlotUsage")}</span>
                  <div className={classes.usage}>
                    {slots.map((s) => (
                      <span
                        key={`${s.kind}-${s.start}`}
                        className={`${classes.usageChip} ${s.booked >= s.capacity ? classes.usageFull : ""} ${t2xsRegular}`}
                      >
                        <span>{fmt.range(data.ymd, s.start, s.end)}</span>
                        {s.kind === "home" && <span>{t("lsAtHome")}</span>}
                        <span dir="ltr">{`${s.booked}/${s.capacity}`}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!items.length ? (
                <div className={`${classes.notice} ${t2xsRegular}`}>{t("lsNoAppointments")}</div>
              ) : (
                <div className={classes.cards}>
                  {items.map((item) => {
                    const status = samplingStatusKey(item);
                    const address = item.address && typeof item.address === "object" ? item.address : null;
                    return (
                      <div key={item._id} className={classes.card}>
                        <div className={classes.cardHead}>
                          <span className={`${classes.time} ${tsmDemiBold}`}>
                            {fmt.range(item.ymd, item.start, item.end)}
                          </span>
                          <Badge size="S" color={item.kind === "home" ? "Secondary" : "Primarylight"}>
                            {t(item.kind === "home" ? "lsAtHome" : "lsAtLab")}
                          </Badge>
                          <Badge size="S" color={statusColor[status] || "Info"}>
                            {t(status)}
                          </Badge>
                        </div>
                        <span className={tsmRegular}>
                          {`${t("lsBuyer")}: ${[item.buyer?.username, item.buyer?.phone ? localPhone(item.buyer.phone) : ""].filter(Boolean).join(" · ")}`}
                        </span>
                        {!!item.tests?.length && (
                          <span className={`${classes.muted} ${t2xsRegular}`}>
                            {item.tests.map((l) => l.name).filter(Boolean).join(listSep)}
                          </span>
                        )}
                        {!!address && (
                          <span className={`${classes.muted} ${t2xsRegular}`}>
                            {[addressCityLabel(address.city, listSep), address.address].filter(Boolean).join(" - ")}
                            {address.receiverPhone ? ` · ${t("lsPhone")}: ${localPhone(address.receiverPhone)}` : ""}
                          </span>
                        )}
                        {!!item.fee && item.fee > 0 && (
                          <span className={`${classes.muted} ${t2xsRegular}`}>
                            {`${t("lsHomeFee")}: ${currencize(item.fee)} ${t("toman")}`}
                          </span>
                        )}
                        <div className={classes.actions}>
                          {canMutate && item.status === "active" && !item.confirmedAt && (
                            <Button
                              size="S"
                              radius="Medium"
                              isLoading={busy === item._id}
                              onClick={() => act(item, "confirm")}
                            >
                              {t("lsConfirm")}
                            </Button>
                          )}
                          {canMutate && item.status === "active" && !!item.confirmedAt && !item.collectedAt && (
                            <Button
                              size="S"
                              radius="Medium"
                              variant="Success"
                              isLoading={busy === item._id}
                              onClick={() => act(item, "collected")}
                            >
                              {t("lsMarkCollected")}
                            </Button>
                          )}
                          <Link className={`${classes.link} ${t2xsRegular}`} href={`/paraClinicPanel/order/${item.order}`}>
                            {t("lsViewOrder")}
                          </Link>
                        </div>
                        <SamplingMoves sampling={item} viewer="lab" />
                        {canMutate && (
                          <SamplingActions
                            sampling={item}
                            info={item.move}
                            viewer="lab"
                            tests={(item.tests || []).map((l) => l.name).filter(Boolean)}
                            onMove={(payload) => move(item, payload)}
                            onPropose={(payload) => patch(item, { action: "propose", ...payload })}
                            onWithdrawProposal={() => patch(item, { action: "withdrawProposal" })}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </HandleLoading>
      </div>
    </WithTitle>
  );
};

export default SamplingAgendaTab;
