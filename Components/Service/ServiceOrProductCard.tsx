import classes from "./ServiceOrProductCard.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import {
  t2xsDemiBold,
  t2xsMedium,
  tlgBold,
  tsmDemiBold,
  txsMedium,
} from "../UI/Typography";
import { ReactNode, useMemo } from "react";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import PillIcon from "../Icons/PillIcon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import { clamp } from "../helpers/lib";
import { currencize } from "../helpers/currencize";
import Link from "@/Components/i18n/Link";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "productServiceCard"];

// The shop card for products, product packages and services (2026-10
// redesign, the owner's review: "the medicine card is awful, what is
// «in stock» even for"). As Digikala, Snapp Pharmacy and Amazon Pharmacy
// show a product: the picture on a soft tile with the discount on it, the
// name, who sells it and the rating, and the price the buyer pays with the
// list price struck through; the whole card opens the page. Glass surface
// like every NoyanAI card.
const ServiceOrProductCard = ({
  name,
  image,
  category,
  pack,
  packageInfo,
  owner,
  detail,
  commentCount,
  rating,
  discount,
  price,
  target,
}: {
  image?: string;
  name: string;
  category?: string;
  pack?: number;
  packageInfo?: string;
  owner?: { title: string; icon: ReactNode };
  detail?: { icon: ReactNode; title: string };
  commentCount: number;
  rating: number;
  discount: number;
  price: number;
  target: string;
}) => {
  const getContent = useScopedLocale(NS);

  const percent = useMemo<number>(
    () => (price > 0 ? clamp(0, Math.round((discount / price) * 100), 99) : 0),
    [discount, price],
  );
  const pays = clamp(0, price - (discount || 0), Number.MAX_SAFE_INTEGER);
  const score = Number(rating) || 0;

  return (
    <li className={classes.main}>
      <Link href={target} className={classes.link} aria-label={name}>
        <div className={classes.image}>
          {image ? (
            <HostedImage
              src={image}
              alt={name}
              fill
              sizes="16.5rem"
              style={{ objectFit: "contain" }}
              loading="lazy"
              className={classes.picture}
            />
          ) : (
            <span className={classes.placeholder} aria-hidden>
              <Ixon width="2.25rem">
                <PillIcon />
              </Ixon>
            </span>
          )}
          {!!category && (
            <span className={`${classes.chip} ${t2xsMedium}`}>{category}</span>
          )}
          {!!percent && (
            <span className={`${classes.off} ${t2xsDemiBold}`}>
              {getContent("percentSymbol", [percent.toString()])}
            </span>
          )}
          {!!pack && (
            <span className={`${classes.pack} ${t2xsMedium}`}>
              {getContent("package")} · {pack}
            </span>
          )}
        </div>
        <div className={classes.content}>
          <h3 className={`${classes.name} ${tsmDemiBold}`}>{name}</h3>
          {!!packageInfo && (
            <p className={`${classes.services} ${t2xsMedium}`}>{packageInfo}</p>
          )}
          {!!owner?.title && (
            <div className={`${classes.meta} ${t2xsMedium}`}>
              {owner.icon}
              <span className={classes.ellipsis}>{owner.title}</span>
            </div>
          )}
          {!!detail?.title && (
            <div className={`${classes.meta} ${t2xsMedium}`}>
              {detail.icon}
              <span className={classes.ellipsis}>{detail.title}</span>
            </div>
          )}
          {(score > 0 || commentCount > 0) && (
            <div className={`${classes.rating} ${t2xsMedium}`}>
              <Ixon width=".8rem" className={classes.star}>
                <StarIcon />
              </Ixon>
              <span>{score.toFixed(1)}</span>
              <span className={classes.count}>
                ({getContent("xComments", [String(commentCount || 0)])})
              </span>
            </div>
          )}
          <div className={classes.footer}>
            {/* no live offer: no "0 toman" */}
            {pays > 0 ? (
              <div className={classes.prices}>
                {!!discount && (
                  <s className={`${classes.striked} ${t2xsMedium}`}>
                    {currencize(price)}
                  </s>
                )}
                <span className={classes.price}>
                  <span className={tlgBold}>{currencize(pays)}</span>
                  <span className={`${classes.unit} ${txsMedium}`}>
                    {getContent("toman")}
                  </span>
                </span>
              </div>
            ) : (
              <span />
            )}
            <span className={classes.go} aria-hidden>
              <Ixon width="1.1rem">
                <ArrowLeftIcon />
              </Ixon>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default ServiceOrProductCard;
