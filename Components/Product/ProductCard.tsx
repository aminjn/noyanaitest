import { IProduct } from "../Admin/Product/AdminManageProductsPage";
import { IProductPackage } from "../Admin/ProductPackage/AdminManageProductPackagesPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import CheckSquareIcon from "../Icons/CheckSquareIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import ServiceOrProductCard from "../Service/ServiceOrProductCard";
import Ixon from "../UI/Ixon";
import classes from "./ProductCard.module.css";

const NS: ContentNamespace[] = ["common", "productServiceCard"];
const ProductCard = ({
  node,
}: {
  node:
    | (IProduct<{
        Sellers: { Seller: Record<never, never> };
        Category: Record<never, never>;
      }> & {
        model: "Product";
      })
    | (IProductPackage<{
        Owner: Record<never, never>;
        Products: Record<never, never>;
        Category: Record<never, never>;
      }> & { model: "ProductPackage" });
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <ServiceOrProductCard
      name={node.name || ""}
      commentCount={node.commentCount}
      discount={
        node.model === "Product"
          ? node.sellers?.[0]?.discount || 0
          : node.discount || 0
      }
      price={
        node.model === "Product" ? node.sellers?.[0]?.price || 0 : node.price || 0
      }
      rating={node.averageScore}
      category={node.category?.name}
      detail={{
        icon: (
          <Ixon className={classes.checkIcon} width=".75rem">
            <CheckSquareIcon />
          </Ixon>
        ),
        title: getContent("availableInStock"),
      }}
      image={node.image}
      owner={
        node.model === "Product"
          ? {
              icon: (
                <Ixon width="1.125rem">
                  <UserCircleIcon />
                </Ixon>
              ),
              // "Pharmacy X and 2 more"; a single seller shows just its name
              title: [
                node.sellers?.[0]?.seller?.name,
                (node.sellers?.length || 0) > 1
                  ? getContent("nMore", [(node.sellers.length - 1).toString()])
                  : "",
              ]
                .filter(Boolean)
                .join(` ${getContent("and")} `),
            }
          : {
              icon: (
                <Ixon width="1.125rem">
                  <UserCircleIcon />
                </Ixon>
              ),
              title: node.owner.name || "",
            }
      }
      pack={node.model === "ProductPackage" ? node.products.length : undefined}
      packageInfo={
        node.model === "ProductPackage"
          ? node.products.map((el) => el.name || "").join(getContent("listSeparator"))
          : undefined
      }
      target={`/${node.model === "Product" ? "product" : "productPackage"}/${node.slug || node._id}`}
    />
  );
};

export default ProductCard;
