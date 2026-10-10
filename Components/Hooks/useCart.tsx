import useSWR, { mutate as globalMutate } from "swr";
import useSWRMutation from "swr/mutation";
import { API } from "../config";
import useUser, { IUser, MongoDoc, UserPopulation } from "./useUser";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import {
  IProductSeller,
  ProductSellerPopulation,
} from "../Admin/Product/AdminManageProductsPage";
import { useCallback, useRef, useState } from "react";
import { fetcher } from "../helpers/fetcher";
import useNotification from "./useNotification";
import usePopup from "./usePopup";
import AuthPopup from "../Popups/AuthPopup";
import useLocale from "./useLocale";
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
  const { user, isUserLoading } = useUser();
  const pushNotification = useNotification();
  const { setPopup } = usePopup();
  const getContent = useLocale();
  // a visitor who taps "add" is asked to log in, never left with a tap that
  // does nothing (the request would only be refused)
  const askLogin = useCallback(() => setPopup("Auth", <AuthPopup />), [setPopup]);
  const showError = useCallback(
    (err: unknown) => {
      const message = (err as { message?: unknown } | undefined)?.message;
      pushNotification(
        typeof message === "string" && message ? message : getContent("unexpectedErrorOccured"),
        "Error",
      );
    },
    [pushNotification, getContent],
  );

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
      onSuccess: (res) => {
        mutate();
        globalMutate(`${API}/cart/size`);
        // added, but the pharmacy doesn't ship it to the buyer's newest
        // address (2026-10, the server's translated hint)
        const hint = (res as { data?: { delivery?: { message?: unknown } | null } } | undefined)?.data
          ?.delivery?.message;
        if (typeof hint === "string" && hint) pushNotification(hint, "Warn");
      },
      onError: showError,
      throwOnError: false,
    },
  );

  // a second tap before the first answer (slow network) is ignored at once:
  // `isMutating` only flips on the next render
  const busy = useRef(false);
  const [syncing, setSyncing] = useState(false);
  const mutateCartItem = useCallback(
    (payload: MutateCartItemPayload) => {
      if (isMutating || busy.current) return;
      if (!user) {
        if (!isUserLoading) askLogin();
        return;
      }
      busy.current = true;
      setSyncing(true);
      // busy until the cart is read again: on a slow line the button would
      // otherwise read "add" again between the answer and the new cart
      Promise.resolve(_mutateCartItem(payload))
        .then(() => mutate())
        .finally(() => {
          busy.current = false;
          setSyncing(false);
        });
    },
    [_mutateCartItem, isMutating, user, isUserLoading, askLogin],
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
      onError: showError,
      throwOnError: false,
    },
  );

  const removing = useRef(false);
  const removeCartItem = useCallback(
    (payload: RemoveCartItemPayload) => {
      if (isRemoving || removing.current) return;
      removing.current = true;
      setSyncing(true);
      Promise.resolve(_removeCartItem(payload))
        .then(() => mutate())
        .finally(() => {
          removing.current = false;
          setSyncing(false);
        });
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
      onError: showError,
      throwOnError: false,
    },
  );

  const getItemQty = useCallback(
    ({ itemId, model }: { itemId: string; model: CartModel }) =>
      (Array.isArray(cart?.[model]) ? cart![model] : []).find((el) => el?.item?._id === itemId)?.qty || 0,
    [cart],
  );

  return {
    cart,
    isCartLoading: isLoading,
    isMutating: isMutating || syncing,
    isRemoving: isRemoving || syncing,
    isClearing,
    isLoading: isLoading || isMutating || isRemoving || isClearing || syncing,
    mutateCartItem,
    removeCartItem,
    clearCart,
    getItemQty,
    // re-read the cart (e.g. after removing several lines in one go)
    refreshCart: mutate,
  };
};

export default useCart;
