"use client";
import ProUpsellCard from "../Pro/ProUpsellCard";
import { useListSeparator } from "@/Components/i18n/navigation";

import { ReactNode, useEffect, useRef, useState } from "react";
import WalletShortfallTopUp from "../Payment/WalletShortfallTopUp";
import useSWR, { mutate as globalMutate } from "swr";
import classes from "./CartCheckoutPopup.module.css";
import PopupCard from "../UI/PopupCard";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import usePopup from "../Hooks/usePopup";
import useProgress from "../Hooks/useProgress";
import useNotification from "../Hooks/useNotification";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { currencize } from "../helpers/currencize";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import CheckIcon from "../Icons/CheckIcon";
import WalletIcon from "../Icons/WalletIcon";
import ShieldCheckIcon from "../Icons/ShieldCheckIcon";
import { usePaymentConfig } from "../Payment/paymentTypes";
import Act from "../UI/Act";
import { IWallet } from "../Booking/Finalize/FinalizeBookingPage";
import {
  addressCityLabel,
  IUserAddress,
  localPhone,
} from "../Dashboard/Address/DashboardManageAddressesPage";
import DashboardMutateAddressPopup from "../Dashboard/Address/DashboardMutateAddressPopup";
import CartPrescriptionSection, {
  emptyRxDraft,
  rxDraftToPayload,
  RxDraft,
} from "./CartPrescriptionSection";
// lab sampling appointments (2026-10): its own section and payload part
import CartSamplingSection, {
  samplingDraftsToPayload,
  samplingFeeOf,
  SamplingDrafts,
} from "./CartSamplingSection";
import { CartSamplingGroup } from "../LabSampling/samplingTypes";
import CartDeliveryProblems, {
  CartDeliveryProblem,
  useDeliveryProblemText,
} from "./CartDeliveryProblems";
import { ContentKey } from "../Enums/contentKeys";
// discount / club codes and the supplementary insurer (2026-10)
import CartOffersSection, {
  CartClub,
  CartCodeResult,
  CartInsurance,
  CartPromo,
} from "./CartOffersSection";
import {
  t2xsRegular,
  tbaseDemiBold,
  tsmDemiBold,
  tsmRegular,
} from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "cartCheckoutPopup", "onlinePayment"];

// Mirrors backend Models/Order.ts orderPaymentMethods (CartController.submitCart):
// wallet -> debited immediately; sep -> SEP (Saman) online gateway (2026-09),
// the order stays "pending" until the bank payment is verified.
type OrderPaymentMethod = "wallet" | "sep";

const methodIcons: Record<OrderPaymentMethod, ReactNode> = {
  wallet: <WalletIcon />,
  sep: <ShieldCheckIcon />,
};

// redirectUrl is only present for "sep": the SEP payment page to send the
// browser to (the backend brings it back to /payment/<id> afterwards).
type SubmitCartResponse = { data: { _id: string }; redirectUrl?: string };

// Server-computed cart total, tax included - fetched fresh here rather than
// trusting the `total` prop (which is only the client-side subtotal CartPage
// already had on hand) since tax rates live in admin-only *TaxSettings docs
// this buyer can't read directly (Controllers/cartController.ts
// getCartSummary, 2026-09). Item prices shown elsewhere in the cart never
// change - this popup is specifically the "checkout view" that adds tax on
// top, per the user's request.
type CartShipment = {
  pharmacy: string;
  pharmacyName?: string;
  method: "tapsi" | "tipax";
  fee: number;
  // the part of fee Noyan pays for a «پرو» member (2026-10)
  proDiscount?: number;
  payOnDelivery: boolean;
};
// shipping (2026-09): one shipment per pharmacy - Tapsi's flat fee when it
// is in the buyer's city, Tipax pay-on-delivery otherwise
type CartSummary = {
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  shipments?: CartShipment[];
  needsAddress?: boolean;
  // shipments the pharmacy's delivery area refuses for this address (2026-10)
  undeliverable?: CartDeliveryProblem[];
  // a prescription-only item is in the cart (2026-10): ask for it
  requiresPrescription?: boolean;
  // labs whose tests need a sampling time (backend Lib/labSampling.ts)
  samplings?: CartSamplingGroup[];
  // «پرو»: the member's delivery discount, or what Pro would save
  pro?: { member?: boolean; discount?: number; potential?: number; threshold?: number };
  // (2026-10, backend Lib/cartOffers.ts) the codes tried, the discounts
  // they gave, the clubs of the centres in the cart and the insurer's share
  codes?: CartCodeResult[];
  promo?: CartPromo;
  clubDiscount?: number;
  promoDiscount?: number;
  clubs?: CartClub[];
  insurance?: CartInsurance;
  total: number;
};

