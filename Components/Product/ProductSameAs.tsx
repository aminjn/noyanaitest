import Image from "next/image";
import { IProduct } from "../Admin/Product/AdminManageProductsPage";
import useLocale from "../Hooks/useLocale";
import ShoppingCartIcon from "../Icons/ShoppingCartIcon";
import Ixon from "../UI/Ixon";
import classes from "./ProductSameAs.module.css";
import { FilePath } from "../config";
import Link from "next/link";

const Item = ({
  node,
}: {
  node: IProduct<{ Category: Record<never, never> }>;
}) => {
  return (
    <div className={classes.item}>
      <div className={classes.image}>
        <Image
          alt={node.name || ""}
          src={`${FilePath}/${node.image}`}
          style={{ objectFit: "contain" }}
          fill
          sizes="4rem"
        />
      </div>
      <div className={classes.itemContent}>
        <Link href={`/product/${node.slug || node._id}`}>
          <span className={classes.itemName}>{node.name}</span>
        </Link>
        {!!node.category && (
          <span className={classes.category}>{node.category.name}</span>
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
  const getContent = useLocale();

  if (!data.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <Ixon className={classes.icon} width="1rem">
          <ShoppingCartIcon />
        </Ixon>
        <span>{getContent("othersAlsoBoughtThese")}</span>
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
