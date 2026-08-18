import Image from "next/image";
import { IAdvertisement } from "../Admin/Advertisement/AdminManageAdvertisementsPage";
import useLocale from "../Hooks/useLocale";
import classes from "./HomeAds.module.css";
import HostedImage from "../UI/HostedImage";
import mobileImage from "./mobile.png";
import Link from "next/link";
import Ixon from "../UI/Ixon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import { t3xlDemiBold, tlgDemiBold, tmdMedium } from "../UI/Typography";

const HomeAds = ({ nodes }: { nodes?: IAdvertisement[] }) => {
  const getContent = useLocale();

  if (!nodes?.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.consts}>
        <div className={classes.mobileContainer}>
          <div className={classes.mobile}>
            <Image
              src={mobileImage}
              alt="screenshot of noyan application"
              fill
              style={{ objectFit: "contain" }}
              sizes="16rem"
            />
          </div>
        </div>
        <div className={classes.content}>
          <h5 className={`${classes.title} ${t3xlDemiBold}`}>
            {getContent("HomeAdTitle")}
          </h5>
          <div className={classes.details}>
            <span className={tlgDemiBold}>{getContent("homeAdSubtitle")}</span>
            <span className={tmdMedium}>{getContent("homeAdDescription")}</span>
            <Link href={"/book"} className={`${classes.action} ${tmdMedium}`}>
              <span>{getContent("onlineBooking")}</span>
              <Ixon width="1.5rem">
                <ArrowLeftIcon />
              </Ixon>
            </Link>
          </div>
        </div>
      </div>
      <div className={classes.col}>
        {nodes.map((node) => (
          <div key={node._id} className={classes.ad}>
            <HostedImage
              src={node.image}
              alt={node.name || ""}
              fill
              style={{ objectFit: "contain" }}
              sizes="34.25rem"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeAds;
