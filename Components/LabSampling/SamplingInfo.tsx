"use client";

import classes from "./SamplingInfo.module.css";
import Badge, { BadgeColor } from "../UI/Badge";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { currencize } from "../helpers/currencize";
import { useListSeparator } from "../i18n/navigation";
import { addressCityLabel, localPhone } from "../Dashboard/Address/DashboardManageAddressesPage";
import { ILabSampling, samplingStatusKey } from "./samplingTypes";
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

// One sampling appointment (backend Models/LabSampling.ts): where (the lab,
// or the home address), when (Tehran time), and how far it got. Shared by
// the buyer's order page and the lab's incoming order page.
const SamplingInfo = ({
  sampling,
  labName,
  tests,
}: {
  sampling: ILabSampling;
  labName?: string;
  tests?: string[];
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
    </div>
  );
};

type SampledLine = {
  sampling?: ILabSampling | string | null;
  item?: { paraClinic?: { name?: string } | string; test?: { name?: string } | string } | string | null;
};

// The appointments of an order's test lines, each once (lines of one lab
// share it), with the lab and the tests it is for.
export const OrderSamplings = ({ lines }: { lines?: SampledLine[] }) => {
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
        <SamplingInfo key={g.sampling._id} sampling={g.sampling} labName={g.labName} tests={g.tests} />
      ))}
    </div>
  );
};

export default SamplingInfo;
