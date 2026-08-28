import { IAdvertisement } from "../Admin/Advertisement/AdminManageAdvertisementsPage";
import useAdvertisement from "../Hooks/useAdvertisement";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import { WithStyleProps } from "../Layout/Layout";
import Button from "../UI/Button";
import HostedImage from "../UI/HostedImage";
import BigAd from "../UI/ListPage/BigAd";
import { tbaseMedium, tmdBold, tsmMedium, txlDemiBold } from "../UI/Typography";
import classes from "./HomeAds2.module.css";

const Item = ({
  node,
  className = "",
  style,
}: WithStyleProps<{ node: IAdvertisement }>) => {
  return (
    <div className={`${classes.item} ${className}`} style={style}>
      <div className={classes.image}>
        <HostedImage
          src={node.image}
          alt={node.title}
          fill
          sizes="200px"
          style={{ objectFit: "contain" }}
        />
      </div>
      <div className={classes.content}>
        <span className={`${classes.title} ${tmdBold}`}>{node.title}</span>
        <span className={`${classes.description} ${tsmMedium}`}>
          {node.description}
        </span>
        <Button size="L" tailIcon={<ArrowLeftIcon />} href={node.target}>
          {node.legend}
        </Button>
      </div>
    </div>
  );
};

const HomeAds2 = () => {
  const big = useAdvertisement({ position: "home2" });
  const small1 = useAdvertisement({ position: "home3" });
  const small2 = useAdvertisement({ position: "home4" });

  if (!big && !small1 && !small2) return null;
  return (
    <div className={classes.main}>
      {!!big && <Item node={big} className={classes.big} />}
      {(!!small1 || !!small2) && (
        <div className={classes.side}>
          {!!small1 && <Item node={small1} className={classes.small} />}
          {!!small2 && <Item node={small2} className={classes.small} />}
        </div>
      )}
    </div>
  );
};

export default HomeAds2;
