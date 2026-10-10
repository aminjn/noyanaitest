"use client";

import { ElementType, ReactNode } from "react";
import Link from "@/Components/i18n/Link";
import classes from "./CentreCard.module.css";
import HostedImage from "./HostedImage";
import Ixon from "./Ixon";
import Badge from "./Badge";
import Button from "./Button";
import { WithStyleProps } from "../Layout/Layout";
import { t2xsRegular, tbaseMedium, tsmDemiBold, tsmMedium, txsMedium, txsRegular } from "./Typography";
import StarIcon from "../Icons/StarIcon";
import LocationIcon from "../Icons/LocationIcon";
import ChevronIcon from "../Icons/ChevronIcon";
import ClockIcon from "../Icons/ClockIcon";
import MinusIcon from "../Icons/MinusIcon";
import PlusIcon from "../Icons/PlusIcon";
import ShieldIcon from "../Icons/ShieldIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import ShoppingCartIcon from "../Icons/ShoppingCartIcon";
import CentreVerifiedTick from "./CentreVerifiedTick";
import OpenStatusBadge from "../OpeningHours/OpenStatusBadge";
import { OpenStatus } from "../OpeningHours/openingHours";
import DeliveryAreaNote, { DeliveryArea } from "../Pharmacy/DeliveryAreaNote";
import useScopedLocale from "../Hooks/useScopedLocale";
import useCart from "../Hooks/useCart";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { useIntlLocale } from "../i18n/navigation";
import { currencize } from "../helpers/currencize";

const NS: ContentNamespace[] = ["common", "centreCard"];

export type CentreKind = "clinic" | "hospital" | "paraClinic" | "pharmacy";

// the public page and list of each kind (the list is where a tag or an
// insurer chip leads: the same list, narrowed to it)
const kindPath: Record<CentreKind, string> = {
  clinic: "/clinic",
  hospital: "/hospital",
  paraClinic: "/paraClinic",
  pharmacy: "/pharmacy",
};
const kindLabel: Record<CentreKind, ContentKey> = {
  clinic: "clinic",
  hospital: "hospital",
  paraClinic: "lab",
  pharmacy: "pharmacy",
};
const actionLabel: Record<CentreKind, ContentKey> = {
  clinic: "seeDetails",
  hospital: "seeDetails",
  paraClinic: "seeParaClinic",
  pharmacy: "seePharmacy",
};

// one lab's offer of the test the list was opened for (Halodoc / Vezeeta:
// "who does CBC, at what price"), bought from the card like on the lab's page
export type CentreTestOffer = {
  _id?: string;
  price?: number;
  readyTime?: string;
  // the lab's plan takes online orders (backend resolveParaClinicModules)
  takesOrders?: boolean;
};

// Every field is optional and read defensively: the card is fed by the
// lists, the global search, the map, the booking pages, the test page and
// the insurer's network, each with its own projection.
export type CentreCardNode = {
  _id: string;
  name?: string;
  slug?: string;
  image?: string;
  avatar?: string;
  banner?: string;
  summary?: string;
  address?: string;
  province?: unknown;
  city?: unknown;
  category?: unknown;
  tags?: unknown;
  insurances?: unknown;
  averageScore?: number;
  commentCount?: number;
  reviewCount?: number;
  isRoundTheClock?: boolean;
  bedCount?: number;
  openStatus?: OpenStatus | null;
  // the verified tick: a valid, non-expired licence the staff approved
  // (backend Lib/centreVerified.ts) - never inferred from an owner account
  verified?: boolean;
  // pharmacy: its plan takes online orders, and where it ships
  takesOrders?: boolean;
  deliveryArea?: DeliveryArea | null;
};

type Named = { _id: string; name: string };
const named = (value: unknown): Named | undefined =>
  !!value &&
  typeof value === "object" &&
  typeof (value as { name?: unknown }).name === "string" &&
  !!(value as { name: string }).name
    ? {
        _id: String((value as { _id?: unknown })._id ?? ""),
        name: (value as { name: string }).name,
      }
    : undefined;
const namedList = (value: unknown): Named[] =>
  (Array.isArray(value) ? value : []).map(named).filter((el): el is Named => !!el && !!el._id);

const MAX_INSURERS = 3;

