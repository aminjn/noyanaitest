"use client";

import useSWR from "swr";
import { useListSeparator } from "@/Components/i18n/navigation";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useUser from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import Ixon from "../UI/Ixon";
import TruckIcon from "../Icons/TruckIcon";
import { IUserAddress } from "../Dashboard/Address/DashboardManageAddressesPage";
import classes from "./DeliveryAreaNote.module.css";

const NS: ContentNamespace[] = ["pharmacyPage", "products", "productPackagePage"];

type Named = { _id: string; name?: string };

// Where a pharmacy ships (backend Lib/delivery.ts deliveryAreasOf, 2026-10)
export type DeliveryArea = {
  scope?: "city" | "selected" | "nationwide" | string;
  city?: Named;
  cities?: Named[];
  provinces?: Named[];
};

const idOf = (value: unknown): string | undefined => {
  if (typeof value === "string") return value || undefined;
  if (value && typeof value === "object" && "_id" in value) {
    const id = (value as { _id?: unknown })._id;
    return typeof id === "string" && id ? id : undefined;
  }
  return undefined;
};

const list = (value: unknown): Named[] =>
  (Array.isArray(value) ? value : []).filter(
    (el): el is Named => !!el && typeof el === "object" && typeof el._id === "string",
  );

// same rule as the checkout (Lib/delivery.ts deliveryAreaReason): Rx only in
// the pharmacy's own city; otherwise its own city, the chosen cities /
// provinces, or anywhere
export const shipsTo = (
  area: DeliveryArea,
  city: string | undefined,
  province: string | undefined,
  rx: boolean,
): boolean | undefined => {
  const scope = area.scope || "nationwide";
  if (!rx && scope === "nationwide") return true;
  const own = area.city?._id;
  if (!city || !own) return undefined;
  if (city === own) return true;
  if (rx || scope === "city") return false;
  return (
    list(area.cities).some((el) => el._id === city) ||
    (!!province && list(area.provinces).some((el) => el._id === province))
  );
};

const MAX_NAMES = 4;

// The "ships to your city" hint on the public pharmacy / product / package
// pages, like Digikala's and Snapp Market's: where it ships, and whether that
// includes the city of the buyer's newest saved address (the one checkout
// preselects). Only a hint: the cart checks it on the server.
const DeliveryAreaNote = ({
  area,
  rx = false,
  rxNote = false,
  className = "",
}: {
  area?: DeliveryArea | null;
  // the item itself is prescription-only
  rx?: boolean;
  // add "prescription drugs only in <city>" (the pharmacy page)
  rxNote?: boolean;
  className?: string;
}) => {
  const getContent = useScopedLocale(NS);
  const listSep = useListSeparator();
  const { user } = useUser();
  const { data: addresses } = useSWR<IUserAddress[]>(
    user && area ? `${API}/user/address` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  if (!area || typeof area !== "object") return null;
  const scope = area.scope || "nationwide";
  const cityName = area.city?.name;

  let line = "";
  if (rx || scope === "city") line = cityName ? getContent("deliveryOnlyInCity", [cityName]) : "";
  else if (scope === "selected") {
    const names = [area.city, ...list(area.cities), ...list(area.provinces)]
      .map((el) => el?.name)
      .filter((el): el is string => !!el);
    const shown = names.slice(0, MAX_NAMES).join(listSep);
    line = names.length
      ? getContent("deliveryToAreas", [names.length > MAX_NAMES ? `${shown}${listSep}…` : shown])
      : "";
  } else line = getContent("deliveryNationwide");
  const rxLine =
    rxNote && !rx && scope !== "city" && cityName ? getContent("deliveryRxOnlyInCity", [cityName]) : "";

  const newest = Array.isArray(addresses) && addresses.length ? addresses[addresses.length - 1] : undefined;
  const buyerCity =
    newest?.city && typeof newest.city === "object" ? newest.city : undefined;
  const buyerProvince =
    idOf((newest as { province?: unknown } | undefined)?.province) || idOf(buyerCity?.province);
  const verdict = buyerCity ? shipsTo(area, buyerCity._id, buyerProvince, rx) : undefined;

  if (!line && !rxLine && verdict === undefined) return null;
  return (
    <div className={`${classes.main} ${className}`}>
      {!!line && (
        <span className={classes.line}>
          <Ixon width=".875rem" className={classes.icon}>
            <TruckIcon />
          </Ixon>
          {line}
        </span>
      )}
      {!!rxLine && <span className={classes.muted}>{rxLine}</span>}
      {verdict !== undefined && !!buyerCity?.name && (
        <span className={verdict ? classes.ok : classes.no}>
          {getContent(verdict ? "deliveryToYourCity" : "deliveryNotToYourCity", [buyerCity.name])}
        </span>
      )}
    </div>
  );
};

export default DeliveryAreaNote;
