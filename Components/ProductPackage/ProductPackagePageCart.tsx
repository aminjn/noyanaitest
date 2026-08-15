import { Fragment } from "react";
import { ProductPackagePageProps } from "./ProductPackagePage";
import classes from "./ProductPackagePageCart.module.css";
import PlusBox from "../Product/PlusBox";
import useLocale from "../Hooks/useLocale";
import Image from "next/image";
import { FilePath } from "../config";
import Ixon from "../UI/Ixon";
import VerifyIcon from "../Icons/VerifyIcon";
import { currencize } from "../helpers/currencize";
import ProductCartInfos from "../Product/ProductCartInfos";
import CartActions from "../Product/CartActions";
import {
  t2xsRegular,
  tbaseRegular,
  tlgBold,
  tsmRegular,
} from "../UI/Typography";

const ProductPackagePageCart = ({ data }: ProductPackagePageProps) => {
  const getContent = useLocale();
  return (
    <Fragment>
      <div className={classes.main}>
        <span className={classes.title}>{getContent("provider")}</span>
        <div className={classes.owner}>
          <div className={classes.image}>
            <Image
              alt={data.owner.name || ""}
              src={`${FilePath}/${data.owner.avatar}`}
              sizes="2rem"
              style={{ objectFit: "cover" }}
              fill
            />
          </div>
          <div className={`${classes.nameBox} ${tbaseRegular}`}>
            <span>{data.owner.name}</span>
            <Ixon className={classes.ownerIcon} width="1.5rem">
              <VerifyIcon />
            </Ixon>
          </div>
        </div>
        <div className={classes.prices}>
          {!!data.discount && (
            <div className={classes.discount}>
              <s className={`${classes.strike} ${tsmRegular}`}>
                {getContent("xToman", [currencize(data.price || 0)])}
              </s>
              <span className={`${classes.percent} ${t2xsRegular}`}>
                {getContent("percentSymbol", [
                  Math.ceil(data.discount / (data.price || 1)).toString(),
                ])}
              </span>
            </div>
          )}
          <div className={`${classes.price} ${tlgBold}`}>
            {getContent("xToman", [
              currencize((data.price || 0) - (data.discount || 0)),
            ])}
          </div>
          <div className={`${classes.saved} ${t2xsRegular}`}>
            {getContent("youSavedxToman", [currencize(data.discount || 0)])}
          </div>
        </div>
        <CartActions itemId={data._id} model="productPackages" />
        <ProductCartInfos />
      </div>
      <PlusBox value={data.discount || 0} />
    </Fragment>
  );
};

export default ProductPackagePageCart;
