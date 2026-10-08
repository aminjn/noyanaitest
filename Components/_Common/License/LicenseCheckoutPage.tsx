"use client";

import classes from "./LicenseCheckoutPage.module.css";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import {
  IBaseLicenseDetail,
  LicenseOrg,
  licensePanelRootByOrg,
  adaptLicenseDetail,
} from "./licenseTypes";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Act from "@/Components/UI/Act";
import useProgress from "@/Components/Hooks/useProgress";
import { IWallet } from "@/Components/Booking/Finalize/FinalizeBookingPage";
import { currencize } from "@/Components/helpers/currencize";
import Button from "@/Components/UI/Button";
import Ixon from "@/Components/UI/Ixon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import LicensePriceDetails from "./LicensePriceDetails";
import CentreWalletFund from "../Finance/CentreWalletFund";
import WalletShortfallTopUp from "@/Components/Payment/WalletShortfallTopUp";
import {
  tbaseDemiBold,
  tlgDemiBold,
  tsmDemiBold,
  tsmRegular,
} from "@/Components/UI/Typography";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import Input from "@/Components/UI/Input";
import useLicenseQuotes from "./useLicenseQuotes";

const LOCALE_NS: ContentNamespace[] = ["common", "sharedLicense"];

// Only "wallet" is wired up on the backend today
// (<org>Controller.purchaseLicense), same as cart checkout - see
// Components/Cart/CartCheckoutPopup.tsx's own OrderPaymentMethod.
type LicensePaymentMethod = "wallet";
const checkoutMethods: LicensePaymentMethod[] = ["wallet"];

