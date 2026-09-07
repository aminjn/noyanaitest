import classes from "./LicensePriceDetails.module.css";
import { IBaseLicensePricing, ILicenseDuration } from "./licenseTypes";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { currencize } from "@/Components/helpers/currencize";
import {
  t2xsRegular,
  tbaseRegular,
  txlBold,
  txsRegular,
} from "@/Components/UI/Typography";

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
  const getContent = useScopedLocale(["common"]);

  if (!pricing) return null;

  return (
    <div className={classes.details}>
      <div className={classes.duraBox}>
        <span className={`${classes.duraName} ${txsRegular}`}>
          {duration?.displayName}
        </span>
        {pricing.discount && (
          <span className={`${classes.percent} ${t2xsRegular}`}>
            {getContent("percentSymbol", [
              Math.ceil((pricing.discount / pricing.price) * 100).toString(),
            ])}
          </span>
        )}
      </div>
      <div className={classes.priceBox}>
        <div className={classes.prices}>
          <span className={`${classes.price} ${txlBold}`}>
            {currencize(pricing.price)}
          </span>
          {pricing.discount && (
            <s className={`${classes.discount} ${tbaseRegular}`}>
              {pricing.discount}
            </s>
          )}
        </div>
        <span className={classes.toman}>{getContent("toman")}</span>
      </div>
    </div>
  );
};

export default LicensePriceDetails;
