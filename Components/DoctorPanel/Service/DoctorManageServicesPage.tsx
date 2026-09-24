"use client";
import useSWR from "swr";
import classes from "./DoctorManageServicesPage.module.css";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import {
  IServiceCategory,
  ServiceCategoryPopulation,
} from "@/Components/Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import DoctorMutateServicePopup from "./DoctorMutateServicePopup";
import Table from "@/Components/Admin/UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconLink from "@/Components/Admin/UI/IconLink";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteServicePopup from "./DeleteServicePopup";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelService"];

export type ServicePopulation = Population<{
  Owner: DoctorProfilePopulation;
  Category: ServiceCategoryPopulation;
}>;

export interface IService<
  T extends ServicePopulation = ServicePopulation,
> extends MongoDoc {
  order: number;
  isActive: boolean;
  name?: string;
  owner?: T["Owner"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Owner"]>
    : string;
  image?: string;
  price: number;
  discount: number;
  inventory: number;
  isHome: boolean;
  category?: T["Category"] extends ServiceCategoryPopulation
    ? IServiceCategory<T["Category"]>
    : string;
  special: boolean;
  slug?: string;
  description?: string;
  whyChoose?: string;
  stages?: string;
  results?: string;
  sameAs: string[];
  averageScore?: number;
  commentCount?: number;
}

const DoctorManageServicesPage = () => {
  const { data, error, mutate } = useSWR<
    IService<{ Category: ServiceCategoryPopulation }>[]
  >(`${API}/doctor/service`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("services"), target: "/doctorpanel/service" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={getContent("services")}
          actions={[
            {
              title: getContent("newItem"),
              action: () =>
                setPopup(
                  "DoctorMutateService",
                  <DoctorMutateServicePopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="DoctorManageServices"
            renderer={{
              name: {
                name: getContent("name"),
                value: (node) => node.name,
                filter: "Text",
              },
              category: {
                name: getContent("category"),
                value: (node) => node.category?.title || "",
                filter: "Multi",
              },
              price: {
                name: getContent("price"),
                value: (node) => node.price,
                filter: "Number",
                component: (node) => currencize(node.price),
              },
              discount: {
                name: getContent("discount"),
                value: (node) => node.discount,
                filter: "Number",
                component: (node) => currencize(node.discount),
              },
              inventory: {
                name: getContent("inventory"),
                value: (node) => node.inventory,
                filter: "Number",
              },
              order: {
                name: getContent("order"),
                value: (node) => node.order,
                filter: "Number",
              },
              isActive: {
                name: getContent("isActive"),
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconLink href={`/doctorpanel/service/${node._id}`}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DoctorDeleteService",
                          <DeleteServicePopup node={node} mutate={mutate} />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default DoctorManageServicesPage;