// Shared UI for the "/<panel>/license/[nodeId]/checkout" page across every
// org panel (doctor/pharmacy/clinic/paraClinic). The plan (`nodeId`) and
// duration (`?duration=` query param, set by LicensePlanDetailPage's
// confirmAndContinue button) come from the URL; the plan itself and the
// user's wallet balance are fetched for display. Confirming posts to
// <org>Controller.purchaseLicense with the chosen duration, which debits
// the wallet and (re)sets the org's ProfileLicense - startedAt/expiresAt/
// baseLicense included - then this page returns to the panel root on
// success.
const LicenseCheckoutPage = ({ name }: { name: LicenseOrg }) => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const durationId = useSearchParams().get("duration");

  const { data, error } = useSWR<IBaseLicenseDetail>(
    nodeId ? `${API}/${name}/license/${nodeId}` : null,
    (url: string) =>
      fetcher({ url }).then((res) => adaptLicenseDetail(res.data)),
  );

  const { data: wallet, mutate: refreshWallet } = useSWR<IWallet>(
    `${API}/user/wallet`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  // a clinic or hospital pays from its own wallet only (2026-10; backend
  // Lib/walletScope.ts debitSpending) - the owner fills it from the
  // personal wallet right here when it falls short
  const ownWallet = name === "clinic" || name === "hospital";
  const { data: centreWallet, mutate: refreshCentreWallet } = useSWR<{ balance: number }>(
    ownWallet ? `${API}/${name}/wallet` : null,
    (url: string) => fetcher({ url }).then((res) => ({ balance: Number(res?.data?.balance) || 0 })),
  );

  const getContent = useScopedLocale(LOCALE_NS);
  const push = useProgress();

  // Only one method exists today (see checkoutMethods above), so there's
  // no setter yet - matches CartCheckoutPopup's own `const [method] =
  // useState<OrderPaymentMethod>("wallet")`.
  const [method] = useState<LicensePaymentMethod>("wallet");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricing =
    (Array.isArray(data?.pricing) ? data.pricing : []).find(
      (p) => p?.duration?._id === durationId,
    ) || null;

  // a promotion code (2026-10): typed, then applied - the quote below is
  // re-read with it, and the purchase sends it (an invalid code is refused
  // by the server instead of charging the full price)
  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState("");
  const { data: pricingData, quoteOf, current } = useLicenseQuotes(name, code || undefined, true);
  const quote = quoteOf(data?._id, pricing?.duration?.duration);
  // a running plan: only a higher plan is sold (prorated upgrade)
  const blocked = !!current && (current.planId === data?._id || (!!quote && !quote.upgradable));
  const codeRejected = !!code && pricingData?.code === code.toUpperCase() && !quote?.promotion?.withCode;
  const price = quote
    ? quote.final
    : pricing
      ? Math.max(0, (pricing.price || 0) - (pricing.discount || 0))
      : 0;

  const submit = () => {
    if (isSubmitting || !durationId || blocked) return;
    setIsSubmitting(true);
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.header}>
            <h1 className={`${classes.name} ${tlgDemiBold}`}>
              {data.displayName}
            </h1>
            <LicensePriceDetails
              duration={pricing?.duration || null}
              pricing={pricing}
              quote={quote}
              remainingDays={current?.remainingDays}
            />
          </div>
          <div className={classes.section}>
            <span className={`${classes.sectionTitle} ${tsmDemiBold}`}>
              {getContent("licensePromoCode")}
            </span>
            <div className={classes.codeRow}>
              <Input
                title={getContent("licensePromoCode")}
                placeholder
                inputClass={classes.codeInput}
                autoComplete="off"
                onChange={(e) => setCodeInput(e.target.value)}
              />
              <Button
                variant="Secondary"
                mode="Fill"
                size="M"
                radius="Medium"
                onClick={() => setCode(codeInput.trim())}
              >
                {getContent("licensePromoApply")}
              </Button>
            </div>
            {codeRejected && (
              <span className={classes.codeError}>
                {getContent("licensePromoCodeInvalid")}
              </span>
            )}
            {!!code && !codeRejected && !!quote?.promotion?.withCode && (
              <span className={classes.codeOk}>
                {getContent("licensePromoCodeApplied")}
              </span>
            )}
          </div>
          <div className={classes.section}>
            <span className={`${classes.sectionTitle} ${tsmDemiBold}`}>
              {getContent("paymentMethod")}
            </span>
            <div className={classes.methods}>
              {checkoutMethods.map((m) => (
                <div
                  key={m}
                  className={`${classes.method} ${method === m ? classes.activeMethod : ""}`}
                >
                  <div className={classes.methodIcon}>
                    <Ixon width="1.5rem">
                      <WalletIcon />
                    </Ixon>
                  </div>
                  <span className={`${classes.methodName} ${tsmRegular}`}>
                    {getContent(m)}
                  </span>
                  <div className={classes.methodTail}>
                    {ownWallet && !!centreWallet && (
                      <span className={classes.balance}>
                        {getContent("centreWalletBalance", [currencize(centreWallet.balance)])}
                      </span>
                    )}
                    {!!wallet && (
                      <span className={classes.balance}>
                        {ownWallet
                          ? getContent("personalWalletBalance", [currencize(wallet.balance)])
                          : `${getContent("balance")}: ${currencize(wallet.balance)} ${getContent("toman")}`}
                      </span>
                    )}
                    <div className={classes.methodCheck}>
                      <Ixon width="1rem">
                        <CheckIcon />
                      </Ixon>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* wallet can't cover the plan -> offer a SEP top-up of the gap,
              returning here afterwards (2026-09) */}
          {ownWallet && (
            <span className={classes.balance}>{getContent("centreWalletRule")}</span>
          )}
          {ownWallet && !!centreWallet && centreWallet.balance < price && (
            <CentreWalletFund
              kind={name as "clinic" | "hospital"}
              suggested={price - centreWallet.balance}
              onDone={() => {
                refreshCentreWallet();
                refreshWallet();
              }}
            />
          )}
          {/* the personal wallet can't cover the plan (or the transfer
              into the centre) -> a SEP top-up of the gap, returning here */}
          {!!wallet &&
            (ownWallet
              ? !!centreWallet && centreWallet.balance < price && (
                  <WalletShortfallTopUp balance={wallet.balance} total={price - centreWallet.balance} />
                )
              : <WalletShortfallTopUp balance={wallet.balance} total={price} />)}
          <div className={classes.totalRow}>
            <span className={tsmRegular}>{getContent("totalPrice")}</span>
            <span className={`${classes.totalPrice} ${tbaseDemiBold}`}>
              {`${currencize(price)} ${getContent("toman")}`}
            </span>
          </div>
          {blocked && (
            <span className={classes.codeError}>
              {getContent("licenseUpgradeBlocked")}
            </span>
          )}
          <Button
            className={classes.submit}
            mode="Fill"
            size="M"
            radius="Medium"
            isLoading={isSubmitting}
            onClick={submit}
            variant={blocked ? "Disable" : "Primary"}
          >
            {current && !blocked
              ? getContent("licenseUpgrade")
              : getContent("buyLicense")}
          </Button>
          <Act
            path={
              isSubmitting && durationId
                ? `${API}/${name}/license/${nodeId}`
                : null
            }
            method="POST"
            payload={
              code && !codeRejected
                ? { duration: durationId, promoCode: code }
                : { duration: durationId }
            }
            onDone={(status) => {
              setIsSubmitting(false);
              if (!status) return;
              push(licensePanelRootByOrg[name]);
            }}
          />
        </div>
      )}
    </HandleLoading>
  );
};

export default LicenseCheckoutPage;