const OfferRow = ({ offer }: { offer: CentreTestOffer }) => {
  const getContent = useScopedLocale(NS);
  const { cart, mutateCartItem, removeCartItem, isMutating, isRemoving } = useCart();
  const id = offer._id || "";
  const tests = Array.isArray(cart?.tests) ? cart.tests : [];
  const inCart = !!tests.find((el) => el?.item?._id === id)?.qty;
  if (!id || !(Number(offer.price) > 0)) return null;
  return (
    <div className={classes.offer}>
      <div className={classes.offerText}>
        <span className={`${classes.offerPrice} ${tsmMedium}`}>
          {getContent("xToman", [currencize(Number(offer.price) || 0)])}
        </span>
        {!!offer.readyTime && (
          <span className={`${classes.muted} ${txsRegular}`}>
            <Ixon width=".75rem">
              <ClockIcon />
            </Ixon>
            {offer.readyTime}
          </span>
        )}
      </div>
      {offer.takesOrders !== false && (
        <Button
          variant={inCart ? "Error" : "Primary"}
          mode="Fill"
          radius="High"
          // a finger-sized target with a loading state: the tap is answered
          size="M"
          isLoading={isMutating || isRemoving}
          onClick={() =>
            inCart
              ? removeCartItem({ item: id, model: "tests" })
              : mutateCartItem({ item: id, model: "tests" })
          }
          tailIcon={inCart ? <MinusIcon /> : <PlusIcon />}
        >
          {getContent(inCart ? "remove" : "add")}
        </Button>
      )}
    </div>
  );
};

