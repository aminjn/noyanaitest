"use client";

import classes from "./CartSamplingSection.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { currencize } from "../helpers/currencize";
import { useListSeparator } from "../i18n/navigation";
import {
  addressCityLabel,
  IUserAddress,
} from "../Dashboard/Address/DashboardManageAddressesPage";
import SamplingSlotPicker from "../LabSampling/SamplingSlotPicker";
import {
  CartSamplingGroup,
  LabSamplingKind,
  SamplingChoice,
} from "../LabSampling/samplingTypes";
import { t2xsRegular, tsmDemiBold, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "labSampling"];

// Lab sampling at checkout (2026-10, backend Lib/labSampling.ts; Halodoc /
// SnappDoctor lab flow): for every lab whose tests need a sample, the buyer
// picks an in-lab slot, or - when all its tests allow it - a home visit
// window at one of their addresses inside the lab's area, for its fee. Kept
// apart from the shipping part of the checkout on purpose.

export type SamplingDraft = {
  kind: LabSamplingKind;
  slot: { ymd: string; start: number } | null;
  address?: string;
};
export type SamplingDrafts = Record<string, SamplingDraft>;

const draftOf = (drafts: SamplingDrafts, lab: string): SamplingDraft =>
  drafts[lab] || { kind: "lab", slot: null };

const cityIdOf = (address: IUserAddress) =>
  !address.city ? "" : typeof address.city === "string" ? address.city : address.city._id;

// the /cart/submit payload, or null while a lab still has no time chosen
export const samplingDraftsToPayload = (
  groups: CartSamplingGroup[] | undefined,
  drafts: SamplingDrafts,
): SamplingChoice[] | null => {
  const out: SamplingChoice[] = [];
  for (const g of Array.isArray(groups) ? groups : []) {
    const d = draftOf(drafts, g.paraClinic);
    if (!d.slot) return null;
    if (d.kind === "home" && (!g.home || !d.address)) return null;
    out.push({
      paraClinic: g.paraClinic,
      kind: d.kind,
      ymd: d.slot.ymd,
      start: d.slot.start,
      ...(d.kind === "home" ? { address: d.address } : {}),
    });
  }
  return out;
};

// the home-sampling fees the chosen visits add to the total
export const samplingFeeOf = (groups: CartSamplingGroup[] | undefined, drafts: SamplingDrafts) =>
  (Array.isArray(groups) ? groups : []).reduce(
    (sum, g) => sum + (g.home && draftOf(drafts, g.paraClinic).kind === "home" ? Math.max(0, g.homeFee || 0) : 0),
    0,
  );

const CartSamplingSection = ({
  groups,
  addresses,
  value,
  onChange,
}: {
  groups: CartSamplingGroup[];
  addresses?: IUserAddress[];
  value: SamplingDrafts;
  onChange: (next: SamplingDrafts) => void;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string) => getContent(key as ContentKey);
  const listSep = useListSeparator();
  const list = Array.isArray(addresses) ? addresses : [];

  const set = (lab: string, patch: Partial<SamplingDraft>) =>
    onChange({ ...value, [lab]: { ...draftOf(value, lab), ...patch } });

  return (
    <div className={classes.main}>
      <span className={`${classes.title} ${tsmDemiBold}`}>{t("lsTitle")}</span>
      <span className={`${classes.hint} ${t2xsRegular}`}>{t("lsCartHint")}</span>
      {groups.map((g) => {
        const d = draftOf(value, g.paraClinic);
        const kinds: LabSamplingKind[] = g.home ? ["lab", "home"] : ["lab"];
        const served = list.filter((a) => g.homeCities.includes(cityIdOf(a)));
        return (
          <div key={g.paraClinic} className={classes.group}>
            <span className={`${classes.lab} ${tsmRegular}`}>{g.name}</span>
            {!!g.tests.length && (
              <span className={`${classes.muted} ${t2xsRegular}`}>{g.tests.join(listSep)}</span>
            )}
            {kinds.length > 1 && (
              <div className={classes.kinds}>
                {kinds.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`${classes.kind} ${d.kind === k ? classes.activeKind : ""}`}
                    // the slots differ per kind: the time is chosen again
                    onClick={() =>
                      d.kind !== k &&
                      set(g.paraClinic, {
                        kind: k,
                        slot: null,
                        address: k === "home" ? d.address || served[served.length - 1]?._id : undefined,
                      })
                    }
                  >
                    <span className={tsmRegular}>{t(k === "home" ? "lsAtHome" : "lsAtLab")}</span>
                    {k === "home" && (
                      <span className={`${classes.muted} ${t2xsRegular}`}>
                        {g.homeFee > 0 ? `${currencize(g.homeFee)} ${t("toman")}` : t("lsFree")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {d.kind === "home" && (
              <div className={classes.addresses}>
                <span className={`${classes.muted} ${t2xsRegular}`}>{t("lsHomeAddress")}</span>
                {!served.length && (
                  <span className={`${classes.muted} ${t2xsRegular}`}>{t("lsNoHomeAddress")}</span>
                )}
                {list.map((a) => {
                  const inArea = g.homeCities.includes(cityIdOf(a));
                  return (
                    <button
                      key={a._id}
                      type="button"
                      disabled={!inArea}
                      className={`${classes.address} ${d.address === a._id ? classes.activeAddress : ""}`}
                      onClick={() => set(g.paraClinic, { address: a._id })}
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
            <SamplingSlotPicker
              key={`${g.paraClinic}-${d.kind}`}
              paraClinic={g.paraClinic}
              kind={d.kind}
              value={d.slot}
              onChange={(slot) => set(g.paraClinic, { slot })}
            />
          </div>
        );
      })}
    </div>
  );
};

export default CartSamplingSection;
