"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR, { mutate as mutateGlobal } from "swr";
import classes from "./Pro.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Act from "@/Components/UI/Act";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import WalletShortfallTopUp from "@/Components/Payment/WalletShortfallTopUp";
import LicensePromotionBanner from "@/Components/_Common/License/LicensePromotionBanner";
import useLicensePeriodLabel from "@/Components/_Common/License/useLicensePeriodLabel";
import { IWallet } from "@/Components/Booking/Finalize/FinalizeBookingPage";
import ProBenefitList from "./ProBenefitList";
import ProPriceOptions from "./ProPriceOptions";
import ProBadge from "./ProBadge";
import { PRO_ME_URL, useMyPro } from "./useProData";

const k = (key: string) => key as ContentKey;

const stateKeys: Record<string, string> = {
  active: "proStateActive",
  scheduled: "proStateScheduled",
  expired: "proStateExpired",
  cancelled: "proStateCancelled",
};

// The member's «پرو» page (/dashboard/pro, 2026-10): status and end date,
// today's AI allowance, the benefits, buying / renewing from the wallet
// (a renewal starts when the running period ends), and the periods so far.
const ProDashboardPage = () => {
  const getContent = useScopedLocale();
  const intlTag = useIntlLocale();
  const periodLabel = useLicensePeriodLabel();
  const n = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const date = useMemo(() => new Intl.DateTimeFormat(intlTag, { dateStyle: "medium" }), [intlTag]);

  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState("");
  const { data, error, mutate } = useMyPro(code || undefined);
  const { data: wallet, mutate: mutateWallet } = useSWR<IWallet>(`${API}/user/wallet`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const options = useMemo(() => data?.options || [], [data]);
  const [selected, setSelected] = useState<number | null>(null);
  // ?days= from the public page's choice
  useEffect(() => {
    if (!options.length) return;
    if (selected && options.some((o) => o.days === selected)) return;
    let wanted = 0;
    try {
      wanted = Number(new URLSearchParams(window.location.search).get("days")) || 0;
    } catch {
      wanted = 0;
    }
    const match = options.find((o) => o.days === wanted);
    setSelected((match || options[options.length - 1]).days);
  }, [options, selected]);

  const [buying, setBuying] = useState(false);
  const quote = options.find((o) => o.days === selected) || null;
  const codeRejected = !!code && data?.code === code.toUpperCase() && !quote?.promotion?.withCode;
  const balance = Number(wallet?.balance) || 0;
  const price = quote?.final || 0;
  const short = !!wallet && price > balance;

  const ai = data?.ai;
  const aiPercent = ai && ai.limit ? Math.min(100, Math.round((ai.used / ai.limit) * 100)) : 0;
  const history = Array.isArray(data?.history) ? data!.history : [];

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.page}>
          <section className={classes.hero}>
            <h1 className={classes.heroTitle}>
              {data.plan?.displayName || getContent(k("proName"))}
              <ProBadge active={data.active} />
            </h1>
            <div className={classes.status}>
              <div className={classes.statusText}>
                <strong>
                  {data.active
                    ? getContent(k("proActiveUntil"), [safeFormatDate(date, data.until || data.current?.expiresAt)])
                    : getContent(k("proNotMember"))}
                </strong>
                <span>
                  {data.active && data.current?.daysLeft !== null && data.current?.daysLeft !== undefined
                    ? getContent(k("proDaysLeft"), [n.format(data.current.daysLeft)])
                    : getContent(k("proNotMemberHint"))}
                </span>
              </div>
            </div>
          </section>

          <div className={classes.grid2}>
            <div className={classes.page}>
              <section className={classes.card} aria-labelledby="pro-my-benefits">
                <h2 id="pro-my-benefits" className={classes.cardTitle}>
                  {data.active ? getContent(k("proYourBenefits")) : getContent(k("proBenefitsTitle"))}
                </h2>
                <ProBenefitList benefits={data.benefits} />
              </section>

              {!!ai && data.benefits.aiEnabled && (
                <section className={classes.card} aria-labelledby="pro-ai">
                  <h2 id="pro-ai" className={classes.cardTitle}>
                    {getContent(k("proAiToday"))}
                  </h2>
                  {ai.limit ? (
                    <>
                      <div className={classes.meter} aria-hidden>
                        <span className={classes.meterFill} style={{ width: `${aiPercent}%` }} />
                      </div>
                      <span className={classes.muted}>
                        {getContent(k("proAiUsed"), [n.format(ai.used), n.format(ai.limit)])}
                      </span>
                    </>
                  ) : (
                    <span className={classes.muted}>
                      {getContent(k("proAiUnlimitedToday"), [n.format(ai.used)])}
                    </span>
                  )}
                </section>
              )}

              {history.length > 0 && (
                <section className={classes.card} aria-labelledby="pro-history">
                  <h2 id="pro-history" className={classes.cardTitle}>
                    {getContent(k("proHistory"))}
                  </h2>
                  <ul className={classes.history}>
                    {history.map((s) => (
                      <li key={s._id} className={classes.historyRow}>
                        <span>{periodLabel(s.days)}</span>
                        <span>
                          {`${safeFormatDate(date, s.startedAt)} – ${safeFormatDate(date, s.expiresAt)}`}
                        </span>
                        <span>
                          {s.granted
                            ? getContent(k("proGranted"))
                            : `${currencize(s.paid)} ${getContent("toman")}`}
                        </span>
                        <span className={`${classes.state} ${classes[`state_${s.state}`] || ""}`}>
                          {getContent(k(stateKeys[s.state] || "proStateExpired"))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <section className={classes.card} aria-labelledby="pro-buy">
              <h2 id="pro-buy" className={classes.cardTitle}>
                {data.active ? getContent(k("proRenew")) : getContent(k("proJoin"))}
              </h2>
              {data.onSale && options.length ? (
                <>
                  {data.active && <p className={classes.muted}>{getContent(k("proRenewNote"))}</p>}
                  <LicensePromotionBanner promotions={data.promotions} />
                  <ProPriceOptions options={options} selected={selected} onSelect={setSelected} />
                  <div className={classes.codeRow}>
                    <Input
                      title={getContent("licensePromoCode")}
                      placeholder
                      autoComplete="off"
                      onChange={(e) => setCodeInput(e.target.value)}
                    />
                    <Button variant="Secondary" mode="Fill" size="M" radius="Medium" onClick={() => setCode(codeInput.trim())}>
                      {getContent("licensePromoApply")}
                    </Button>
                  </div>
                  {codeRejected && <span className={classes.err}>{getContent("licensePromoCodeInvalid")}</span>}
                  {!!code && !codeRejected && !!quote?.promotion?.withCode && (
                    <span className={classes.ok}>{getContent("licensePromoCodeApplied")}</span>
                  )}
                  {!!wallet && (
                    <div className={classes.totalRow}>
                      <span>{getContent("balance")}</span>
                      <span>{`${currencize(balance)} ${getContent("toman")}`}</span>
                    </div>
                  )}
                  <div className={classes.totalRow}>
                    <span>{getContent("totalPrice")}</span>
                    <strong>{`${currencize(price)} ${getContent("toman")}`}</strong>
                  </div>
                  {!!wallet && <WalletShortfallTopUp balance={balance} total={price} />}
                  <Button
                    mode="Fill"
                    size="M"
                    radius="Medium"
                    variant={short || !quote ? "Disable" : "Primary"}
                    isLoading={buying}
                    onClick={() => {
                      if (buying || !quote || short) return;
                      setBuying(true);
                    }}
                  >
                    {quote ? getContent(k("proPayFromWallet"), [currencize(price)]) : getContent(k("proJoin"))}
                  </Button>
                  <span className={classes.muted}>{getContent(k("proNoAutoRenew"))}</span>
                  <Act
                    path={buying && quote ? `${API}/pro/purchase` : null}
                    method="POST"
                    payload={code && !codeRejected ? { days: quote?.days, promoCode: code } : { days: quote?.days }}
                    successMessage={getContent(k("proPurchased"))}
                    onDone={(ok) => {
                      setBuying(false);
                      if (!ok) return;
                      mutate();
                      mutateWallet();
                      mutateGlobal(PRO_ME_URL);
                    }}
                  />
                </>
              ) : (
                <p className={classes.muted}>{getContent(k("proNotOnSale"))}</p>
              )}
            </section>
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

export default ProDashboardPage;
