"use client";

import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import usePharmacy from "@/Components/Hooks/usePharmacy";
import useForm from "@/Components/Hooks/useForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useListSeparator } from "@/Components/i18n/navigation";
import {
  addressCityLabel,
  IAddressCity,
} from "@/Components/Dashboard/Address/DashboardManageAddressesPage";

const NS: ContentNamespace[] = ["common", "pharmacyPanelProfile"];

type DeliveryInput = {
  shippingScope?: "city" | "selected" | "nationwide";
  shipCities?: string[];
  shipProvinces?: string[];
};

const ids = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [])
    .map((el) => (el && typeof el === "object" ? (el as { _id?: unknown })._id : el))
    .filter((el): el is string => typeof el === "string" && !!el);

// /public/province and /public/search/city answer with the list in `data`
const listOf = (res: unknown) => {
  const body = (res as { data?: unknown })?.data;
  const list = Array.isArray(body) ? body : (body as { data?: unknown } | undefined)?.data;
  return Array.isArray(list) ? list : [];
};

// Where the pharmacy ships cart orders (2026-10, backend Lib/delivery.ts):
// its own city, its city plus chosen cities / provinces, or nationwide (the
// default, how every pharmacy shipped before). The province and city lists
// are the site's own divisions; they show only for the "chosen" option.
const PharmacyManageDeliveryTab = () => {
  const { pharmacy, mutate } = usePharmacy();
  const getContent = useScopedLocale(NS);
  const listSep = useListSeparator();
  const form = useForm<DeliveryInput>({
    path: `${API}/pharmacy/profile`,
    method: "POST",
    successCb: () => {
      mutate();
    },
  });
  const saved = (pharmacy || {}) as DeliveryInput & Record<string, unknown>;
  const scope = form.input.shippingScope || saved.shippingScope || "nationwide";
  const defaultValue: DeliveryInput = {
    shippingScope: saved.shippingScope || "nationwide",
    shipCities: ids(saved.shipCities),
    shipProvinces: ids(saved.shipProvinces),
  };

  return (
    <HandleLoading data={!!pharmacy}>
      {!!pharmacy && (
        <CreateForm<DeliveryInput>
          style={{ width: "100%" }}
          layout="flat"
          defaultValue={defaultValue}
          hookProvided={form}
          renderer={{
            shippingScope: {
              type: "select",
              title: getContent("shippingScope"),
              options: {
                nationwide: getContent("shippingScopeNationwide"),
                selected: getContent("shippingScopeSelected"),
                city: getContent("shippingScopeCity"),
              },
              hint: getContent("shippingScopeHint"),
            },
            ...(scope === "selected"
              ? {
                  shipProvinces: {
                    type: "nodes" as const,
                    title: getContent("shipProvinces"),
                    path: `${API}/public/province`,
                    getOptionLabel: (node: unknown) =>
                      (node as { name?: string; _id: string }).name || (node as { _id: string })._id,
                    getOptionValue: (node: unknown) => (node as { _id: string })._id,
                    getDefaultValue: (inp: DeliveryInput) => inp.shipProvinces,
                    multi: true,
                    dataParser: listOf,
                  },
                  shipCities: {
                    type: "nodes" as const,
                    title: getContent("shipCities"),
                    path: `${API}/public/search/city`,
                    getOptionLabel: (node: unknown) =>
                      addressCityLabel(node as IAddressCity, listSep) || (node as IAddressCity)._id,
                    getOptionValue: (node: unknown) => (node as IAddressCity)._id,
                    getDefaultValue: (inp: DeliveryInput) => inp.shipCities,
                    multi: true,
                    dataParser: listOf,
                  },
                }
              : {}),
          }}
        />
      )}
    </HandleLoading>
  );
};

export default PharmacyManageDeliveryTab;