// The ONE centre card of the site (2026-10): clinics, hospitals, labs and
// pharmacies on every list, the search popup, the booking pages, the map,
// a test's labs and an insurer's network - the counterpart of the doctor
// card (Components/UI/DoctorCardAlt). `variant="row"` is its compact form
// (map, booking list view, panels). Kind-specific facts are shown only when
// the data has them: a lab's offer of a test, a pharmacy's online orders and
// delivery area, a hospital's beds and 24-hour emergency. Nothing invented:
// no score before the first review, no tick without a valid licence the
// staff approved.
const CentreCard = ({
  node,
  kind,
  variant = "grid",
  as,
  offer,
  travel,
  footer,
  newTab,
  className = "",
  style,
}: WithStyleProps<{
  node: CentreCardNode;
  kind: CentreKind;
  variant?: "grid" | "row";
  // the wrapper element: "li" inside a list (ListPageList)
  as?: "li" | "div";
  // a lab opened for one test: its price, ready time and add to cart
  offer?: CentreTestOffer;
  // the map: drive time from the visitor, already formatted
  travel?: string;
  // page-specific extra at the end of the card
  footer?: ReactNode;
  // open the centre's page in a new tab (from a panel)
  newTab?: boolean;
}>) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const Tag: ElementType = as || "div";
  const id = typeof node?._id === "string" ? node._id : "";
  const name = typeof node?.name === "string" ? node.name : "";
  const href = `${kindPath[kind]}/${encodeURIComponent(node?.slug || id)}`;
  const image = node?.image || node?.avatar || node?.banner;
  const place = named(node?.city)?.name || named(node?.province)?.name;
  const category = named(node?.category)?.name;
  const tags = namedList(node?.tags);
  const insurers = namedList(node?.insurances);
  // approved, verified reviews only; nothing before the first one
  const reviews = Number(node?.reviewCount ?? node?.commentCount) || 0;
  const score = Number(node?.averageScore) || 0;
  const rating =
    reviews > 0 && score > 0 ? (
      <span className={`${classes.rating} ${txsRegular}`}>
        <Ixon width=".75rem" className={classes.star}>
          <StarIcon />
        </Ixon>
        <span className={classes.score}>
          {new Intl.NumberFormat(intlTag, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(score)}
        </span>
        <span>{`(${getContent("nComments", [new Intl.NumberFormat(intlTag).format(reviews)])})`}</span>
      </span>
    ) : null;
  const tick = <CentreVerifiedTick verified={node?.verified} />;
  // "open 24 hours" is the open-status badge's job once hours are set; the
  // flag alone is shown on a centre without structured hours
  const roundTheClock = !!node?.isRoundTheClock && !node?.openStatus;
  const linkProps = newTab ? { target: "_blank" } : {};

  const facts = (
    <>
      {kind === "hospital" && !!node?.isRoundTheClock && (
        <Badge color="Error" size="S" mode="Fill" radius="High">
          {getContent("mcEmergency")}
        </Badge>
      )}
      {kind === "hospital" && Number(node?.bedCount) > 0 && (
        <span className={`${classes.muted} ${txsRegular}`}>
          <Ixon width=".75rem">
            <StetoscopeIcon />
          </Ixon>
          {getContent("nBeds", [new Intl.NumberFormat(intlTag).format(Number(node.bedCount))])}
        </span>
      )}
      {kind === "pharmacy" && typeof node?.takesOrders === "boolean" && (
        <span className={`${node.takesOrders ? classes.ok : classes.muted} ${txsRegular}`}>
          <Ixon width=".75rem">
            <ShoppingCartIcon />
          </Ixon>
          {getContent(node.takesOrders ? "centreOnlineOrder" : "centreInStoreOnly")}
        </span>
      )}
    </>
  );
  const delivery =
    kind === "pharmacy" && node?.takesOrders !== false && node?.deliveryArea ? (
      <DeliveryAreaNote area={node.deliveryArea} className={classes.delivery} />
    ) : null;
  const insurerChips = insurers.length ? (
    <div className={classes.chips} aria-label={getContent("paraClinicInsurances")}>
      <Ixon width=".875rem" className={classes.chipsIcon}>
        <ShieldIcon />
      </Ixon>
      {insurers.slice(0, MAX_INSURERS).map((el) => (
        // an insurer chip is a filter: the same list, its in-network centres
        <Link key={el._id} href={`${kindPath[kind]}?insurance=${el._id}`} className={classes.chip}>
          {el.name}
        </Link>
      ))}
      {insurers.length > MAX_INSURERS && (
        <span className={`${classes.chip} ${classes.more}`}>
          {`+${new Intl.NumberFormat(intlTag).format(insurers.length - MAX_INSURERS)}`}
        </span>
      )}
    </div>
  ) : null;
  const travelChip = travel ? (
    <span className={`${classes.travel} ${txsMedium}`}>{getContent("mapTravelTimeByCar", [travel])}</span>
  ) : null;

  if (variant === "row")
    return (
      <Tag className={`${classes.rowBox} ${className}`} style={style}>
        <Link href={href} className={classes.row} {...linkProps}>
          <span className={classes.rowImage}>
            <HostedImage src={image} alt={name} fill sizes="3.5rem" style={{ objectFit: "cover" }} />
          </span>
          <span className={classes.rowText}>
            <span className={classes.nameLine}>
              <span className={`${classes.name} ${tsmDemiBold}`}>{name}</span>
              {tick}
            </span>
            <span className={`${classes.muted} ${t2xsRegular}`}>
              {[getContent(kindLabel[kind]), category, place].filter(Boolean).join(" · ")}
            </span>
            {!!node?.address && (
              <span className={`${classes.address} ${t2xsRegular}`}>{node.address}</span>
            )}
            <span className={classes.rowMeta}>
              {rating}
              <OpenStatusBadge status={node?.openStatus} compact />
              {roundTheClock && kind !== "hospital" && (
                <span className={`${classes.ok} ${txsRegular}`}>{getContent("roundTheClock")}</span>
              )}
              {facts}
            </span>
          </span>
          <Ixon width="1.25rem" className={classes.chevron}>
            <ChevronIcon />
          </Ixon>
        </Link>
        {(!!travelChip || !!insurerChips || !!delivery) && (
          <div className={classes.rowExtra}>
            {travelChip}
            {insurerChips}
            {delivery}
          </div>
        )}
        {!!offer && <OfferRow offer={offer} />}
        {footer}
      </Tag>
    );

  return (
    <Tag className={`${classes.main} ${className}`} style={style}>
      <Link href={href} className={classes.media} tabIndex={-1} aria-hidden {...linkProps}>
        <HostedImage alt={name} src={image} sizes="24rem" style={{ objectFit: "cover" }} fill />
        {!!category && (
          <Badge color="Black" size="S" mode="Outline" radius="High" className={classes.mediaStart}>
            {category}
          </Badge>
        )}
        {roundTheClock && kind !== "hospital" && (
          <Badge color="Success" size="S" mode="Fill" radius="High" className={classes.mediaEnd}>
            {getContent("roundTheClock")}
          </Badge>
        )}
      </Link>
      <div className={classes.body}>
        {travelChip}
        <div className={classes.head}>
          <Link href={href} className={classes.nameLine} {...linkProps}>
            <h3 className={`${classes.name} ${tbaseMedium}`}>{name}</h3>
            {tick}
          </Link>
          {rating}
        </div>
        {!!place && (
          <span className={`${classes.muted} ${txsRegular}`}>
            <Ixon width=".75rem">
              <LocationIcon />
            </Ixon>
            <span>{place}</span>
          </span>
        )}
        {/* open now / closes at (backend Lib/openingHours.ts) */}
        <OpenStatusBadge status={node?.openStatus} />
        <div className={classes.facts}>{facts}</div>
        {delivery}
        {insurerChips}
        {!!tags.length && (
          <div className={classes.tags}>
            {tags.map((tag) => (
              // a tag is a filter: it opens the list narrowed to it
              <Link key={tag._id} href={`${kindPath[kind]}?tag=${tag._id}`}>
                <Badge color="Primarylight" size="S" mode="Fill" radius="High">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
      {!!offer && <OfferRow offer={offer} />}
      {footer}
      <Link href={href} className={`${classes.action} ${txsMedium}`} {...linkProps}>
        <span>{getContent(actionLabel[kind])}</span>
        <Ixon width="1.25rem" className={classes.chevron}>
          <ChevronIcon />
        </Ixon>
      </Link>
    </Tag>
  );
};

export default CentreCard;
