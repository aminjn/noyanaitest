"use client";

import { useMemo } from "react";
import { useIntlLocale, useListSeparator } from "@/Components/i18n/navigation";
import classes from "./PharmacyPage.module.css";
import Link from "@/Components/i18n/Link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import BreadCrump from "../UI/BreadCrump";
import HostedImage from "../UI/HostedImage";
import Ixon from "../UI/Ixon";
import VerifyIcon from "../Icons/VerifyIcon";
import LocationIcon from "../Icons/LocationIcon";
import CheckSquareIcon from "../Icons/CheckSquareIcon";
import LocationSection from "../Clinic/LocationSection";
import CommentSection from "../Comment/CommentSection";
import StarIcon from "../Icons/StarIcon";
import ServiceOrProductCard from "../Service/ServiceOrProductCard";
import CartActions from "../Product/CartActions";
import DeliveryAreaNote, { DeliveryArea } from "./DeliveryAreaNote";
import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import OpenStatusBadge from "../OpeningHours/OpenStatusBadge";
import OpeningHoursTable from "../OpeningHours/OpeningHoursTable";
import { exceptionsOf, weekOf } from "../OpeningHours/openingHours";
import {
  IProduct,
  IProductSeller,
} from "../Admin/Product/AdminManageProductsPage";
import { IProductPackage } from "../Admin/ProductPackage/AdminManageProductPackagesPage";

const NS: ContentNamespace[] = ["common", "pharmacyPage", "productServiceCard", "openingHours"];

// inStock: false when the pharmacy keeps stock of it and has none left
type Offer = Omit<IProductSeller, "product"> & {
  product?: IProduct<{ Category: Record<never, never> }>;
  inStock?: boolean;
};

type Package = IProductPackage<{
  Owner: Record<never, never>;
  Products: Record<never, never>;
  Category: Record<never, never>;
}> & { inStock?: boolean };

type AcceptedInsurer = { _id: string; name?: string; slug?: string };

export type PharmacyPageProps = {
  data: Omit<
    IPharmacy<{
      Province: Record<never, never>;
      City: Record<never, never>;
      District: Record<never, never>;
    }>,
    "insurances"
  > & {
    insurances?: (AcceptedInsurer | string)[];
    // approved buyer reviews (2026-10)
    averageScore?: number;
    commentCount?: number;
  };
  products?: Offer[];
  productPackages?: Package[];
  // false: the pharmacy's plan has no online orders - a profile to call
  takesOrders?: boolean;
  // where it ships (2026-10, backend Lib/delivery.ts)
  deliveryArea?: DeliveryArea;
};

