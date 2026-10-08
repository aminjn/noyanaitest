import Image from "next/image";
import { IParaClinic } from "../Layout/ParaClinicPanelLayout";
import classes from "./ParaClinicCard.module.css";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import LocationIcon from "../Icons/LocationIcon";
import Badge from "../UI/Badge";
import Link from "@/Components/i18n/Link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ChevronIcon from "../Icons/ChevronIcon";
import { tbaseMedium, tsmMedium, txsRegular } from "../UI/Typography";
import useCart from "../Hooks/useCart";
import Button from "../UI/Button";
import MinusIcon from "../Icons/MinusIcon";
import PlusIcon from "../Icons/PlusIcon";
import ClockIcon from "../Icons/ClockIcon";
import { currencize } from "../helpers/currencize";
import HostedImage from "../UI/HostedImage";
import StarIcon from "../Icons/StarIcon";
import { useIntlLocale } from "../i18n/navigation";

const NS: ContentNamespace[] = ["common", "paraClinicCard"];

// one lab's offer of the test the list was opened for (Halodoc / Vezeeta:
// "who does CBC, at what price"), bought from here like on the lab's page
export type ParaClinicTestOffer = {
  _id?: string;
  price?: number;
  readyTime?: string;
  takesOrders?: boolean;
  // the lab's review score (the test page sorts by it), when it has reviews
  rating?: { score?: number; count?: number };
};

const OfferRow = ({ offer }: { offer: ParaClinicTestOffer }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const { cart, mutateCartItem, removeCartItem } = useCart();
  const id = offer._id || "";
  const inCart = !!cart?.tests?.find((el) => el?.item?._id === id)?.qty;
  if (!id || !(Number(offer.price) > 0)) return null;
  return (
    <div className={classes.offer}>
      <div className={classes.offerText}>
        <span className={`${classes.offerPrice} ${tsmMedium}`}>
          {getContent("xToman", [currencize(offer.price || 0)])}
        </span>
        {!!offer.readyTime && (
          <span className={`${classes.offerReady} ${txsRegular}`}>
            <Ixon width=".75rem">
              <ClockIcon />
            </Ixon>
            {offer.readyTime}
          </span>
        )}
        {Number(offer.rating?.count) > 0 && Number(offer.rating?.score) > 0 && (
          <span className={`${classes.offerReady} ${txsRegular}`}>
            <Ixon width=".75rem" className={classes.offerStar}>
              <StarIcon />
            </Ixon>
            {`${new Intl.NumberFormat(intlTag, { maximumFractionDigits: 1 }).format(Number(offer.rating?.score))} · ${getContent("nComments", [new Intl.NumberFormat(intlTag).format(Number(offer.rating?.count))])}`}
          </span>
        )}
      </div>
      {offer.takesOrders !== false && (
        <Button
          variant={inCart ? "Error" : "Primary"}
          mode="Fill"
          radius="High"
          size="S"
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

// Also the card of a pharmacy in search results (same shape: image, name,
// province, tags) - `kind` only changes the link and its label.
const ParaClinicCard = ({
  node,
  kind = "paraClinic",
  offer,
}: {
  kind?: "paraClinic" | "pharmacy";
  offer?: ParaClinicTestOffer;
  node: IParaClinic<{
    Tags: Record<never, never>;
    Province: Record<never, never>;
  }>;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  // approved, verified buyer reviews (2026-10); nothing shown before the first
  const reviewCount = Number(node.commentCount) || 0;

  return (
    <li className={`${classes.main} ${offer ? classes.withOffer : ""}`}>
      <div className={classes.image}>
        <HostedImage
          src={node.image}
          alt={node.name || ""}
          sizes="23rem"
          style={{ objectFit: "contain" }}
          fill
        />
      </div>
      <div className={classes.details}>
        <h3 className={`${classes.name} ${tbaseMedium}`}>{node.name}</h3>
        {reviewCount > 0 && (
          <div className={`${classes.rating} ${txsRegular}`}>
            <Ixon width=".75rem" className={classes.star}>
              <StarIcon />
            </Ixon>
            <span className={classes.score}>
              {new Intl.NumberFormat(intlTag, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
                Number(node.averageScore) || 0,
              )}
            </span>
            <span>{`(${getContent("nComments", [new Intl.NumberFormat(intlTag).format(reviewCount)])})`}</span>
          </div>
        )}
        {!!node.province && (
          <div className={`${classes.province} ${txsRegular}`}>
            <Ixon width=".75rem">
              <LocationIcon />
            </Ixon>
            <span>{node.province.name}</span>
          </div>
        )}
      </div>
      {!!node.tags?.length && (
        <div className={classes.tags}>
          {node.tags.map((tag) => (
            // a tag is a filter: it opens the list narrowed to it
            <Link key={tag._id} href={`/paraClinic?tag=${tag._id}`}>
              <Badge size="S" color="Primarylight" mode="Fill" radius="High">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}
      {!!offer && <OfferRow offer={offer} />}
      <div className={classes.footer}>
        <Link
          className={classes.link}
          href={`/${kind}/${node.slug || node._id}`}
        >
          <span>
            {getContent(kind === "pharmacy" ? "seePharmacy" : "seeParaClinic")}
          </span>
          <Ixon width="1.25rem" style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </Link>
      </div>
    </li>
  );
};

export default ParaClinicCard;
