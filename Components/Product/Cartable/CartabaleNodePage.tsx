import { ReactNode } from "react";
import { DeliveryArea } from "../../Pharmacy/DeliveryAreaNote";
import classes from "./CartabaleNodePage.module.css";
import CartableNodePageIntro from "./CartableNodePageIntro";
import CartableNodePageTabs from "./CartabelNodePageTabs";
import CartbaleNodePageSameAs from "./CartableNodePageSameAs";
import CartablePageCartSection from "./CartablePageCartSection";
import {
  IProductImage,
  IProductSpec,
} from "@/Components/Admin/Product/AdminManageProductsPage";
import { ClientTabSystemItems } from "@/Components/UI/ClientTabSystem";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { CartModel } from "@/Components/Hooks/useCart";
import BreadCrump from "@/Components/UI/BreadCrump";
import { BreadCrumpTrail } from "@/Components/Store/BreadCrumpStore";
const CartableNodePage = <T,>({
  beforeTabs,
  badges,
  commentsCount,
  images,
  score,
  specs,
  totalScore,
  category,
  name,
  original,
  tabs,
  sameAs,
  sameAsIcon,
  sameAsTitle,
  cartTitle,
  itemId,
  model,
  cartTitleTail,
  discount,
  owner,
  price,
  trail,
  fastDelivery,
  freeDelivery,
  deliveryArea,
  rx,
}: {
  beforeTabs?: ReactNode;
  // under the name, e.g. the prescription badge
  badges?: ReactNode;
  images: IProductImage[];
  category?: { name?: string };
  name?: string;
  original?: string;
  score: number;
  totalScore: number;
  commentsCount: number;
  specs: IProductSpec[];
  tabs: ClientTabSystemItems;
  sameAsTitle: ContentKey;
  sameAs: ReactNode[];
  sameAsIcon: ReactNode;
  cartTitle: ContentKey;
  cartTitleTail?: ReactNode;
  owner?: ReactNode;
  discount?: number;
  price?: number;
  itemId: string;
  model: CartModel;
  trail?: BreadCrumpTrail;
  fastDelivery?: boolean;
  freeDelivery?: boolean;
  // where the seller ships it (2026-10)
  deliveryArea?: DeliveryArea;
  rx?: boolean;
}) => {
  return (
    <div className={classes.container}>
      {!!trail?.length && (
        <BreadCrump trail={trail} className={classes.crump} />
      )}
      <div className={classes.main}>
        <div className={classes.content}>
          <div className={classes.intro}>
            <CartableNodePageIntro
              images={images}
              commentsCount={commentsCount}
              score={score}
              specs={specs}
              totalScore={totalScore}
              category={category}
              name={name}
              original={original}
              badges={badges}
            />
            <div className={classes.mobileOnly}>
              <CartablePageCartSection
                service={model === "services" || model === "servicePackages"}
                cartTitle={cartTitle}
                itemId={itemId}
                model={model}
                cartTitleTail={cartTitleTail}
                discount={discount}
                owner={owner}
                price={price}
                fastDelivery={fastDelivery}
                freeDelivery={freeDelivery}
                deliveryArea={deliveryArea}
                rx={rx}
              />
            </div>
          </div>
          {beforeTabs}
          <CartableNodePageTabs tabs={tabs} />
          <CartbaleNodePageSameAs
            sameAs={sameAs}
            sameAsIcon={sameAsIcon}
            sameAsTitle={sameAsTitle}
          />
        </div>
        <div className={classes.side}>
          <CartablePageCartSection
            service={model === "services" || model === "servicePackages"}
            cartTitle={cartTitle}
            itemId={itemId}
            model={model}
            cartTitleTail={cartTitleTail}
            discount={discount}
            owner={owner}
            price={price}
            fastDelivery={fastDelivery}
            freeDelivery={freeDelivery}
            deliveryArea={deliveryArea}
            rx={rx}
          />
        </div>
      </div>
    </div>
  );
};

export default CartableNodePage;