// Public page of one pharmacy (Halodoc / Vezeeta style): who it is, where it
// is, and what can be ordered from it right now - each card buys this
// pharmacy's own offer, not the cheapest one on the product page.
const PharmacyPage = ({ data, products, productPackages, takesOrders, deliveryArea }: PharmacyPageProps) => {
  const getContent = useScopedLocale(NS);
  const listSep = useListSeparator();
  const intlTag = useIntlLocale();
  const scoreFmt = useMemo(
    () => new Intl.NumberFormat(intlTag, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    [intlTag],
  );
  const reviewCount = Number(data.commentCount) || 0;
  const offers = (Array.isArray(products) ? products : []).filter((o) => !!o?.product);
  const packages = Array.isArray(productPackages) ? productPackages : [];
  const place = [data.province?.name, data.city?.name, data.district?.name]
    .filter(Boolean)
    .join(listSep);
  // contact and hours (2026-10)
  const facts = data;
  // a structured week shows as the table (its free text as the note)
  const hasWeek = !!weekOf(data.openingHours) || !!exceptionsOf(data.openingHours).length;
  const insurers = (Array.isArray(data.insurances) ? data.insurances : []).filter(
    (el): el is AcceptedInsurer => !!el && typeof el === "object" && !!el._id,
  );
  const orderable = takesOrders !== false;
  // "in stock" only when the pharmacy's own inventory does not say otherwise
  const stockDetail = (available: boolean | undefined) =>
    available === false
      ? { icon: null, title: getContent("outOfStock") }
      : {
          icon: (
            <Ixon className={classes.checkIcon} width=".75rem">
              <CheckSquareIcon />
            </Ixon>
          ),
          title: getContent("availableInStock"),
        };

  return (
    <div className={classes.main}>
      <BreadCrump
        trail={[
          { title: getContent("homePage"), target: "/" },
          { title: getContent("products"), target: "/product" },
          { title: data.name || data._id, target: `/pharmacy/${data.slug || data._id}` },
        ]}
        className={classes.crump}
      />

      <section className={classes.intro}>
        {!!data.banner && (
          <div className={classes.banner}>
            <HostedImage alt={data.name || ""} src={data.banner} fill sizes="100vw" style={{ objectFit: "cover" }} />
          </div>
        )}
        <div className={classes.head}>
          <div className={classes.avatar}>
            <HostedImage alt={data.name || ""} src={data.avatar} fill sizes="5rem" style={{ objectFit: "cover" }} />
          </div>
          <div className={classes.headText}>
            <h1 className={classes.name}>
              {data.name}
              <Ixon width="1.1rem" className={classes.verify}>
                <VerifyIcon />
              </Ixon>
            </h1>
            {reviewCount > 0 && (
              <a className={classes.rating} href="#Comment">
                <Ixon width=".9rem" className={classes.star}>
                  <StarIcon />
                </Ixon>
                <strong>{scoreFmt.format(Number(data.averageScore) || 0)}</strong>
                <span>{`(${getContent("nComments", [new Intl.NumberFormat(intlTag).format(reviewCount)])})`}</span>
              </a>
            )}
            {(!!place || !!data.address) && (
              <span className={classes.place}>
                <Ixon width=".9rem">
                  <LocationIcon />
                </Ixon>
                {[place, data.address].filter(Boolean).join(" - ")}
              </span>
            )}
            {takesOrders !== false && <DeliveryAreaNote area={deliveryArea} rxNote />}
            {/* open now / closes at (2026-10, backend Lib/openingHours.ts) */}
            <OpenStatusBadge status={data.openStatus} />
            {((!!facts.isRoundTheClock && !hasWeek) || (!!facts.businessTime && !hasWeek) || !!facts.phone) && (
              <span className={classes.facts}>
                {!!facts.isRoundTheClock && !hasWeek && <span className={classes.chip}>{getContent("roundTheClock")}</span>}
                {!!facts.businessTime && !hasWeek && (
                  <span>
                    {getContent("businessTime")}: {facts.businessTime}
                  </span>
                )}
                {!!facts.phone && (
                  <a href={`tel:${facts.phone}`} dir="ltr">
                    {facts.phone}
                  </a>
                )}
              </span>
            )}
          </div>
        </div>
        {!!insurers.length && (
          <div className={classes.about}>
            <h2 className={classes.sectionTitle}>{getContent("paraClinicInsurances")}</h2>
            <div className={classes.facts}>
              {insurers.map((el) => (
                <Link key={el._id} className={classes.chip} href={`/insurance/${el.slug || el._id}`}>
                  {el.name || el._id}
                </Link>
              ))}
            </div>
          </div>
        )}
        {hasWeek && (
          <div className={classes.about}>
            <OpeningHoursTable hours={data.openingHours} status={data.openStatus} note={facts.businessTime} />
          </div>
        )}
        {!!data.summary && (
          <div className={classes.about}>
            <h2 className={classes.sectionTitle}>{getContent("about")}</h2>
            <p>{data.summary}</p>
          </div>
        )}
      </section>

      <section className={classes.section}>
        <h2 className={classes.sectionTitle}>{getContent("pharmacyProductsTitle")}</h2>
        {!offers.length && !packages.length && (
          <p className={classes.empty}>{getContent("pharmacyNoProducts")}</p>
        )}
        {!orderable && (!!offers.length || !!packages.length) && (
          <p className={classes.notice}>{getContent("onlineOrderUnavailable")}</p>
        )}
        {!!offers.length && (
          <ul className={classes.grid}>
            {offers.map((offer) => (
              <li key={offer._id} className={classes.cell}>
                <ul className={classes.cardWrap}>
                  <ServiceOrProductCard
                    name={offer.product?.name || ""}
                    image={offer.product?.image}
                    category={offer.product?.category?.name}
                    commentCount={offer.product?.commentCount || 0}
                    rating={offer.product?.averageScore || 0}
                    price={offer.price || 0}
                    discount={offer.discount || 0}
                    detail={stockDetail(offer.inStock)}
                    target={`/product/${offer.product?.slug || offer.product?._id}`}
                  />
                </ul>
                {orderable && offer.inStock !== false && (
                  <CartActions itemId={offer._id} model="products" />
                )}
              </li>
            ))}
          </ul>
        )}
        {!!packages.length && (
          <>
            <h3 className={classes.subTitle}>{getContent("productPackages")}</h3>
            <ul className={classes.grid}>
              {packages.map((node) => (
                <li key={node._id} className={classes.cell}>
                  <ul className={classes.cardWrap}>
                    <ServiceOrProductCard
                      name={node.name || ""}
                      image={node.image}
                      category={node.category?.name}
                      commentCount={node.commentCount || 0}
                      rating={node.averageScore || 0}
                      price={node.price || 0}
                      discount={node.discount || 0}
                      pack={Array.isArray(node.products) ? node.products.length : undefined}
                      detail={stockDetail(node.inStock)}
                      target={`/productPackage/${node.slug || node._id}`}
                    />
                  </ul>
                  {orderable && node.inStock !== false && (
                    <CartActions itemId={node._id} model="productPackages" />
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <LocationSection
        className={classes.location}
        coords={data.location?.coordinates}
        name={data.name}
        address={data.address}
      />

      {/* verified buyer reviews (2026-10): score, tags summary, recent reviews */}
      <section className={classes.section} id="Comment">
        <CommentSection nodeId={data._id} model="Pharmacy" />
      </section>
    </div>
  );
};

export default PharmacyPage;
