import { Fragment, ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./ProductCartInfos.module.css";
import { tsmRegular } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import TruckIcon from "../Icons/TruckIcon";
import LocationIcon from "../Icons/LocationIcon";
import ShieldIcon from "../Icons/ShieldIcon";
import DeliveryAreaNote, { DeliveryArea } from "../Pharmacy/DeliveryAreaNote";

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

// For a product the delivery lines follow the chosen offer: "fast delivery"
// / "free delivery" only when that pharmacy actually offers it.
const ProductCartInfos = ({
  service,
  fastDelivery,
  freeDelivery,
  deliveryArea,
  rx,
}: {
  service?: boolean;
  fastDelivery?: boolean;
  freeDelivery?: boolean;
  // where the chosen pharmacy ships (2026-10): replaces the old fixed
  // "nationwide delivery" line, which was false for a city-only pharmacy
  // and for every prescription-only item
  deliveryArea?: DeliveryArea;
  rx?: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.infos}>
      {service ? (
        <Fragment>
          <Info icon={<TruckIcon />} content={getContent("cartInfoItem0Service")} />
          <Info icon={<LocationIcon />} content={getContent("cartInfoItem1Service")} />
        </Fragment>
      ) : (
        <Fragment>
          {deliveryArea ? (
            <>
              <DeliveryAreaNote area={deliveryArea} rx={rx} />
              {!!fastDelivery && <Info icon={<TruckIcon />} content={getContent("fastDelivery")} />}
            </>
          ) : (
            <Info
              icon={<TruckIcon />}
              content={getContent(fastDelivery ? "cartInfoItem0" : "cartInfoItem1")}
            />
          )}
          {!!freeDelivery && <Info icon={<LocationIcon />} content={getContent("freeDelivery")} />}
        </Fragment>
      )}
      <Info
        icon={<ShieldIcon />}
        content={getContent(service ? "cartInfoItem2Service" : "cartInfoItem2")}
      />
    </div>
  );
};

export default ProductCartInfos;
