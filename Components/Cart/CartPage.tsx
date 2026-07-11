"use client";

import classes from "./CartPage.module.css";
import useCart from "../Hooks/useCart";
import useUser from "../Hooks/useUser";
import useLocale from "../Hooks/useLocale";
import HandleLoading from "../Admin/UI/HandleLoading";

const CartPage = () => {
  const { user } = useUser();
  const { cart } = useCart();

  const getContent = useLocale();

  if (!user)
    return (
      <div className={classes.noUser}>{getContent("loginToGainAccess")}</div>
    );

  return (
    <HandleLoading data={!!cart}>
      <div className={classes.sections}>
        <div className={classes.sesction}>
          <legend className={classes.title}>{getContent("products")}</legend>
        </div>
      </div>
    </HandleLoading>
  );
};

export default CartPage;
