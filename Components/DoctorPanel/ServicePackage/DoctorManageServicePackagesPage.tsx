"use client";
import useSWR from "swr";
import classes from "./DoctorManageServicePackagesPage.module.css";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import {
  IService,
  ServicePopulation,
} from "../Service/DoctorManageServicesPage";
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
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import usePopup from "@/Components/Hooks/usePopup";
import DoctorMutateServicePackagePopup from "./DoctorMutateServicePackagePopup";
import Table from "@/Components/Admin/UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconLink from "@/Components/Admin/UI/IconLink";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteServicePackagePopup from "./DeleteServicePackagePopup";

export type ServicePackagePopulation = Population<{
  Owner: DoctorProfilePopulation;
  Services: ServicePopulation;
  Category: ServiceCategoryPopulation;
  SameAs: ServicePackagePopulation;
}>;

export interface IServicePackage<
  T extends ServicePackagePopulation = ServicePackagePopulation,
> extends MongoDoc {
  name?: string;
  owner: T["Owner"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Owner"]>
    : string;
  services: T["Services"] extends ServicePopulation
    ? IService<T["Services"]>[]
    : string[];
  price: number;
  discount: number;
  category?: T["Category"] extends ServiceCategoryPopulation
    ? IServiceCategory<T["Category"]>
    : string;
  isActive: boolean;
  order: number;
  image?: string;
  slug?: string;
  sameAs: T["SameAs"] extends ServicePackagePopulation
    ? IServicePackage<T["SameAs"]>[]
    : string[];
  summary?: string;
  description?: string;
  whyChoose?: string;
  stages?: string;
  results?: string;
  averageScore?: number;
  commentCount?: number;
}

const DoctorManageServicePackagesPage = () => {
  const { data, error, mutate } = useSWR<
    IServicePackage<{
      Category: ServiceCategoryPopulation;
      Services: Record<never, never>;
    }>[]
  >(`${API}/doctor/servicepackage`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    {
      title: getContent("servicePackages"),
      target: "/doctorpanel/servicepackage",
    },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={getContent("servicePackages")}
          actions={[
            {
              title: getContent("newItem"),
              action: () =>
                setPopup(
                  "DoctorMutateServicePackage",
                  <DoctorMutateServicePackagePopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="DoctorManageServicePackages"
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
              services: {
                name: getContent("services"),
                value: (node) => node.services.length,
                filter: "Number",
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
                    <IconLink href={`/doctorpanel/servicepackage/${node._id}`}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DoctorDeleteServicePackage",
                          <DeleteServicePackagePopup
                            node={node}
                            mutate={mutate}
                          />
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

export default DoctorManageServicePackagesPage;
