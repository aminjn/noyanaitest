import classes from "./LicensePriceDetails.module.css";
import { IBaseLicensePricing, ILicenseDuration } from "./licenseTypes";
import { currencize } from "@/Components/helpers/currencize";
import {
  t2xsRegular,
  tbaseRegular,
  txlBold,
  txsRegular,
} from "@/Components/UI/Typography";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useLicensePeriodLabel from "./useLicensePeriodLabel";
import { ILicenseQuote } from "./useLicenseQuotes";
import LicensePromotionCountdown from "./LicensePromotionCountdown";

const LOCALE_NS: ContentNamespace[] = ["common", "sharedLicense"];

// Shared price/duration readout used by LicenseCard, the plan page and the
// checkout - the chosen duration's name, a discount-percent badge (if
// any), the final price, the struck-through original price, and the
// "toman" unit label. With a `quote` (the server's price for this option,
// useLicenseQuotes) it shows exactly what purchaseLicense charges: the
// option's own discount plus a running promotion, with the promotion's
// badge and its countdown. Renders nothing when there's no pricing option
// for the currently selected duration (or "free" for a free plan).
const LicensePriceDetails = ({
  duration,
  pricing,
  quote,
  free,
  remainingDays,
}: {
  // days left on the running plan (the upgrade credit's label)
  remainingDays?: number;
  duration: ILicenseDuration | null;
  pricing: IBaseLicensePricing<unknown> | null;
  quote?: ILicenseQuote | null;
  // a plan with nothing to buy (the free default tier)
  free?: boolean;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const intlTag = useIntlLocale();
  const periodLabel = useLicensePeriodLabel();

  if (!pricing) {
    if (!free) return null;
    return (
      <div className={classes.details}>
        <div className={classes.duraBox}>
          <span className={`${classes.duraName} ${txsRegular}`}>
            {getContent("licenseFreeForever")}
          </span>
        </div>
        <div className={classes.priceBox}>
          <span className={`${classes.price} ${txlBold}`}>
            {getContent("licenseFree")}
          </span>
        </div>
      </div>
    );
  }

  // what is actually charged - the server's quote when there is one, else
  // the option itself (price - discount); the list price is struck through
  const price = quote ? quote.listPrice : Math.max(0, pricing.price || 0);
  // the plan's price (promotions in); an upgrade credit is shown apart
  const final = quote
    ? Math.min(price, Math.max(0, quote.quoted))
    : price - Math.min(Math.max(0, pricing.discount || 0), price);
  const off = price - final;
  const percent = quote ? quote.percentOff : price > 0 ? Math.round((off / price) * 100) : 0;
  const promotion = quote?.promotion || null;

  return (
    <div className={classes.details}>
      <div className={classes.duraBox}>
        <span className={`${classes.duraName} ${txsRegular}`}>
          {periodLabel(duration?.duration)}
        </span>
        {off > 0 && percent > 0 && (
          <span className={`${classes.percent} ${t2xsRegular}`}>
            {getContent("percentSymbol", [
              new Intl.NumberFormat(intlTag).format(percent),
            ])}
          </span>
        )}
      </div>
      <div className={classes.priceBox}>
        <span className={`${classes.price} ${txlBold}`}>
          {currencize(final)}
        </span>
        <span className={classes.toman}>{getContent("toman")}</span>
        {off > 0 && (
          <s className={`${classes.discount} ${tbaseRegular}`}>
            {currencize(price)}
          </s>
        )}
      </div>
      {!!quote && quote.upgradeCredit > 0 && (
        <dl className={classes.breakdown}>
          <div className={classes.row}>
            <dt>{getContent("licenseUpgradeNewPrice")}</dt>
            <dd>{`${currencize(quote.quoted)} ${getContent("toman")}`}</dd>
          </div>
          <div className={classes.row}>
            <dt>
              {getContent("licenseUpgradeCredit", [
                new Intl.NumberFormat(intlTag).format(remainingDays || 0),
              ])}
            </dt>
            <dd>{`−${currencize(quote.upgradeCredit)} ${getContent("toman")}`}</dd>
          </div>
          <div className={`${classes.row} ${classes.payable}`}>
            <dt>{getContent("licenseUpgradePayable")}</dt>
            <dd>{`${currencize(quote.final)} ${getContent("toman")}`}</dd>
          </div>
        </dl>
      )}
      {!!promotion && (
        <div className={classes.promo}>
          {!!promotion.title && (
            <span className={classes.promoTitle}>{promotion.title}</span>
          )}
          {promotion.firstPurchaseOnly && (
            <span className={classes.promoNote}>
              {getContent("licensePromoFirstPurchase")}
            </span>
          )}
          <LicensePromotionCountdown endsAt={promotion.endsAt} compact />
        </div>
      )}
    </div>
  );
};

export default LicensePriceDetails;
