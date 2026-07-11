import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { API } from "../config";
import useUser, { IUser, MongoDoc, UserPopulation } from "./useUser";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import {
  IProductSeller,
  ProductSellerPopulation,
} from "../Admin/Product/AdminManageProductsPage";
import { useCallback, useState } from "react";
import { fetcher } from "../helpers/fetcher";

export type CartPopulation = Population<{
  Owner: UserPopulation;
  Products: ProductSellerPopulation;
}>;

export interface ICart<
  T extends CartPopulation = CartPopulation,
> extends MongoDoc {
  owner: T["Owner"] extends UserPopulation ? IUser<T["Owner"]> : string;
  products: {
    item: T["Products"] extends ProductSellerPopulation
      ? IProductSeller<T["Products"]>
      : string;
    qty: number;
  }[];
}

export const cartModels = ["products"] as const;

export type CartModel = (typeof cartModels)[number];

type MutateCartItemPayload = {
  item: string;
  model: CartModel;
  amount?: number;
};

type RemoveCartItemPayload = { item: string; model: CartModel };

const useCart = () => {
  const { user } = useUser();

  const {
    data: cart,
    isLoading,
    mutate,
  } = useSWR<
    ICart<{
      Products: { Seller: Record<never, never>; Product: Record<never, never> };
    }>
  >(user ? `${API}/cart` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const { trigger: _mutateCartItem, isMutating } = useSWRMutation<
    unknown,
    unknown,
    string,
    MutateCartItemPayload
  >(
    `${API}/cart/item`,
    (url, args) => fetcher({ url, payload: args.arg, method: "POST" }),
    {
      onSuccess: () => {
        mutate();
      },
    },
  );

  const mutateCartItem = useCallback(
    (payload: MutateCartItemPayload) => {
      if (isMutating) return;
      _mutateCartItem(payload);
    },
    [_mutateCartItem, isMutating],
  );

  const { trigger: _removeCartItem, isMutating: isRemoving } = useSWRMutation<
    unknown,
    unknown,
    string,
    RemoveCartItemPayload
  >(
    `${API}/cart/item`,
    (url, args) => fetcher({ url, payload: args.arg, method: "PUT" }),
    {
      onSuccess: () => {
        mutate();
      },
    },
  );

  const removeCartItem = useCallback(
    (payload: RemoveCartItemPayload) => {
      if (isRemoving) return;
      _removeCartItem(payload);
    },
    [_removeCartItem, isRemoving],
  );

  const { trigger: clearCart, isMutating: isClearing } = useSWRMutation(
    `${API}/cart`,
    (url) => fetcher({ url, method: "PUT" }),
    { onSuccess: () => mutate() },
  );

  const getItemQty = useCallback(
    ({ itemId, model }: { itemId: string; model: CartModel }) =>
      cart?.[model].find((el) => el.item._id === itemId)?.qty || 0,
    [cart],
  );

  console.log(cart);

  return {
    cart,
    isCartLoading: isLoading,
    isMutating,
    isRemoving,
    isClearing,
    isLoading: isLoading || isMutating || isRemoving || isClearing,
    mutateCartItem,
    removeCartItem,
    clearCart,
    getItemQty,
  };
};

export default useCart;
