"use client";

import { ReactNode } from "react";
import classes from "./SamplingInfo.module.css";
import Badge, { BadgeColor } from "../UI/Badge";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { currencize } from "../helpers/currencize";
import { useListSeparator } from "../i18n/navigation";
import { addressCityLabel, localPhone } from "../Dashboard/Address/DashboardManageAddressesPage";
import { ILabSampling, LabSamplingActor, samplingStatusKey } from "./samplingTypes";
import useSamplingFormat from "./useSamplingFormat";
import { t2xsRegular, tsmDemiBold, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "labSampling"];

const statusColor: Record<string, BadgeColor> = {
  lsStatusAwaiting: "Warning",
  lsStatusConfirmed: "Info",
  lsStatusCollected: "Success",
  lsStatusDone: "Success",
  lsStatusCancelled: "Disabled",
};

// who moved it, as the reader sees it
const moverKey = (by: LabSamplingActor, viewer: "buyer" | "lab") =>
  by === "admin"
    ? "lsMovedBySupport"
    : by === "lab"
      ? "lsMovedByLab"
      : viewer === "buyer"
        ? "lsMovedByYou"
        : "lsMovedByPatient";

// One sampling appointment (backend Models/LabSampling.ts): where (the lab,
// or the home address), when (Tehran time), how far it got, and every move
// (Lib/labSamplingReschedule.ts). Shared by the buyer's order page, the
// lab's incoming order page and agenda; `actions` are the viewer's buttons.
const SamplingInfo = ({
  sampling,
  labName,
  tests,
  viewer = "buyer",
  actions,
}: {
  sampling: ILabSampling;
  labName?: string;
  tests?: string[];
  viewer?: "buyer" | "lab";
  actions?: ReactNode;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string, args?: string[]) => getContent(key as ContentKey, args);
  const fmt = useSamplingFormat();
  const listSep = useListSeparator();
  if (!sampling || typeof sampling !== "object" || !sampling.ymd) return null;
  const status = samplingStatusKey(sampling);
  const address = sampling.address && typeof sampling.address === "object" ? sampling.address : null;
  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <span className={`${classes.title} ${tsmDemiBold}`}>
          {`${t("lsTitle")} · ${t(sampling.kind === "home" ? "lsAtHome" : "lsAtLab")}`}
        </span>
        <Badge size="S" color={statusColor[status] || "Info"}>
          {t(status)}
        </Badge>
      </div>
      <span className={`${classes.when} ${tsmRegular}`}>
        {`${fmt.longDay(sampling.ymd)} · ${fmt.range(sampling.ymd, sampling.start, sampling.end)}`}
      </span>
      {!!labName && <span className={`${classes.muted} ${t2xsRegular}`}>{labName}</span>}
      {!!tests?.length && (
        <span className={`${classes.muted} ${t2xsRegular}`}>{tests.join(listSep)}</span>
      )}
      {!!address && (
        <span className={`${classes.muted} ${t2xsRegular}`}>
          {[address.displayName, addressCityLabel(address.city, listSep), address.address]
            .filter(Boolean)
            .join(" - ")}
        </span>
      )}
      {!!address?.receiverPhone && (
        <span className={`${classes.muted} ${t2xsRegular}`}>
          {`${t("lsPhone")}: ${localPhone(address.receiverPhone)}`}
        </span>
      )}
      {!!sampling.fee && sampling.fee > 0 && (
        <span className={`${classes.muted} ${t2xsRegular}`}>
          {`${t("lsHomeFee")}: ${currencize(sampling.fee)} ${t("toman")}`}
        </span>
      )}
      <SamplingMoves sampling={sampling} viewer={viewer} />
      {actions}
    </div>
  );
};

// "Moved by the lab · Previous time: Fri 9 Oct 07:00–07:30", newest first
export const SamplingMoves = ({
  sampling,
  viewer = "buyer",
}: {
  sampling: Pick<ILabSampling, "moves">;
  viewer?: "buyer" | "lab";
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string) => getContent(key as ContentKey);
  const fmt = useSamplingFormat();
  const moves = (Array.isArray(sampling?.moves) ? sampling.moves : []).filter((m) => !!m?.from?.ymd);
  if (!moves.length) return null;
  return (
    <ul className={classes.moves}>
      {[...moves].reverse().map((m, i) => (
        <li key={`${m.at}-${i}`} className={`${classes.muted} ${t2xsRegular}`}>
          {[
            t(moverKey(m.by, viewer)),
            `${t("lsPrevTime")}: ${fmt.day(m.from!.ymd)} ${fmt.range(m.from!.ymd, m.from!.start, m.from!.end)}`,
            m.to && m.to.kind !== m.from!.kind ? t(m.from!.kind === "home" ? "lsAtHome" : "lsAtLab") : "",
          ]
            .filter(Boolean)
            .join(" · ")}
        </li>
      ))}
    </ul>
  );
};

type SampledLine = {
  sampling?: ILabSampling | string | null;
  item?: { paraClinic?: { name?: string } | string; test?: { name?: string } | string } | string | null;
};

// The appointments of an order's test lines, each once (lines of one lab
// share it), with the lab and the tests it is for.
export const OrderSamplings = ({
  lines,
  viewer = "buyer",
  renderActions,
}: {
  lines?: SampledLine[];
  viewer?: "buyer" | "lab";
  renderActions?: (sampling: ILabSampling) => ReactNode;
}) => {
  const groups = new Map<string, { sampling: ILabSampling; labName?: string; tests: string[] }>();
  for (const line of Array.isArray(lines) ? lines : []) {
    const s = line?.sampling;
    if (!s || typeof s !== "object" || !s._id) continue;
    const item = line.item && typeof line.item === "object" ? line.item : null;
    const lab = item?.paraClinic && typeof item.paraClinic === "object" ? item.paraClinic.name : undefined;
    const test = item?.test && typeof item.test === "object" ? item.test.name : undefined;
    const group = groups.get(s._id) || { sampling: s, labName: lab, tests: [] };
    if (test) group.tests.push(test);
    groups.set(s._id, group);
  }
  if (!groups.size) return null;
  return (
    <div className={classes.list}>
      {Array.from(groups.values()).map((g) => (
        <SamplingInfo
          key={g.sampling._id}
          sampling={g.sampling}
          labName={g.labName}
          tests={g.tests}
          viewer={viewer}
          actions={renderActions?.(g.sampling)}
        />
      ))}
    </div>
  );
};

export default SamplingInfo;
