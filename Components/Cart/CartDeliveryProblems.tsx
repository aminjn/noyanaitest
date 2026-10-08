"use client";

import Link from "@/Components/i18n/Link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { t2xsRegular, tsmRegular } from "../UI/Typography";
import classes from "./CartDeliveryProblems.module.css";

const NS: ContentNamespace[] = ["common", "cartCheckoutPopup"];

// backend Controllers/cartController.ts DeliveryProblem (2026-10): a
// shipment the pharmacy's delivery area refuses for the chosen address
export type CartDeliveryProblem = {
  pharmacy: string;
  pharmacyName?: string;
  reason: "rxOwnCity" | "outsideArea" | "unknownCity" | string;
  originCityName?: string;
  destinationCityName?: string;
  alternatives?: { _id: string; name?: string; slug?: string; items: number; of: number }[];
};

export const useDeliveryProblemText = () => {
  const getContent = useScopedLocale(NS);
  return (el: CartDeliveryProblem) =>
    el.reason === "unknownCity"
      ? getContent("addressCityMissing")
      : el.reason === "rxOwnCity"
        ? getContent("deliveryBlockedRx", [el.pharmacyName || "", el.originCityName || ""])
        : getContent("deliveryBlockedArea", [el.pharmacyName || "", el.destinationCityName || ""]);
};

// What can't be shipped to the chosen address, why, and pharmacies in the
// buyer's city that sell the same items (Digikala / Halodoc offer another
// seller instead of a dead end). Checkout is refused on the server too.
const CartDeliveryProblems = ({ problems }: { problems?: CartDeliveryProblem[] }) => {
  const getContent = useScopedLocale(NS);
  const textOf = useDeliveryProblemText();
  const list = (Array.isArray(problems) ? problems : []).filter((el) => !!el && typeof el === "object");
  if (!list.length) return null;
  return (
    <div className={classes.main} role="alert">
      {list.map((el) => {
        const alternatives = Array.isArray(el.alternatives) ? el.alternatives : [];
        return (
          <div key={el.pharmacy} className={classes.item}>
            <span className={`${classes.title} ${tsmRegular}`}>{textOf(el)}</span>
            {el.reason !== "unknownCity" && (
              <span className={t2xsRegular}>{getContent("deliveryBlockedHint")}</span>
            )}
            {!!alternatives.length && (
              <div className={classes.alternatives}>
                <span className={t2xsRegular}>{getContent("deliveryAlternatives")}</span>
                <ul className={classes.list}>
                  {alternatives.map((alt) => (
                    <li key={alt._id}>
                      <Link className={classes.link} href={`/pharmacy/${alt.slug || alt._id}`}>
                        {alt.name || alt._id}
                      </Link>
                      <span className={`${classes.count} ${t2xsRegular}`}>
                        {getContent("deliveryAlternativeItems", [String(alt.items), String(alt.of)])}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CartDeliveryProblems;
