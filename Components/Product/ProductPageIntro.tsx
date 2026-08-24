import { Fragment, useState } from "react";
import { ProductPageProduct } from "./ProductPage";
import classes from "./ProductPageIntro.module.css";
import Ixon from "../UI/Ixon";
import ShareIcon from "../Icons/ShareIcon";
import VerifyIcon from "../Icons/VerifyIcon";
import Image from "next/image";
import {
  IProduct,
  IProductImage,
  IProductSpec,
} from "../Admin/Product/AdminManageProductsPage";
import { FILE_PATH, FilePath } from "../config";
import StarIcon from "../Icons/StarIcon";
import useLocale from "../Hooks/useLocale";
import Button from "../UI/Button";
import StarsSolidIcon from "../Icons/StarsSolidIcon";
import ChevronIcon from "../Icons/ChevronIcon";
import UpgradeProBox from "./UpgradeProBox";
import {
  t2xsRegular,
  tmdDemiBold,
  tsmRegular,
  txlMedium,
  txsMedium,
  txsRegular,
} from "../UI/Typography";
import HostedImage from "../UI/HostedImage";

const Spec = ({ spec }: { spec: IProductSpec }) => {
  return (
    <div className={classes.spec}>
      <span className={`${classes.specTitle} ${txsRegular}`}>{spec.title}</span>
      <span className={`${classes.specValue} ${txsRegular}`}>
        {spec.content}
      </span>
    </div>
  );
};

const SpecBox = ({ data }: { data: ProductPageProduct }) => {
  const getContent = useLocale();

  if (!data.specs.length) return null;
  return (
    <div className={classes.specsBox}>
      <span className={`${classes.specsTitle} ${tmdDemiBold}`}>
        {getContent("specs")}
      </span>
      <div className={classes.specsList}>
        {data.specs.map((spec) => (
          <Spec key={spec._id} spec={spec} />
        ))}
      </div>
      <div className={classes.specFooter}>
        <Button
          variant="Neutral"
          size="S"
          mode="Outline"
          radius="Medium"
          tailIcon={<ChevronIcon />}
        >
          {getContent("seeAllSpecs")}
        </Button>
      </div>
    </div>
  );
};

const ProductPageIntro = ({
  data,
}: {
  data: IProduct<{
    Images: Record<never, never>;
    Category: Record<never, never>;
  }>;
}) => {
  const [currentImage, setCurrentImage] = useState<IProductImage>(
    data.images[0],
  );

  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.crumpBox}>
        <div className={`${classes.breadCrump} ${txsMedium}`}>
          {!!data.category && (
            <Fragment>
              <span className={classes.crump}>{data.category.name}</span>
              <span className={classes.slash}>/</span>
            </Fragment>
          )}
          <span className={classes.crump}>{data.name}</span>
        </div>
        <button
          className={classes.share}
          onClick={() => navigator.share({ text: window.location.toString() })}
        >
          <Ixon width="1rem">
            <ShareIcon />
          </Ixon>
        </button>
      </div>
      <h1 className={`${classes.h1} ${txlMedium}`}>{data.name}</h1>
      {!!data.original && (
        <div className={`${classes.originalBox} ${tsmRegular}`}>
          <Ixon width="1rem" className={classes.originalIcon}>
            <VerifyIcon />
          </Ixon>
          <legend>{data.original}</legend>
        </div>
      )}
      <div className={classes.content}>
        <div className={classes.imagesBox}>
          <div className={classes.image}>
            <HostedImage
              src={currentImage.image}
              alt={currentImage.alt || ""}
              sizes="17rem"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className={classes.nav}>
            {data.images.map((image) => (
              <div
                className={`${classes.navItem} ${image._id === currentImage._id ? classes.activeNav : ""}`}
                key={image._id}
                onClick={() => setCurrentImage(image)}
              >
                <HostedImage
                  src={image.image}
                  alt={image.alt || ""}
                  fill
                  sizes="6.25rem"
                  style={{ objectFit: "contain" }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={classes.detailsBox}>
          <div className={classes.stats}>
            <div className={classes.score}>
              <Ixon className={classes.star} width="1rem">
                <StarIcon />
              </Ixon>
              <span className={t2xsRegular}>
                {data.averageScore?.toFixed(1)}
              </span>
            </div>
            <span className={`${classes.commentCount} ${t2xsRegular}`}>
              {getContent("xScoreFromBuyers", [data.commentCount.toString()])}
            </span>
            <Button
              variant="Secondary"
              mode="Fill"
              size="S"
              radius="High"
              leadIcon={<StarsSolidIcon />}
            >
              {getContent("commentsSummary")}
            </Button>
            <Button
              variant="Disable"
              radius="High"
              size="S"
              mode="Fill"
              tailIcon={
                <Ixon style={{ transform: "rotateZ(90deg)" }}>
                  <ChevronIcon />
                </Ixon>
              }
            >
              {getContent("nComments", [data.commentCount.toString()])}
            </Button>
            <Button
              variant="Disable"
              radius="High"
              size="S"
              mode="Fill"
              tailIcon={
                <Ixon style={{ transform: "rotateZ(90deg)" }}>
                  <ChevronIcon />
                </Ixon>
              }
            >
              {getContent("nQna", ["15"])}
            </Button>
          </div>
          <SpecBox data={data} />
          <UpgradeProBox />
        </div>
      </div>
    </div>
  );
};

export default ProductPageIntro;
