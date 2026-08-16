import useSWR, { mutate as globalMutate } from "swr";
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
import {
  IProductPackage,
  ProductPackagePopulation,
} from "../Admin/ProductPackage/AdminManageProductPackagesPage";
import {
  IService,
  ServicePopulation,
} from "../Admin/Service/AdminManageServicesPage";
import {
  IServicePackage,
  ServicePackagePopulation,
} from "../Admin/ServicePackage/AdminManageServicePackagesPage";
import {
  IParaClinicTest,
  ParaClinicTestPopulation,
} from "../Admin/ParaClinic/AdminManageParaClinicPage";

export type CartPopulation = Population<{
  Owner: UserPopulation;
  Products: ProductSellerPopulation;
  ProductPackages: ProductPackagePopulation;
  Services: ServicePopulation;
  ServicePackages: ServicePackagePopulation;
  Tests: ParaClinicTestPopulation;
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
  productPackages: {
    item: T["ProductPackages"] extends ProductPackagePopulation
      ? IProductPackage<T["ProductPackages"]>
      : string;
    qty: number;
  }[];
  services: {
    item: T["Services"] extends ServicePopulation
      ? IService<T["Services"]>
      : string;
    qty: number;
  }[];
  servicePackages: {
    item: T["ServicePackages"] extends ServicePackagePopulation
      ? IServicePackage<T["ServicePackages"]>
      : string;
    qty: number;
  }[];
  tests: {
    item: T["Tests"] extends ParaClinicTestPopulation
      ? IParaClinicTest<T["Tests"]>
      : string;
    qty: number;
  }[];
}

export const cartModels = [
  "products",
  "productPackages",
  "services",
  "servicePackages",
  "tests",
] as const;

export type CartModel = (typeof cartModels)[number];

type MutateCartItemPayload = {
  item: string;
  model: CartModel;
  amount?: number;
};

type RemoveCartItemPayload = { item: string; model: CartModel };

export type UseCartNode = ICart<{
  Products: { Seller: Record<never, never>; Product: Record<never, never> };
  ProductPackages: Record<never, never>;
  Services: Record<never, never>;
  ServicePackages: Record<never, never>;
  Tests: { Test: Record<never, never>; ParaClinic: Record<never, never> };
}>;

const useCart = () => {
  const { user } = useUser();

  const {
    data: cart,
    isLoading,
    mutate,
  } = useSWR<UseCartNode>(user ? `${API}/cart` : null, (url: string) =>
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
        globalMutate(`${API}/cart/size`);
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
        globalMutate(`${API}/cart/size`);
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
    {
      onSuccess: () => {
        mutate();
        globalMutate(`${API}/cart/size`);
      },
    },
  );

  const getItemQty = useCallback(
    ({ itemId, model }: { itemId: string; model: CartModel }) =>
      cart?.[model].find((el) => el.item._id === itemId)?.qty || 0,
    [cart],
  );

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
