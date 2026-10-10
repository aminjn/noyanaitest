"use client";

import { useState } from "react";
import Link from "../i18n/Link";
import useScopedLocale from "../Hooks/useScopedLocale";
import useNotification from "../Hooks/useNotification";
import { ContentKey } from "../Enums/contentKeys";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { useIntlLocale } from "../i18n/navigation";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { currencize } from "../helpers/currencize";
import Button from "../UI/Button";
import classes from "./CartOffersSection.module.css";
import { t2xsRegular, tsmDemiBold, tsmRegular } from "../UI/Typography";

// «تخفیف، باشگاه و بیمه» in the cart checkout (2026-10, backend
// Lib/cartOffers.ts + Lib/cartInsurance.ts): one collapsible section, like
// Halodoc's and Snapp Pharmacy's single "promo & insurance" row, so the
// phone checkout stays short. Inside: one box for a discount code or a club
// code, the clubs of the centres in the cart (balance, the points this
// order earns, rewards to take and codes to use), and the supplementary
// insurer. The figures come from GET /cart/summary; the same codes and
// insurer go with POST /cart/submit, where the server checks them again.

const NS: ContentNamespace[] = ["cartCheckoutPopup"];

export type CartCodeResult = {
  code: string;
  kind: "promo" | "club" | null;
  applied: boolean;
  name?: string;
  error?: string;
};

export type CartClub = {
  ownerKind: string;
  ownerId: string;
  name: string;
  member: { balance: number; tier: string; discount: number } | null;
  earn: number;
  rewards: { _id: string; name: string; points: number; kind: string; value: number; maxDiscount: number; affordable: boolean }[];
  codes: { code: string; name: string; expiresAt?: string }[];
};

export type CartInsurerOption = { _id: string; name: string; image?: string; saved: boolean; plan?: string | null };

export type CartInsurance = {
  options: CartInsurerOption[];
  picked: { insurance: string; name: string; plan: string | null } | null;
  insurerShare: number;
  reimburse: boolean;
  error?: string;
};

export type CartPromo = { title: string; code: string | null; amount: number; auto: boolean } | null;

const tierKeys: Record<string, ContentKey> = {
  platinum: "crmeTierPlatinum",
  gold: "crmeTierGold",
  silver: "crmeTierSilver",
  bronze: "crmeTierBronze",
  basic: "crmeTierBasic",
};

