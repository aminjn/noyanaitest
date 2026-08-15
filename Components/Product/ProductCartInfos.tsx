import { ReactNode } from "react";
import useLocale from "../Hooks/useLocale";
import classes from "./ProductCartInfos.module.css";
import { tsmRegular } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import TruckIcon from "../Icons/TruckIcon";
import LocationIcon from "../Icons/LocationIcon";
import ShieldIcon from "../Icons/ShieldIcon";

const Info = ({ content, icon }: { icon: ReactNode; content: string }) => {
  return (
    <div className={`${classes.info} ${tsmRegular}`}>
      <Ixon width=".75rem" className={classes.infoIcon}>
        {icon}
      </Ixon>
      <span>{content}</span>
    </div>
  );
};

const ProductCartInfos = () => {
  const getContent = useLocale();
  return (
    <div className={classes.infos}>
      <Info icon={<TruckIcon />} content={getContent("cartInfoItem0")} />
      <Info icon={<LocationIcon />} content={getContent("cartInfoItem1")} />
      <Info icon={<ShieldIcon />} content={getContent("cartInfoItem2")} />
    </div>
  );
};

export default ProductCartInfos;
