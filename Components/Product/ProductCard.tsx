import { IProduct } from "../Admin/Product/AdminManageProductsPage";
import { IProductPackage } from "../Admin/ProductPackage/AdminManageProductPackagesPage";
import useLocale from "../Hooks/useLocale";
import CheckSquareIcon from "../Icons/CheckSquareIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import ServiceOrProductCard from "../Service/ServiceOrProductCard";
import Ixon from "../UI/Ixon";
import classes from "./ProductCard.module.css";
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
  const getContent = useLocale();

  return (
    <ServiceOrProductCard
      name={node.name || ""}
      commentCount={3}
      discount={
        node.model === "Product"
          ? node.sellers[0]?.discount || 0
          : node.discount
      }
      price={node.model === "Product" ? node.sellers[0]?.price : node.price}
      rating={4.5}
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
              title: `${node.sellers[0]?.seller.name}${node.sellers.length > 1 ? ` ${getContent("and")} ` : ""}${getContent("nMore", [(node.sellers.length - 1).toString()])}`,
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
          ? node.products.map((el) => el.name || "").join("، ")
          : undefined
      }
      target={`/${node.model === "Product" ? "product" : "productPackage"}/${node.slug || node._id}`}
    />
  );
};

export default ProductCard;
