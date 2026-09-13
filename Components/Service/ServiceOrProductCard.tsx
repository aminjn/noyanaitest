import Image from "next/image";
import classes from "./ServiceOrProductCard.module.css";
import { FilePath } from "../config";
import Badge from "../UI/Badge";
import useLocale from "../Hooks/useLocale";
import {
  t2xsDemiBold,
  t2xsMedium,
  t2xsRegular,
  tsmMedium,
  txsMedium,
} from "../UI/Typography";
import { ReactNode, useMemo } from "react";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import { clamp } from "../helpers/lib";
import { currencize } from "../helpers/currencize";
import Link from "next/link";
import HostedImage from "../UI/HostedImage";
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
  const getContent = useLocale();

  const disocuntPercent = useMemo<number>(
    () =>
      clamp(0, Math.ceil((discount / price) * 100), Number.MAX_SAFE_INTEGER),
    [discount, price],
  );

  return (
    <li className={classes.main}>
      <div className={classes.image}>
        <HostedImage
          src={image}
          alt={name}
          fill
          sizes="16.5rem"
          style={{ objectFit: "contain" }}
        />
        {!!category && (
          <Badge
            className={classes.category}
            color="Disabled"
            mode="Fill"
            size="S"
            radius="High"
          >
            {category}
          </Badge>
        )}
        {pack && (
          <div className={classes.package}>
            <span>{getContent("package")}</span>
            <span className={classes.packageBadge}>{pack}</span>
          </div>
        )}
      </div>
      <div className={classes.content}>
        <Link href={target}>
          <h3 className={`${classes.name} ${txsMedium}`}>{name}</h3>
        </Link>
        {packageInfo && (
          <p className={`${classes.services} ${t2xsMedium}`}>{packageInfo}</p>
        )}
        {!!owner && (
          <div className={classes.doctor}>
            {owner.icon}
            <span className={`${classes.doctorName} ${t2xsMedium}`}>
              {owner.title}
            </span>
          </div>
        )}
        <div className={classes.details}>
          {!!detail && (
            <div className={classes.province}>
              {detail.icon}
              <span>{detail.title}</span>
            </div>
          )}
          <div className={classes.stats}>
            <span
              className={`${classes.count} ${t2xsRegular}`}
            >{`(${getContent("xComments", [commentCount?.toString()])})`}</span>
          </div>
          <div className={classes.score}>
            <span className={t2xsRegular}>{rating}</span>
            <Ixon width="1rem" className={classes.star}>
              <StarIcon />
            </Ixon>
          </div>
        </div>
        <div className={classes.footer}>
          {!!disocuntPercent && (
            <div className={`${classes.percent} ${t2xsDemiBold}`}>
              {getContent("percentSymbol", [disocuntPercent.toString()])}
            </div>
          )}
          <div className={classes.prices}>
            <span className={classes.price}>
              <span className={tsmMedium}>{currencize(price)}</span>
              <span className={txsMedium}>{getContent("toman")}</span>
            </span>
            {!!discount && (
              <s className={`${classes.striked} ${t2xsMedium}`}>
                {currencize(
                  clamp(0, price - discount, Number.MAX_SAFE_INTEGER),
                )}
              </s>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default ServiceOrProductCard;
