"use client";

import { useListSeparator } from "@/Components/i18n/navigation";
import classes from "./PharmacyPage.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import BreadCrump from "../UI/BreadCrump";
import HostedImage from "../UI/HostedImage";
import Ixon from "../UI/Ixon";
import VerifyIcon from "../Icons/VerifyIcon";
import LocationIcon from "../Icons/LocationIcon";
import CheckSquareIcon from "../Icons/CheckSquareIcon";
import LocationSection from "../Clinic/LocationSection";
import ServiceOrProductCard from "../Service/ServiceOrProductCard";
import CartActions from "../Product/CartActions";
import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import {
  IProduct,
  IProductSeller,
} from "../Admin/Product/AdminManageProductsPage";
import { IProductPackage } from "../Admin/ProductPackage/AdminManageProductPackagesPage";

const NS: ContentNamespace[] = ["common", "pharmacyPage", "productServiceCard"];

type Offer = Omit<IProductSeller, "product"> & {
  product?: IProduct<{ Category: Record<never, never> }>;
};

type Package = IProductPackage<{
  Owner: Record<never, never>;
  Products: Record<never, never>;
  Category: Record<never, never>;
}>;

export type PharmacyPageProps = {
  data: IPharmacy<{
    Province: Record<never, never>;
    City: Record<never, never>;
    District: Record<never, never>;
  }>;
  products?: Offer[];
  productPackages?: Package[];
};

// Public page of one pharmacy (Halodoc / Vezeeta style): who it is, where it
// is, and what can be ordered from it right now - each card buys this
// pharmacy's own offer, not the cheapest one on the product page.
const PharmacyPage = ({ data, products, productPackages }: PharmacyPageProps) => {
  const getContent = useScopedLocale(NS);
  const listSep = useListSeparator();
  const offers = (Array.isArray(products) ? products : []).filter((o) => !!o?.product);
  const packages = Array.isArray(productPackages) ? productPackages : [];
  const place = [data.province?.name, data.city?.name, data.district?.name]
    .filter(Boolean)
    .join(listSep);
  const inStock = {
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
            {(!!place || !!data.address) && (
              <span className={classes.place}>
                <Ixon width=".9rem">
                  <LocationIcon />
                </Ixon>
                {[place, data.address].filter(Boolean).join(" - ")}
              </span>
            )}
          </div>
        </div>
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
                    detail={inStock}
                    target={`/product/${offer.product?.slug || offer.product?._id}`}
                  />
                </ul>
                <CartActions itemId={offer._id} model="products" />
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
                      detail={inStock}
                      target={`/productPackage/${node.slug || node._id}`}
                    />
                  </ul>
                  <CartActions itemId={node._id} model="productPackages" />
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
    </div>
  );
};

export default PharmacyPage;
