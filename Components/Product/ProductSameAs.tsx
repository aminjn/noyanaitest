import Image from "next/image";
import { IProduct } from "../Admin/Product/AdminManageProductsPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ShoppingCartIcon from "../Icons/ShoppingCartIcon";
import Ixon from "../UI/Ixon";
import classes from "./ProductSameAs.module.css";
import { FilePath } from "../config";
import Link from "@/Components/i18n/Link";
import { t2xsRegular, tlgMedium, txsDemiBold } from "../UI/Typography";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "products"];

const Item = ({
  node,
}: {
  node: IProduct<{ Category: Record<never, never> }>;
}) => {
  return (
    <div className={classes.item}>
      <div className={classes.image}>
        <HostedImage
          alt={node.name || ""}
          src={node.image}
          style={{ objectFit: "contain" }}
          fill
          sizes="4rem"
        />
      </div>
      <div className={classes.itemContent}>
        <Link href={`/product/${node.slug || node._id}`}>
          <span className={`${classes.itemName} ${txsDemiBold}`}>
            {node.name}
          </span>
        </Link>
        {!!node.category && (
          <span className={`${classes.category} ${t2xsRegular}`}>
            {node.category.name}
          </span>
        )}
      </div>
    </div>
  );
};

const ProductSameAs = ({
  data,
}: {
  data: IProduct<{ Category: Record<never, never> }>[];
}) => {
  const getContent = useScopedLocale(NS);

  console.log(data);

  if (!data.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <Ixon className={classes.icon} width="1rem">
          <ShoppingCartIcon />
        </Ixon>
        <span className={tlgMedium}>{getContent("othersAlsoBoughtThese")}</span>
      </div>
      <div className={classes.list}>
        {data.map((item) => (
          <Item key={item._id} node={item} />
        ))}
      </div>
    </div>
  );
};

export default ProductSameAs;
