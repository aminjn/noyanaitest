"use client";

import { Fragment, useState } from "react";
import classes from "./SmallAd.module.css";
import useAdvertisement, {
  UseAdvertisementProps,
} from "@/Components/Hooks/useAdvertisement";
import { imagePath } from "../../helpers/imagepath";
import Ixon from "../Ixon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import Button from "../Button";
import {
  t2xsRegular,
  tsmDemiBold,
  tsmMedium,
  txsDemiBold,
  txsRegular,
} from "../Typography";
import HostedImage from "../HostedImage";
import AnnouncementIcon from "@/Components/Icons/AnnouncementIcon";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";

const SmallAd = ({
  position,
  resourceModel,
  resource,
}: UseAdvertisementProps) => {
  const ad = useAdvertisement({ position, resourceModel, resource });
  const [isDismissed, setIsDismissed] = useState(false);
  const getContent = useScopedLocale();

  if (!ad || isDismissed) return null;

  return (
    <div className={classes.main}>
      {!!ad.image && (
        <Fragment>
          <HostedImage
            src={ad.image}
            alt={ad.title}
            fill
            sizes="70rem"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
          <span className={classes.overlay} />
        </Fragment>
      )}
      <div className={classes.row}>
        <Ixon width="1.5rem" className={classes.icon}>
          <AnnouncementIcon />
        </Ixon>
        <div className={classes.content}>
          {/* {!!ad.legend && (
            <span className={`${classes.legend} ${t2xsRegular}`}>
              {ad.legend}
            </span>
          )} */}
          {!!ad.title && (
            <span className={`${classes.title} ${tsmDemiBold}`}>
              {ad.title}
            </span>
          )}
          {!!ad.description && (
            <span className={`${classes.description} ${txsRegular}`}>
              {ad.description}
            </span>
          )}
        </div>
        <div className={classes.end}>
          {!!ad.target && (
            <Button
              href={ad.target}
              variant="Neutral"
              mode="Inline"
              size="S"
              radius="High"
              className={classes.button}
            >
              {getContent("learnMore")}
            </Button>
          )}
          <button
            type="button"
            className={classes.close}
            onClick={() => setIsDismissed(true)}
            aria-label={getContent("close")}
          >
            <Ixon width="1rem">
              <XMarkIcon />
            </Ixon>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmallAd;
