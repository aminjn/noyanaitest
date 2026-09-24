import { useMemo } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ProductTab, WhyBox } from "../Product/ProductTabs";
import ClientTabSystem from "../UI/ClientTabSystem";
import RenderRtf from "../UI/RenderRtf";
import { ProductPackagePageProps } from "./ProductPackagePage";
import classes from "./ProductPackagePageTabs.module.css";
import Ixon from "../UI/Ixon";
import PackageIcon from "../Icons/PackageIcon";
import { currencize } from "../helpers/currencize";
import Badge from "../UI/Badge";
import {
  t2xsDemiBold,
  t2xsMedium,
  t2xsRegular,
  tbaseDemiBold,
  tmdBold,
  tsmBold,
  tsmRegular,
  txsDemiBold,
} from "../UI/Typography";
import CommentSection from "../Comment/CommentSection";

const NS: ContentNamespace[] = ["common", "productPackagePage"];

export const DiffCalc = ({
  items,
  price,
}: {
  items: { price?: number; name?: string; _id: string }[];
  price?: number;
}) => {
  const seperatePrice = useMemo<number>(
    () => items.reduce((acc, el) => acc + (el.price || 0), 0),
    [items],
  );

  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.box}>
      <div className={`${classes.header} ${tbaseDemiBold}`}>
        <Ixon width="1rem">
          <PackageIcon />
        </Ixon>
        <span>{`${getContent("thisPackageContains")} (${getContent("nItems", [items.length.toString()])}):`}</span>
      </div>
      <div className={classes.list}>
        {items.map((product, i) => (
          <div className={classes.item} key={product._id}>
            <span className={`${classes.index} ${t2xsDemiBold}`}>{i + 1}</span>
            <div className={classes.itemContent}>
              <span className={`${classes.itemName} ${txsDemiBold}`}>
                {product.name}
              </span>
              <span
                className={`${classes.itemDescription} ${t2xsRegular}`}
              >{`${getContent("seperatePrice")}: ${getContent("xToman", [currencize(product.price || 0)])}`}</span>
            </div>
            <Badge size="L" color="Primarylight" mode="Fill" radius="High">
              {getContent("product")}
            </Badge>
          </div>
        ))}
      </div>
      <div className={classes.footer}>
        <div className={classes.result}>
          <span className={`${classes.blackTitle} ${tsmBold}`}>
            {getContent("totalSeperatePrice")}
          </span>
          <s className={`${classes.strike} ${tsmRegular}`}>
            {getContent("xToman", [currencize(seperatePrice)])}
          </s>
        </div>
        <div className={classes.result}>
          <span className={`${classes.red} ${tsmBold}`}>
            {getContent("packagePriceWithXDiscount", [
              Math.ceil(((price || 0) / seperatePrice) * 100).toString(),
            ])}
          </span>
          <span className={`${classes.red} ${tmdBold}`}>
            {getContent("xToman", [currencize(price || 0)])}
          </span>
        </div>
        <div className={`${classes.saved} ${t2xsMedium}`}>
          {getContent("youSaveNToman", [
            currencize(seperatePrice - (price || 0)),
          ])}
        </div>
      </div>
    </div>
  );
};

const ProductPackagePageTabs = ({ data }: ProductPackagePageProps) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.main}>
      <ClientTabSystem
        items={[
          {
            id: "Description",
            title: getContent("aboutPackage"),
            content: (
              <ProductTab title={getContent("packageIntroduction")}>
                <p className={`${classes.summary} ${tsmRegular}`}>
                  {data.summary}
                </p>
                <DiffCalc items={data.products} price={data.price} />
                <RenderRtf value={data.description} />
                <WhyBox content={data.whyChoose} />
              </ProductTab>
            ),
          },
          {
            id: "Comments",
            content: (
              <div className={classes.comments}>
                <CommentSection model="ProductPackage" nodeId={data._id} />
              </div>
            ),
            title: getContent("comments"),
          },
        ]}
      />
    </div>
  );
};

export default ProductPackagePageTabs;
