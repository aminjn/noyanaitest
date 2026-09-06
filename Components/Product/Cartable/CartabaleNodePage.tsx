import { ReactNode } from "react";
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
  commentsCount,
  images,
  qnaCount,
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
}: {
  beforeTabs?: ReactNode;
  images: IProductImage[];
  category?: { name?: string };
  name?: string;
  original?: string;
  score: number;
  totalScore: number;
  commentsCount: number;
  qnaCount: number;
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
}) => {
  return (
    <div className={classes.container}>
      {!!trail?.length && (
        <BreadCrump trail={trail} className={classes.crump} />
      )}
      <div className={classes.main}>
        <div className={classes.content}>
          <CartableNodePageIntro
            images={images}
            commentsCount={commentsCount}
            qnaCount={qnaCount}
            score={score}
            specs={specs}
            totalScore={totalScore}
            category={category}
            name={name}
            original={original}
          />
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
          />
        </div>
      </div>
    </div>
  );
};

export default CartableNodePage;
