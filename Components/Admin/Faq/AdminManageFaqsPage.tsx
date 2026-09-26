"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR, { mutate } from "swr";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import WithTitle from "../UI/WithTitle";
import {
  FaqCategoryPopulation,
  IFaqCategory,
} from "../faqCategory/AdminManageFaqCategoriesPage";
import OrderEditor from "../UI/OrderEditor";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";

export type FaqPopulation = Population<{ Category: FaqCategoryPopulation }>;

export interface IFaq<
  T extends FaqPopulation = FaqPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
  isHome: boolean;
  question?: string;
  answer?: string;
  category?: T["Category"] extends FaqCategoryPopulation
    ? IFaqCategory<T["Category"]>
    : string;
}

const MutateFaqPopup = ({
  mutate,
  node,
}: {
  node?: IFaq<{ Category: Record<never, never> }>;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm
        onCancel={() => {
          closePopup();
        }}
        defaultValue={node}
        hookProps={{
          path: `${API}/auto/faq${!!node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          name: { title: "نام", type: "text" },
          isActive: { title: "فعال", type: "bool" },
          order: { title: "رتبه", type: "number" },
          isHome: { title: "نمایش در خانه", type: "bool" },
          question: { title: "سوال", type: "text" },
          answer: { title: "جواب", type: "text" },
          category: {
            title: "دسته بندی",
            type: "nodes",
            getOptionLabel: (node) =>
              (node as IFaqCategory).name || (node as IFaqCategory)._id,
            getOptionValue: (node) => (node as IFaqCategory)._id,
            path: `${API}/auto/faqCategory`,
            getDefaultValue: (inp) => inp.category?._id,
          },
        }}
      />
    </PopupCard>
  );
};

const DeleteFaqPopup = ({
  mutate,
  node,
}: {
  node: IFaq;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <Fragment>
      <ConfirmationPopup
        message="آیا از حذف این آیتم مطمئنید؟"
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/faq/${node._id}` : null}
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

const AdminManageFaqsPage = () => {
  const { data, error, mutate } = useSWR<
    IFaq<{ Category: Record<never, never> }>[]
  >(`${API}/auto/faq`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="سوالات متداول"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup("MutateFaq", <MutateFaqPopup mutate={mutate} />),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageFaqs"
            renderer={{
              question: {
                name: "سوال",
                value: (node) => node.question || node.name,
                filter: "Text",
              },
              category: {
                name: "دسته‌بندی",
                filter: "Multi",
                value: (node) => node.category?.name,
                component: (node) =>
                  node.category ? (
                    <InlineLink
                      href={adminPath(`/faqCategory/${node.category._id}`)}
                    >
                      {node.category.name || "—"}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              isActive: {
                name: "وضعیت",
                value: (node) => booleanToValue[`${node.isActive}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.isActive} />,
              },
              isHome: {
                name: "نمایش در خانه",
                filter: "Set",
                value: (node) => booleanToValue[`${node.isHome}`],
                component: (node) => <BooleanToIcon value={node.isHome} />,
              },
              order: {
                name: "رتبه",
                filter: "Number",
                value: (node) => node.order,
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    _id={node._id}
                    modelName="faq"
                    mutate={mutate}
                  />
                ),
              },
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title="ویرایش"
                      onClick={() =>
                        setPopup(
                          "MutateFaq",
                          <MutateFaqPopup node={node} mutate={mutate} />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      title="حذف"
                      onClick={() =>
                        setPopup(
                          "DeleteFaq",
                          <DeleteFaqPopup mutate={mutate} node={node} />,
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

export default AdminManageFaqsPage;
