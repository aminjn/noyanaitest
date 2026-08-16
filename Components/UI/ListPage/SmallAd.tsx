"use client";

import { useState } from "react";
import classes from "./SmallAd.module.css";
import useAdvertisement, {
  UseAdvertisementProps,
} from "@/Components/Hooks/useAdvertisement";
import { imagePath } from "../../helpers/imagepath";
import Ixon from "../Ixon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import Button from "../Button";
import { t2xsRegular, tsmMedium, txsDemiBold } from "../Typography";

const SmallAd = ({
  position,
  resourceModel,
  resource,
}: UseAdvertisementProps) => {
  const ad = useAdvertisement({ position, resourceModel, resource });
  const [isDismissed, setIsDismissed] = useState(false);

  if (!ad || isDismissed) return null;

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
      <div className={classes.row}>
        <div className={classes.content}>
          {/* {!!ad.legend && (
            <span className={`${classes.legend} ${t2xsRegular}`}>
              {ad.legend}
            </span>
          )} */}
          {!!ad.title && (
            <span className={`${classes.title} ${txsDemiBold}`}>
              {ad.title}
            </span>
          )}
          {!!ad.description && (
            <span className={`${classes.description} ${tsmMedium}`}>
              {ad.description}
            </span>
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

export default SmallAd;
