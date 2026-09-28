import {
  IProductImage,
  IProductSpec,
} from "@/Components/Admin/Product/AdminManageProductsPage";
import classes from "./CartableNodePageIntro.module.css";
import { Fragment, useState } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import {
  t2xsRegular,
  tmdDemiBold,
  tsmRegular,
  txlMedium,
  txsMedium,
  txsRegular,
} from "@/Components/UI/Typography";
import Ixon from "@/Components/UI/Ixon";
import ShareIcon from "@/Components/Icons/ShareIcon";
import VerifyIcon from "@/Components/Icons/VerifyIcon";
import Image from "next/image";
import { FILE_PATH, FilePath } from "@/Components/config";
import StarIcon from "@/Components/Icons/StarIcon";
import Button from "@/Components/UI/Button";
import StarsSolidIcon from "@/Components/Icons/StarsSolidIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import HostedImage from "@/Components/UI/HostedImage";

const NS: ContentNamespace[] = ["common", "productCartable"];

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

const SpecBox = ({ specs }: { specs: IProductSpec[] }) => {
  const getContent = useScopedLocale(NS);

  if (!specs.length) return null;
  return (
    <div className={classes.specsBox}>
      <span className={`${classes.specsTitle} ${tmdDemiBold}`}>
        {getContent("specs")}
      </span>
      <div className={classes.specsList}>
        {specs.map((spec) => (
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
          onClick={() => {
            const node = document.getElementById("TABS");
            if (node) node.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {getContent("seeAllSpecs")}
        </Button>
      </div>
    </div>
  );
};

const Intro = ({
  name,
  category,
  original,
  className = "",
}: {
  category?: string;
  name: string;
  original?: string;
  className?: string;
}) => {
  return (
    <div className={`${classes.intro} ${className}`}>
      <div className={classes.crumpBox}>
        <div className={`${classes.breadCrump} ${txsMedium}`}>
          {!!category && (
            <Fragment>
              <span className={classes.crump}>{category}</span>
              <span className={classes.slash}>/</span>
            </Fragment>
          )}
          <span className={classes.crump}>{name}</span>
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
      <h1 className={`${classes.h1} ${txlMedium}`}>{name}</h1>
      {!!original && (
        <div className={`${classes.originalBox} ${tsmRegular}`}>
          <Ixon width="1rem" className={classes.originalIcon}>
            <VerifyIcon />
          </Ixon>
          <legend>{original}</legend>
        </div>
      )}
    </div>
  );
};

const CartableNodePageIntro = ({
  images,
  category,
  name,
  original,
  score,
  totalScore,
  commentsCount,
  specs,
}: {
  images: IProductImage[];
  category?: { name?: string };
  name?: string;
  original?: string;
  score: number;
  totalScore: number;
  commentsCount: number;
  specs: IProductSpec[];
}) => {
  const [currentImage, setCurrentImage] = useState<IProductImage | undefined>(
    images[0],
  );

  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.main}>
      <Intro
        category={category?.name}
        name={name || ""}
        original={original}
        className={classes.desktopIntro}
      />
      <div className={classes.content}>
        <div className={classes.imagesBox}>
          <div className={classes.image}>
            <HostedImage
              src={currentImage?.image}
              alt={currentImage?.alt || name || ""}
              sizes="17rem"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className={classes.nav}>
            {images.map((image) => (
              <div
                className={`${classes.navItem} ${image._id === currentImage?._id ? classes.activeNav : ""}`}
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
          <Intro
            className={classes.mobileIntro}
            name={name || ""}
            category={category?.name}
            original={original}
          />
          <div className={classes.stats}>
            <div className={classes.score}>
              <Ixon className={classes.star} width="1rem">
                <StarIcon />
              </Ixon>
              <span className={t2xsRegular}>{score}</span>
            </div>
            <span className={`${classes.commentCount} ${t2xsRegular}`}>
              {getContent("xScoreFromBuyers", [String(totalScore || 0)])}
            </span>
            {/* jumps to the reviews tab (the "AI summary" and Q&A buttons
                were placeholders: no action and a hardcoded count) */}
            <Button
              href="#TABS"
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
              {getContent("nComments", [String(commentsCount || 0)])}
            </Button>
          </div>
          <SpecBox specs={specs} />
        </div>
      </div>
    </div>
  );
};

export default CartableNodePageIntro;
