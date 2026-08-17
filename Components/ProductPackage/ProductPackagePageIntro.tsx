import { Fragment, useState } from "react";
import classes from "./ProductPackagePageintro.module.css";
import Ixon from "../UI/Ixon";
import ShareIcon from "../Icons/ShareIcon";
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
import {
  t2xsRegular,
  tmdDemiBold,
  tsmDemiBold,
  tsmRegular,
  txlMedium,
  txsMedium,
  txsRegular,
} from "../UI/Typography";
import { ProductPackagePageProps } from "./ProductPackagePage";

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

const SpecBox = ({ data }: { data: ProductPackagePageProps["data"] }) => {
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

const ProductPackagePageIntro = ({
  data,
}: {
  data: ProductPackagePageProps["data"];
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
      <div className={classes.content}>
        <div className={classes.imagesBox}>
          <div className={classes.image}>
            <Image
              src={`${FILE_PATH}/${currentImage.image}`}
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
                <Image
                  src={`${FilePath}/${image.image}`}
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
                {data.averageScore.toFixed(1)}
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
          {!!data.owner && (
            <div className={classes.owner}>
              <div className={classes.ownerImage}>
                <Image
                  alt={data.owner.name || ""}
                  src={`${FilePath}/${data.owner.avatar}`}
                  fill
                  sizes="3.5rem"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={classes.ownerContent}>
                <div className={`${classes.ownerName} ${tsmDemiBold}`}>
                  {data.owner.name}
                </div>
                <div className={classes.ownerScore}>
                  <Ixon width=".75rem">
                    <StarIcon />
                  </Ixon>
                  <span>4.9</span>
                </div>
              </div>
              <Ixon
                className={classes.chevron}
                width="1.5rem"
                style={{ transform: "rotateZ(90deg)" }}
              >
                <ChevronIcon />
              </Ixon>
            </div>
          )}
          <SpecBox data={data} />
        </div>
      </div>
    </div>
  );
};

export default ProductPackagePageIntro;
