import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./ProductCartInfos.module.css";
import { tsmRegular } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import TruckIcon from "../Icons/TruckIcon";
import LocationIcon from "../Icons/LocationIcon";
import ShieldIcon from "../Icons/ShieldIcon";

const NS: ContentNamespace[] = ["common", "productCartable"];

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

const ProductCartInfos = ({ service }: { service?: boolean }) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.infos}>
      <Info
        icon={<TruckIcon />}
        content={getContent(service ? "cartInfoItem0Service" : "cartInfoItem0")}
      />
      <Info
        icon={<LocationIcon />}
        content={getContent(service ? "cartInfoItem1Service" : "cartInfoItem1")}
      />
      <Info
        icon={<ShieldIcon />}
        content={getContent(service ? "cartInfoItem2Service" : "cartInfoItem2")}
      />
    </div>
  );
};

export default ProductCartInfos;