const CartCheckoutPopup = ({
  total,
  requiresAddress,
}: {
  total: number;
  requiresAddress: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const listSep = useListSeparator();

  const { closePopup, setPopup } = usePopup();

  const push = useProgress();

  const pushNotification = useNotification();

  const { data: addresses, mutate: mutateAddresses } = useSWR<IUserAddress[]>(
    `${API}/user/address`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { data: wallet } = useSWR<IWallet>(
    `${API}/user/wallet`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [address, setAddress] = useState<string | null>(null);
  // the codes entered and the supplementary insurer picked (2026-10): the
  // summary prices them, the order sends them again
  const [codes, setCodes] = useState<string[]>([]);
  const [insuranceId, setInsuranceId] = useState("");
  const insurancePicked = useRef(false);
  const summaryQuery = new URLSearchParams();
  if (address && requiresAddress) summaryQuery.set("address", address);
  if (codes.length) summaryQuery.set("codes", codes.join(","));
  if (insuranceId) summaryQuery.set("insurance", insuranceId);
  // the chosen address decides the courier, so the summary follows it
  const { data: summary, error: summaryError, isValidating: summaryLoading, mutate: mutateSummary } = useSWR<CartSummary>(
    `${API}/cart/summary${summaryQuery.toString() ? `?${summaryQuery.toString()}` : ""}`,
    // fetcher already returns the response body, so `.data` is the summary
    // itself - this used to read `.data.data` (always undefined), which
    // silently fell back to the pre-tax subtotal as the "total".
    (url: string) => fetcher({ url }).then((res) => res.data),
    // a new code or insurer keeps the last figures on screen until the new
    // ones arrive (no flicker of the totals)
    { keepPreviousData: true },
  );
  // the buyer's saved supplementary insurer starts picked (like the
  // booking's insurances), once; they can switch it off
  useEffect(() => {
    if (insurancePicked.current) return;
    const options = Array.isArray(summary?.insurance?.options) ? summary!.insurance!.options : [];
    if (!summary) return;
    insurancePicked.current = true;
    const saved = options.find((o) => o?.saved);
    if (saved?._id) setInsuranceId(saved._id);
  }, [summary]);
  const codeResults = Array.isArray(summary?.codes) ? summary!.codes! : [];
  // only the codes that apply go with the order (a refused one would fail it)
  const appliedCodes = codes.filter((c) => codeResults.some((r) => r?.code === c && r.applied));
  const insurerShare = Math.max(0, Number(summary?.insurance?.insurerShare) || 0);
  const offerDiscount =
    Math.max(0, Number(summary?.clubDiscount) || 0) + Math.max(0, Number(summary?.promoDiscount) || 0) + insurerShare;

  // "sep" is only offered while online payment is enabled + configured in
  // the admin AppConfig (GET /payment/config).
  const { data: paymentConfig } = usePaymentConfig();
  const checkoutMethods: OrderPaymentMethod[] = paymentConfig?.sepEnabled
    ? ["wallet", "sep"]
    : ["wallet"];

  // preselect the newest saved address (usually the only one) so the buyer
  // does not have to tap it every time
  // - the newest one with a city (an address without one can't get the
  // same-city courier nor a prescription item), else simply the newest
  useEffect(() => {
    if (!Array.isArray(addresses) || !addresses.length) return;
    if (!address || !addresses.some((a) => a._id === address)) {
      const withCity = [...addresses].reverse().find((a) => !!a?.city);
      setAddress((withCity || addresses[addresses.length - 1])._id);
    }
  }, [addresses, address]);
  const selectedAddress = Array.isArray(addresses)
    ? addresses.find((a) => a._id === address)
    : undefined;
  const [method, setMethod] = useState<OrderPaymentMethod>("wallet");
  // the buyer's own choice wins; until then a wallet that can't cover the
  // order starts on the online gateway (Digikala / Snapp: the method that
  // can actually pay is the one preselected)
  const methodPicked = useRef(false);
  const pickMethod = (m: OrderPaymentMethod) => {
    methodPicked.current = true;
    setMethod(m);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rxDraft, setRxDraft] = useState<RxDraft>(emptyRxDraft);
  // sampling: one appointment per lab; a home visit adds its fee
  const [samplingDrafts, setSamplingDrafts] = useState<SamplingDrafts>({});
  const samplingGroups = Array.isArray(summary?.samplings) ? summary!.samplings! : [];
  const samplingPayload = samplingDraftsToPayload(samplingGroups, samplingDrafts);
  const samplingFee = samplingFeeOf(samplingGroups, samplingDrafts);
  const needsRx = !!summary?.requiresPrescription;
  const rxPayload = needsRx ? rxDraftToPayload(rxDraft) : null;
  // the pharmacy's delivery area refuses a shipment (2026-10)
  const deliveryProblemText = useDeliveryProblemText();
  const deliveryBlocked = Array.isArray(summary?.undeliverable) && summary.undeliverable.length > 0;
  const grandTotal = (summary ? summary.total : total) + samplingFee;
  const walletShort = !!wallet && Number(wallet.balance || 0) < grandTotal;
  useEffect(() => {
    if (methodPicked.current || !summary || !wallet) return;
    setMethod(walletShort && paymentConfig?.sepEnabled ? "sep" : "wallet");
  }, [walletShort, summary, wallet, paymentConfig?.sepEnabled]);

  return (
    <PopupCard title={getContent("confirmAndPayOrder")}>
      <div className={classes.main}>
        {/* a delivery address only for goods that ship (a lab-only cart
            picks its home-sampling address in the sampling section) */}
        {requiresAddress && (
        <div className={classes.section}>
          <span className={`${classes.sectionTitle} ${tsmDemiBold}`}>
            {getContent("selectDeliveryAddress")}
          </span>
          {!!addresses && (
            <div className={classes.addressList}>
              {addresses.map((node) => (
                <div
                  key={node._id}
                  className={`${classes.address} ${address === node._id ? classes.activeAddress : ""}`}
                  onClick={() => setAddress(node._id)}
                >
                  <div className={classes.addressCheck}>
                    <Ixon width=".75rem">
                      <CheckIcon />
                    </Ixon>
                  </div>
                  <div className={classes.addressDetails}>
                    <span className={`${classes.addressName} ${tsmRegular}`}>
                      {node.displayName}
                    </span>
                    <span className={`${classes.addressValue} ${t2xsRegular}`}>
                      {[addressCityLabel(node.city, listSep), node.address]
                        .filter(Boolean)
                        .join(" - ")}
                    </span>
                    {!!node.receiverPhone && (
                      <span className={`${classes.addressValue} ${t2xsRegular}`}>
                        {`${getContent("receiverPhone")}: ${localPhone(node.receiverPhone)}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {addresses.length === 0 && (
                <span className={`${classes.empty} ${t2xsRegular}`}>
                  {getContent("noAddressesRegisteredYet")}
                </span>
              )}
            </div>
          )}
          <Button
            variant="Primary"
            mode="Outline"
            radius="Medium"
            size="S"
            onClick={() =>
              setPopup(
                "CartAddAddress",
                <DashboardMutateAddressPopup
                  mutate={() => mutateAddresses()}
                />,
              )
            }
          >
            {getContent("addNewAddress")}
          </Button>
        </div>
        )}
        {/* delivery area (2026-10): what can't go to this address */}
        <div id="checkout-delivery">
          <CartDeliveryProblems problems={summary?.undeliverable} />
        </div>
        {needsRx && (
          <div id="checkout-rx">
            <CartPrescriptionSection value={rxDraft} onChange={setRxDraft} />
          </div>
        )}
        {!!samplingGroups.length && (
          <div id="checkout-sampling">
            <CartSamplingSection
              groups={samplingGroups}
              addresses={addresses}
              value={samplingDrafts}
              onChange={setSamplingDrafts}
            />
          </div>
        )}
        {/* discounts, club and insurance (2026-10): one collapsible part */}
        {!!summary && (
          <div id="checkout-offers">
            <CartOffersSection
              codes={codes}
              onCodesChange={setCodes}
              results={codeResults}
              promo={summary.promo}
              clubs={summary.clubs}
              insurance={summary.insurance}
              insuranceId={insuranceId}
              onInsuranceChange={setInsuranceId}
              discount={offerDiscount}
              loading={summaryLoading}
              onRedeemed={() => mutateSummary()}
            />
          </div>
        )}
        {!!summary?.shipments?.length && (
          <div className={classes.section}>
            <span className={`${classes.sectionTitle} ${tsmDemiBold}`}>
              {getContent("shippingMethod")}
            </span>
            {summary.needsAddress ? (
              <span className={`${classes.empty} ${t2xsRegular}`}>
                {getContent("shippingNeedsAddress")}
              </span>
            ) : (
              <div className={classes.shipments}>
                {summary.shipments.map((el) => (
                  <div key={el.pharmacy} className={classes.shipment}>
                    <div className={classes.shipmentHead}>
                      <span className={tsmRegular}>
                        {getContent(
                          el.method === "tapsi" ? "shippingTapsi" : "shippingTipax",
                        )}
                      </span>
                      <span className={tsmRegular}>
                        {el.payOnDelivery
                          ? ""
                          : el.fee > 0 && (el.proDiscount || 0) >= el.fee
                            ? getContent("proDeliveryFree")
                            : el.fee > 0
                              ? `${currencize(el.fee - Math.max(0, el.proDiscount || 0))} ${getContent("toman")}`
                              : getContent("shippingFree")}
                      </span>
                    </div>
                    {!!el.pharmacyName && (
                      <span className={`${classes.addressValue} ${t2xsRegular}`}>
                        {el.pharmacyName}
                      </span>
                    )}
                    {el.payOnDelivery && (
                      <span className={`${classes.addressValue} ${t2xsRegular}`}>
                        {getContent("shippingTipaxNote")}
                      </span>
                    )}
                  </div>
                ))}
                {!!selectedAddress && !selectedAddress.city && (
                  <span className={`${classes.warn} ${t2xsRegular}`}>
                    {getContent("addressCityMissing")}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        <div className={classes.section}>
          <span className={`${classes.sectionTitle} ${tsmDemiBold}`}>
            {getContent("paymentMethod")}
          </span>
          <div className={classes.methods}>
            {checkoutMethods.map((m) => (
              <div
                key={m}
                className={`${classes.method} ${method === m ? classes.activeMethod : ""}`}
                onClick={() => pickMethod(m)}
              >
                <div className={classes.methodIcon}>
                  <Ixon width="1.5rem">{methodIcons[m]}</Ixon>
                </div>
                <span className={`${classes.methodName} ${tsmRegular}`}>
                  {getContent(m)}
                </span>
                <div className={classes.methodTail}>
                  {m === "wallet" && !!wallet && (
                    <span className={`${classes.balance} ${t2xsRegular}`}>
                      {`${getContent("balance")}: ${currencize(wallet.balance)} ${getContent("toman")}`}
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
          {method === "wallet" && walletShort && (
            <>
              <span className={`${classes.warn} ${t2xsRegular}`}>
                {getContent(checkoutMethods.includes("sep") ? "cartWalletNotEnoughOnline" : "cartWalletNotEnough")}
              </span>
              <WalletShortfallTopUp balance={Number(wallet?.balance || 0)} total={grandTotal} />
            </>
          )}
        </div>
        <div className={classes.totalRow}>
          <span className={tsmRegular}>{getContent("subtotal")}</span>
          <span className={tsmRegular}>
            {`${currencize(summary ? summary.subtotal : total)} ${getContent("toman")}`}
          </span>
        </div>
        {/* a zero tax is not "free of charge"; the row only shows when
            the seller actually charges tax */}
        {!!summary && summary.tax > 0 && (
          <div className={classes.totalRow}>
            <span className={tsmRegular}>{getContent("tax")}</span>
            <span className={tsmRegular}>
              {`${currencize(summary.tax)} ${getContent("toman")}`}
            </span>
          </div>
        )}
        {!!summary?.deliveryFee && (
          <div className={classes.totalRow}>
            <span className={tsmRegular}>{getContent("deliveryFee")}</span>
            <span className={tsmRegular}>
              {`${currencize(summary.deliveryFee)} ${getContent("toman")}`}
            </span>
          </div>
        )}
        {/* «پرو» (2026-10): what Noyan paid of the courier fee, or the offer */}
        {!!summary?.pro?.member && !!summary.pro.discount && (
          <div className={`${classes.totalRow} ${classes.proSaving}`}>
            <span className={tsmRegular}>{getContent("proDeliverySaving")}</span>
            <span className={tsmRegular}>
              {`${currencize(summary.pro.discount)} ${getContent("toman")}`}
            </span>
          </div>
        )}
        {!!summary?.pro && !summary.pro.member && !!summary.pro.potential && (
          <ProUpsellCard moment="delivery" amount={summary.pro.potential} />
        )}
        {samplingFee > 0 && (
          <div className={classes.totalRow}>
            <span className={tsmRegular}>{getContent("lsHomeFee")}</span>
            <span className={tsmRegular}>
              {`${currencize(samplingFee)} ${getContent("toman")}`}
            </span>
          </div>
        )}
        {/* (2026-10) the discount lines: the sellers' club codes, the
            discount code, and the supplementary insurer's share */}
        {Number(summary?.clubDiscount) > 0 && (
          <div className={`${classes.totalRow} ${classes.proSaving}`}>
            <span className={tsmRegular}>{getContent("clubDiscountRow")}</span>
            <span className={tsmRegular}>
              {`− ${currencize(Number(summary!.clubDiscount))} ${getContent("toman")}`}
            </span>
          </div>
        )}
        {Number(summary?.promoDiscount) > 0 && (
          <div className={`${classes.totalRow} ${classes.proSaving}`}>
            <span className={tsmRegular}>{getContent("promoDiscountRow")}</span>
            <span className={tsmRegular}>
              {`− ${currencize(Number(summary!.promoDiscount))} ${getContent("toman")}`}
            </span>
          </div>
        )}
        {insurerShare > 0 && (
          <div className={`${classes.totalRow} ${classes.proSaving}`}>
            <span className={tsmRegular}>{getContent("insurerShareRow")}</span>
            <span className={tsmRegular}>
              {`− ${currencize(insurerShare)} ${getContent("toman")}`}
            </span>
          </div>
        )}
        {/* the total and the button stay in view while the buyer scrolls
            the sections above (a phone checkout is long) */}
        <div className={classes.stickyTotal}>
        <div className={classes.totalRow}>
          <span className={tsmRegular}>{getContent("totalPrice")}</span>
          <span className={`${classes.totalPrice} ${tbaseDemiBold}`}>
            {`${currencize(grandTotal)} ${getContent("toman")}`}
          </span>
        </div>
        {/* the server refused the cart (an item became unavailable): say so
            here, next to the button, not only after a tap */}
        {!!summaryError && (
          <span className={`${classes.warn} ${t2xsRegular}`} role="alert">
            {(summaryError as Error)?.message}
          </span>
        )}
        <Button
          variant="Primary"
          mode="Fill"
          size="M"
          radius="Medium"
          isLoading={isSubmitting}
          onClick={() => {
            if (isSubmitting) return;
            // the toast says what is missing; the section itself is
            // brought into view (on a phone it is usually scrolled away)
            const reveal = (id: string) =>
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
            if (requiresAddress && !address) {
              pushNotification(getContent("selectAddressFirst"), "Warn");
              reveal("checkout-address");
              return;
            }
            if (deliveryBlocked) {
              pushNotification(deliveryProblemText(summary!.undeliverable![0]), "Warn");
              reveal("checkout-delivery");
              return;
            }
            if (needsRx && !rxPayload) {
              pushNotification(getContent("rxMissing"), "Warn");
              reveal("checkout-rx");
              return;
            }
            if (samplingGroups.length && !samplingPayload) {
              pushNotification(getContent("lsChooseTime"), "Warn");
              reveal("checkout-sampling");
              return;
            }
            if (method === "wallet" && walletShort) {
              pushNotification(
                getContent(checkoutMethods.includes("sep") ? "cartWalletNotEnoughOnline" : "cartWalletNotEnough"),
                "Warn",
              );
              return;
            }
            setIsSubmitting(true);
          }}
        >
          {getContent("confirmAndPayOrder")}
        </Button>
        </div>
      </div>
      <Act<SubmitCartResponse>
        path={isSubmitting ? `${API}/cart/submit` : null}
        method="POST"
        payload={{
          method,
          address: (requiresAddress && address) || undefined,
          ...(rxPayload ? { prescription: rxPayload } : {}),
          ...(samplingPayload?.length ? { samplings: samplingPayload } : {}),
          ...(appliedCodes.length ? { codes: appliedCodes } : {}),
          ...(insuranceId ? { insurance: { insurance: insuranceId } } : {}),
        }}
        successMessage={
          method === "wallet" ? getContent("orderSubmittedMessage") : undefined
        }
        onDone={(status, result) => {
          if (status && result?.redirectUrl) {
            // keep the loading state on while the browser leaves for the bank
            pushNotification(getContent("redirectingToGateway"));
            window.location.assign(result.redirectUrl);
            return;
          }
          setIsSubmitting(false);
          if (!status) {
            // a sampling slot may have just filled up: show the seats again
            globalMutate(
              (key) => typeof key === "string" && key.startsWith(`${API}/cart/sampling/`),
            );
            // an item may have just gone out of stock: the cart page marks it
            globalMutate(`${API}/cart`);
            globalMutate(
              (key) => typeof key === "string" && key.startsWith(`${API}/cart/summary`),
            );
            return;
          }
          // the server emptied the cart and debited the wallet: drop the
          // stale copies (cart page, header badge, balance)
          globalMutate(`${API}/cart`);
          globalMutate(`${API}/cart/size`);
          globalMutate(
            (key) =>
              typeof key === "string" && key.startsWith(`${API}/cart/summary`),
          );
          globalMutate(`${API}/user/wallet`);
          closePopup();
          if (result?.data?._id) push(`/order/${result.data._id}`);
        }}
      />
    </PopupCard>
  );
};

export default CartCheckoutPopup;
