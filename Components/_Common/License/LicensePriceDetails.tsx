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
import { useIntlLocale } from "@/Components/i18n/navigation";
import useLicensePeriodLabel from "./useLicensePeriodLabel";

const LOCALE_NS: ContentNamespace[] = ["common", "sharedLicense"];

// Shared price/duration readout used by LicenseCard - the chosen
// duration's name, a discount-percent badge (if any), the final price,
// the struck-through original price, and the "toman" unit label. Renders
// nothing when there's no pricing option for the currently selected
// duration.
const LicensePriceDetails = ({
  duration,
  pricing,
}: {
  duration: ILicenseDuration | null;
  pricing: IBaseLicensePricing<unknown> | null;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const intlTag = useIntlLocale();
  const periodLabel = useLicensePeriodLabel();

  if (!pricing) return null;

  // what is actually charged - mirrors LicenseCheckoutPage and the backend
  // (price - discount); the list price is shown struck through
  const price = Math.max(0, pricing.price || 0);
  const off = Math.min(Math.max(0, pricing.discount || 0), price);
  const final = price - off;
  const percent = price > 0 ? Math.round((off / price) * 100) : 0;

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
    </div>
  );
};

export default LicensePriceDetails;
