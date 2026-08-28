"use client";

import { useState } from "react";
import classes from "./BigAd.module.css";
import useAdvertisement, {
  UseAdvertisementProps,
} from "@/Components/Hooks/useAdvertisement";
import { imagePath } from "../../helpers/imagepath";
import Ixon from "../Ixon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import Button from "../Button";
import { t2xsRegular, tlgBold, tsmMedium } from "../Typography";

const BigAd = ({
  position,
  resourceModel,
  resource,
  render,
}: UseAdvertisementProps) => {
  const ad = useAdvertisement({ position, resourceModel, resource });
  const [isDismissed, setIsDismissed] = useState(false);

  if (!ad || isDismissed) return null;
  if (!!render) return render(ad);
  return (
    <div
      className={classes.main}
      style={
        ad.image
          ? { backgroundImage: `url(${imagePath(ad.image)})` }
          : undefined
      }
    >
      {!!ad.image && <span className={classes.overlay} />}
      <span className={classes.blobStart} />
      <span className={classes.blobEnd} />
      <button
        type="button"
        className={classes.close}
        onClick={() => setIsDismissed(true)}
        aria-label="بستن"
      >
        <Ixon width="1rem">
          <XMarkIcon />
        </Ixon>
      </button>
      <div className={classes.row}>
        <div className={classes.content}>
          {!!ad.legend && (
            <p className={`${classes.legend} ${t2xsRegular}`}>{ad.legend}</p>
          )}
          {!!ad.title && (
            <p className={`${classes.title} ${tlgBold}`}>{ad.title}</p>
          )}
          {!!ad.description && (
            <p className={`${classes.description} ${tsmMedium}`}>
              {ad.description}
            </p>
          )}
        </div>
        {!!ad.target && (
          <Button
            href={ad.target}
            variant="Neutral"
            mode="Inline"
            size="S"
            radius="High"
            className={classes.button}
          >
            اطلاعات بیشتر
          </Button>
        )}
      </div>
    </div>
  );
};

export default BigAd;