const asList = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const CartOffersSection = ({
  codes,
  onCodesChange,
  results,
  promo,
  clubs,
  insurance,
  insuranceId,
  onInsuranceChange,
  discount,
  loading,
  onRedeemed,
}: {
  // the codes the buyer entered (sent to the summary and the order)
  codes: string[];
  onCodesChange: (codes: string[]) => void;
  results?: CartCodeResult[];
  promo?: CartPromo;
  clubs?: CartClub[];
  insurance?: CartInsurance;
  // "" = no supplementary insurance
  insuranceId: string;
  onInsuranceChange: (id: string) => void;
  // what the codes and the insurer take off, for the closed header
  discount: number;
  loading?: boolean;
  onRedeemed?: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const intl = useIntlLocale();
  const num = (n: number) => new Intl.NumberFormat(intl).format(Math.round(Number(n) || 0));
  const toman = (n: number) => `${currencize(Math.round(Number(n) || 0))} ${getContent("toman")}`;
  const [open, setOpen] = useState(codes.length > 0 || !!insuranceId);
  const [input, setInput] = useState("");
  const [redeeming, setRedeeming] = useState("");

  const resultList = asList<CartCodeResult>(results);
  const clubList = asList<CartClub>(clubs).filter((c) => !!c?.ownerId);
  const options = asList<CartInsurerOption>(insurance?.options).filter((o) => !!o?._id);
  const applied = resultList.filter((r) => r.applied).length + (promo?.auto ? 1 : 0);

  const addCode = (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) return;
    if (!codes.includes(code)) onCodesChange([...codes, code].slice(0, 6));
    setInput("");
  };
  const removeCode = (code: string) => onCodesChange(codes.filter((c) => c !== code));

  // a reward taken with points (the club's own redeem): its code goes on
  // this order straight away
  const redeem = async (club: CartClub, rewardId: string) => {
    if (redeeming) return;
    setRedeeming(rewardId);
    try {
      const res = await fetcher({
        url: `${API}/user/crm/clubs/${club.ownerKind}/${club.ownerId}/redeem`,
        method: "POST",
        payload: { reward: rewardId },
      });
      const code = (res?.data as { code?: string } | undefined)?.code;
      if (code) {
        addCode(code);
        pushNotification(getContent("offersClubRedeemed"), "Success");
      }
      onRedeemed?.();
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setRedeeming("");
    }
  };

  const headerNote = [
    applied > 0 ? getContent("offersApplied", [num(applied)]) : "",
    discount > 0 ? `− ${toman(discount)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={classes.main}>
      <button
        type="button"
        className={classes.head}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`${classes.headTitle} ${tsmDemiBold}`}>{getContent("offersTitle")}</span>
        {!!headerNote && <span className={`${classes.headNote} ${t2xsRegular}`}>{headerNote}</span>}
        <span className={`${classes.chevron} ${open ? classes.chevronOpen : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className={classes.body}>
          {/* one box for a discount code and a club code */}
          <div className={classes.block}>
            <form
              className={classes.codeRow}
              onSubmit={(e) => {
                e.preventDefault();
                addCode(input);
              }}
            >
              <input
                className={`${classes.codeInput} ${tsmRegular}`}
                value={input}
                dir="ltr"
                // a code is Latin letters and digits (globals.css LatinDigits)
                lang="en"
                maxLength={40}
                autoComplete="off"
                aria-label={getContent("offersCodePlaceholder")}
                placeholder={getContent("offersCodePlaceholder")}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button
                type="submit"
                variant="Primary"
                mode="Outline"
                radius="Medium"
                size="S"
                isLoading={!!loading && !!input}
              >
                {getContent("offersApply")}
              </Button>
            </form>
            {!!promo?.auto && promo.amount > 0 && (
              <span className={`${classes.ok} ${t2xsRegular}`}>
                {getContent("offersAutoPromo", [promo.title || "", toman(promo.amount)])}
              </span>
            )}
            {codes.map((code) => {
              const r = resultList.find((x) => x.code === code);
              return (
                <div key={code} className={classes.chip}>
                  <span className={`${classes.chipCode} ${tsmRegular}`} dir="ltr" lang="en">
                    {code}
                  </span>
                  <span className={`${r?.applied ? classes.ok : r ? classes.bad : classes.muted} ${t2xsRegular}`} role={r && !r.applied ? "alert" : undefined}>
                    {!r
                      ? getContent("offersChecking")
                      : r.applied
                        ? getContent(r.kind === "club" ? "offersClubCodeApplied" : "offersCodeApplied", [r.name || code])
                        : r.error || ""}
                  </span>
                  <button
                    type="button"
                    className={classes.chipRemove}
                    aria-label={getContent("offersRemoveCode")}
                    title={getContent("offersRemoveCode")}
                    onClick={() => removeCode(code)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* the clubs of the centres in the cart */}
          {clubList.map((club) => (
            <div key={`${club.ownerKind}:${club.ownerId}`} className={classes.block}>
              <span className={`${classes.blockTitle} ${tsmRegular}`}>
                {getContent("offersClubTitle", [club.name || ""])}
              </span>
              <span className={`${classes.muted} ${t2xsRegular}`}>
                {club.member
                  ? [
                      getContent("offersClubBalance", [num(club.member.balance)]),
                      tierKeys[club.member.tier] ? getContent(tierKeys[club.member.tier]) : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")
                  : getContent("offersClubJoin")}
              </span>
              {club.earn > 0 && (
                <span className={`${classes.ok} ${t2xsRegular}`}>{getContent("offersClubEarn", [num(club.earn)])}</span>
              )}
              {(asList<CartClub["codes"][number]>(club.codes).some((c) => !codes.includes(c.code)) ||
                asList<CartClub["rewards"][number]>(club.rewards).length > 0) && (
                <div className={classes.actions}>
                  {asList<CartClub["codes"][number]>(club.codes)
                    .filter((c) => !!c?.code && !codes.includes(c.code))
                    .map((c) => (
                      <Button
                        key={c.code}
                        variant="Primary"
                        mode="Outline"
                        radius="Medium"
                        size="S"
                        onClick={() => addCode(c.code)}
                      >
                        {getContent("offersClubUseCode", [c.name || c.code])}
                      </Button>
                    ))}
                  {asList<CartClub["rewards"][number]>(club.rewards).map((r) => (
                    <Button
                      key={r._id}
                      variant="Primary"
                      mode="Outline"
                      radius="Medium"
                      size="S"
                      disabled={!r.affordable || !!redeeming}
                      isLoading={redeeming === r._id}
                      title={r.affordable ? undefined : getContent("offersClubNotEnough", [num(r.points)])}
                      onClick={() => redeem(club, r._id)}
                    >
                      {getContent("offersClubRedeem", [r.name, num(r.points)])}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* the supplementary insurer (basic insurance goes with the
              e-prescription, never here) */}
          {options.length > 0 && (
            <div className={classes.block}>
              <span className={`${classes.blockTitle} ${tsmRegular}`}>{getContent("offersInsuranceTitle")}</span>
              <span className={`${classes.muted} ${t2xsRegular}`}>{getContent("offersInsuranceHint")}</span>
              <div className={classes.options} role="radiogroup" aria-label={getContent("offersInsuranceTitle")}>
                {[{ _id: "", name: getContent("offersInsuranceNone"), saved: false } as CartInsurerOption, ...options].map((o) => (
                  <button
                    key={o._id || "none"}
                    type="button"
                    role="radio"
                    aria-checked={insuranceId === o._id}
                    className={`${classes.option} ${insuranceId === o._id ? classes.optionOn : ""} ${tsmRegular}`}
                    onClick={() => onInsuranceChange(o._id)}
                  >
                    {o.name}
                    {o.saved && <span className={`${classes.badge} ${t2xsRegular}`}>{getContent("offersInsuranceSaved")}</span>}
                  </button>
                ))}
              </div>
              {!!insurance?.error && (
                <span className={`${classes.bad} ${t2xsRegular}`} role="alert">
                  {insurance.error}
                </span>
              )}
              {!!insuranceId && !!insurance?.picked && (
                <>
                  {insurance.insurerShare > 0 && (
                    <span className={`${classes.ok} ${t2xsRegular}`}>
                      {getContent("offersInsuranceShare", [toman(insurance.insurerShare)])}
                    </span>
                  )}
                  {insurance.reimburse && (
                    <span className={`${classes.note} ${t2xsRegular}`}>{getContent("offersInsuranceReimburse")}</span>
                  )}
                  {insurance.insurerShare > 0 && (
                    <span className={`${classes.muted} ${t2xsRegular}`}>{getContent("offersInsuranceEstimate")}</span>
                  )}
                </>
              )}
              <Link href="/dashboard/insurance" className={`${classes.link} ${t2xsRegular}`}>
                {getContent("offersInsuranceManage")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartOffersSection;
