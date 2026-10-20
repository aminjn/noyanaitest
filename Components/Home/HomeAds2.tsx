import Image from "next/image";
import Link from "@/Components/i18n/Link";
import { IAdvertisement } from "../Admin/Advertisement/AdminManageAdvertisementsPage";
import useAdvertisement from "../Hooks/useAdvertisement";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import HostedImage from "../UI/HostedImage";
import Ixon from "../UI/Ixon";
import { tmdMedium, tsmDemiBold, txlBold, txsMedium } from "../UI/Typography";
import mobileImage from "./mobile.png";
import classes from "./HomeAds2.module.css";
import { safeHref } from "@/Components/helpers/safeHref";

const NS: ContentNamespace[] = ["common", "home"];

// The block under the top doctors, as in the design (2026-10): at the start
// the online-consultation card with the app on a phone, beside it two
// banners from the super admin («تبلیغات», positions home3 and home4). A
// banner is its picture (the text is in the image), the whole of it the
// link, marked as an ad. An ad in home2 replaces the consultation card.
const Banner = ({ node, label }: { node: IAdvertisement; label: string }) => {
  const body = (
    <>
      <HostedImage
        src={node.image}
        alt={node.title || node.name || ""}
        fill
        sizes="(max-width: 900px) 100vw, 34rem"
        style={{ objectFit: "cover" }}
        loading="lazy"
      />
      <span className={`${classes.adLabel} ${txsMedium}`}>{label}</span>
    </>
  );
  return node.target ? (
    <a href={safeHref(node.target)} className={classes.banner} rel="sponsored noopener">
      {body}
    </a>
  ) : (
    <div className={classes.banner}>{body}</div>
  );
};

const HomeAds2 = () => {
  const getContent = useScopedLocale(NS);
  const big = useAdvertisement({ position: "home2" });
  const small1 = useAdvertisement({ position: "home3" });
  const small2 = useAdvertisement({ position: "home4" });
  const banners = [small1, small2].filter((n): n is IAdvertisement => !!n?.image);
  const label = getContent("adBadge");

  return (
    <section className={`${classes.main} ${banners.length ? "" : classes.alone}`}>
      {big?.image ? (
        <div className={classes.feature}>
          <Banner node={big} label={label} />
        </div>
      ) : (
        <div className={classes.feature}>
          <div className={classes.featureText}>
            <h2 className={`${classes.title} ${txlBold}`}>{getContent("homeConsultTitle")}</h2>
            <p className={`${classes.lines} ${tmdMedium}`}>
              <span>{getContent("homeConsultLine1")}</span>
              <span>{getContent("homeConsultLine2")}</span>
            </p>
            <Link href="/book" className={`${classes.cta} ${tsmDemiBold}`}>
              <span>{getContent("homeConsultCta")}</span>
              <Ixon width="1.25rem">
                <ArrowLeftIcon />
              </Ixon>
            </Link>
          </div>
          <div className={classes.phone}>
            <Image src={mobileImage} alt="" fill sizes="14rem" style={{ objectFit: "contain" }} />
          </div>
        </div>
      )}
      {!!banners.length && (
        <div className={classes.side}>
          {banners.map((node) => (
            <Banner key={node._id} node={node} label={label} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeAds2;
