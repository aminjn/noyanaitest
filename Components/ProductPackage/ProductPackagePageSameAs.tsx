import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import StarDotPlusIcon from "../Icons/StartDotPlusIcon";
import ProductCard from "../Product/ProductCard";
import Ixon from "../UI/Ixon";
import { ProductPackagePageProps } from "./ProductPackagePage";
import classes from "./ProductPackagePageSameAs.module.css";

const NS: ContentNamespace[] = ["common", "productPackagePage"];

const ProductPackagePageSameAs = ({ data }: ProductPackagePageProps) => {
  const getContent = useScopedLocale(NS);

  if (!data.sameAs.length) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <Ixon width="1rem" className={classes.icon}>
          <StarDotPlusIcon />
        </Ixon>
        <span>{getContent("similarPackages")}</span>
      </div>
      <div className={classes.list}>
        
      </div>
    </div>
  );
};

export default ProductPackagePageSameAs;
