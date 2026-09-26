"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  DoctorProfilePopulation,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { currencize } from "@/Components/helpers/currencize";
import {
  IServiceCategory,
  ServiceCategoryPopulation,
} from "../ServiceCategory/AdminManageServiceCategoriesPage";
import {
  IProductImage,
  IProductSpec,
  ProductImagePopulation,
  ProductSpecPopulation,
} from "../Product/AdminManageProductsPage";
import IconLink from "../UI/IconLink";
import OrderEditor from "../UI/OrderEditor";

export type ServicePopulation = Population<{
  Owner: DoctorProfilePopulation;
  Category: ServiceCategoryPopulation;
  Specs: ProductSpecPopulation;
  Images: ProductImagePopulation;
  SameAs: ServicePopulation;
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
  specs: T["Specs"] extends ProductSpecPopulation
    ? IProductSpec<T["Specs"]>[]
    : never;
  images: T["Images"] extends ProductImagePopulation
    ? IProductImage<T["Images"]>[]
    : never;
  sameAs: T["SameAs"] extends ServicePopulation
    ? IService<T["SameAs"]>[]
    : string[];
  description?: string;
  whyChoose?: string;
  stages?: string;
  results?: string;
  averageScore: number;
  commentCount: number;
}

export const mutateServiceFormRenderer: FormRenderer<IService> = {
  name: { title: "نام", type: "text" },
  order: { title: "رتبه", type: "number" },
  isActive: { title: "فعال", type: "bool" },
  owner: {
    title: "صاحب",
    type: "nodes",
    path: `${API}/auto/doctorProfile`,
    getOptionLabel: (node) => getDoctorProfileLabel(node as IDoctorProfile),
    getOptionValue: (node) => (node as IDoctorProfile)._id,
  },
  price: { title: "قیمت", type: "number" },
  discount: { title: "تخفیف", type: "number" },
  image: { title: "تصویر", type: "image" },
  inventory: { title: "موجودی", type: "number" },
  isHome: { title: "نمایش در خانه", type: "bool" },
  category: {
    title: "دسته بندی",
    type: "nodes",
    path: `${API}/auto/serviceCategory`,
    getOptionLabel: (node) =>
      (node as IServiceCategory).title || (node as IServiceCategory)._id,
    getOptionValue: (node) => (node as IServiceCategory)._id,
    getDefaultValue: (node) => node.category,
  },
  special: { type: "bool", title: "ویژه" },
  slug: { type: "text", title: "اسلاگ" },
  sameAs: {
    type: "nodes",
    title: "مشابهات",
    path: `${API}/auto/service`,
    getOptionLabel: (node) => (node as IService).name || (node as IService)._id,
    getOptionValue: (node) => (node as IService)._id,
    getDefaultValue: (inp) => inp.sameAs,
    multi: true,
  },
  description: { type: "rtf", title: "توضیحات" },
  whyChoose: { type: "text", title: "چرا این" },
  stages: { type: "rtf", title: "مراحل ا نجام" },
  results: { type: "rtf", title: "نتایج" },
};

const MutateServicePopup = ({
  mutate,
  node,
}: {
  node?: IService<{ Category: Record<never, never> }>;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/service${!!node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={mutateServiceFormRenderer}
      />
    </PopupCard>
  );
};

const DeleteServicePopup = ({
  mutate,
  node,
}: {
  node: IService;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        message="آیا از حذف این آیتم مطمئنید؟"
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/service/${node._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

const AdminManageServicesPage = () => {
  const { data, error, mutate } = useSWR<
    IService<{ Owner: Record<never, never>; Category: Record<never, never> }>[]
  >(`${API}/auto/service`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="خدمات"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateService",
                  <MutateServicePopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageService"
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              category: {
                name: "دسته‌بندی",
                value: (node) =>
                  node.category ? node.category.title || node.category._id : "ندارد",
                filter: "Multi",
                component: (node) =>
                  node.category ? (
                    <InlineLink
                      href={adminPath(`/serviceCategory/${node.category._id}`)}
                    >
                      {node.category.title || node.category._id}
                    </InlineLink>
                  ) : (
                    "ندارد"
                  ),
              },
              owner: {
                name: "ارائه‌دهنده",
                value: (node) =>
                  !!node.owner ? getDoctorProfileLabel(node.owner) : "ندارد",
                filter: "Multi",
                component: (node) =>
                  !!node.owner ? (
                    <InlineLink
                      href={adminPath(`/doctorprofile/${node.owner._id}`)}
                    >
                      {getDoctorProfileLabel(node.owner)}
                    </InlineLink>
                  ) : (
                    "ندارد"
                  ),
              },
              price: {
                name: "قیمت (ریال)",
                value: (node) => node.price,
                filter: "Number",
                component: (node) =>
                  typeof node.price === "number" ? currencize(node.price) : "—",
              },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              isHome: {
                name: "نمایش در خانه",
                value: (node) => booleanToValue[`${node.isHome}`],
                component: (node) => <BooleanToIcon value={node.isHome} />,
                filter: "Set",
              },
              order: {
                name: "ترتیب",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    _id={node._id}
                    value={node.order}
                    mutate={mutate}
                    modelName="service"
                  />
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/service/${node._id}`)}
                      title="ویرایش"
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title="حذف"
                      onClick={() =>
                        setPopup(
                          "DeleteService",
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

export default AdminManageServicesPage;
