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
import { ta } from "@/Components/Admin/i18n/adminText";

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
  name: { get title() {
  return ta("نام");
}, type: "text" },
  order: { get title() {
  return ta("رتبه");
}, type: "number" },
  isActive: { get title() {
  return ta("فعال");
}, type: "bool" },
  owner: {
    get title() {
  return ta("صاحب");
},
    type: "nodes",
    path: `${API}/auto/doctorProfile`,
    getOptionLabel: (node) => getDoctorProfileLabel(node as IDoctorProfile),
    getOptionValue: (node) => (node as IDoctorProfile)._id,
    // populated in lists, a bare id elsewhere
    getDefaultValue: (node) => {
      const owner = node.owner as unknown;
      return typeof owner === "string"
        ? owner
        : (owner as { _id?: string } | undefined)?._id;
    },
  },
  price: { get title() {
  return ta("قیمت");
}, type: "number", price: true },
  discount: { get title() {
  return ta("تخفیف");
}, type: "number", price: true },
  image: { get title() {
  return ta("تصویر");
}, type: "image" },
  isHome: { get title() {
  return ta("نمایش در خانه");
}, type: "bool" },
  category: {
    get title() {
  return ta("دسته بندی");
},
    type: "nodes",
    path: `${API}/auto/serviceCategory`,
    creatable: { path: `${API}/auto/serviceCategory`, field: "title" },
    getOptionLabel: (node) =>
      (node as IServiceCategory).title || ta("بدون نام"),
    getOptionValue: (node) => (node as IServiceCategory)._id,
    getDefaultValue: (node) => node.category,
  },
  special: { type: "bool", get title() {
  return ta("ویژه");
} },
  slug: { type: "text", get title() {
  return ta("اسلاگ");
} },
  sameAs: {
    type: "nodes",
    get title() {
  return ta("مشابهات");
},
    path: `${API}/auto/service`,
    getOptionLabel: (node) => (node as IService).name || ta("بدون نام"),
    getOptionValue: (node) => (node as IService)._id,
    getDefaultValue: (inp) => inp.sameAs,
    multi: true,
  },
  description: { type: "rtf", get title() {
  return ta("توضیحات");
} },
  whyChoose: { type: "text", get title() {
  return ta("چرا این");
} },
  stages: { type: "rtf", get title() {
  return ta("مراحل ا نجام");
} },
  results: { type: "rtf", get title() {
  return ta("نتایج");
} },
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
    <PopupCard title={node ? ta("ویرایش خدمت") : ta("خدمت جدید")}>
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
        message={ta("آیا از حذف این آیتم مطمئنید؟")}
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
          title={ta("خدمات")}
          actions={[
            {
              title: ta("جدید"),
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
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              category: {
                name: ta("دسته‌بندی"),
                value: (node) =>
                  node.category ? node.category.title || ta("بدون نام") : ta("ندارد"),
                filter: "Multi",
                component: (node) =>
                  node.category ? (
                    <InlineLink
                      href={adminPath("/service?tab=categories")}
                    >
                      {node.category.title || ta("بدون نام")}
                    </InlineLink>
                  ) : (
                    ta("ندارد")
                  ),
              },
              owner: {
                name: ta("ارائه‌دهنده"),
                value: (node) =>
                  !!node.owner ? getDoctorProfileLabel(node.owner) : ta("ندارد"),
                filter: "Multi",
                component: (node) =>
                  !!node.owner ? (
                    <InlineLink
                      href={adminPath(`/doctorprofile/${node.owner._id}`)}
                    >
                      {getDoctorProfileLabel(node.owner)}
                    </InlineLink>
                  ) : (
                    ta("ندارد")
                  ),
              },
              price: {
                name: ta("قیمت (تومان)"),
                value: (node) => node.price,
                filter: "Number",
                component: (node) =>
                  typeof node.price === "number" ? currencize(node.price) : "—",
              },
              isActive: {
                name: ta("فعال"),
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              isHome: {
                name: ta("نمایش در خانه"),
                value: (node) => booleanToValue[`${node.isHome}`],
                component: (node) => <BooleanToIcon value={node.isHome} />,
                filter: "Set",
              },
              order: {
                name: ta("ترتیب"),
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
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/service/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
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
