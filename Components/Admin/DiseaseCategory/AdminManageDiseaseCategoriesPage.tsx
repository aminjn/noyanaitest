"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import useSWR, { mutate } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import OrderEditor from "../UI/OrderEditor";

export type DiseaseCategoryPopuplation = Population<Record<never, never>>;

export interface IDiseaseCategory<
  T extends DiseaseCategoryPopuplation = DiseaseCategoryPopuplation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  isActive: boolean;
  order: number;
}

const CreateDiseaseCategoryPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm<IDiseaseCategory>
        onCancel={() => {
          closePopup();
        }}
        renderer={{
          name: { type: "text", title: "نام" },
          isActive: { type: "bool", title: "فعال" },
          order: { type: "number", title: "رتبه" },
          slug: { title: "اسلاگ", type: "text" },
        }}
        hookProps={{
          path: `${API}/auto/diseaseCategory`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const DeleteDiseaseCategoryPopup = ({
  mutate,
  node,
}: {
  node: IDiseaseCategory;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message="آیا از حذف این مورد مطمئنید؟"
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/diseaseCategory/${node._id}` : null}
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

const AdminManageDiseaseCategoriesPage = () => {
  const { data, error, mutate } = useSWR<IDiseaseCategory[]>(
    `${API}/auto/diseaseCategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="دسته بندی بیماری ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateDiseaseCategory",
                  <CreateDiseaseCategoryPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageDiseaseCategories"
            data={data}
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    modelName="diseaseCategory"
                    mutate={mutate}
                    _id={node._id}
                  />
                ),
              },
              slug: {
                name: "اسلاگ",
                value: (node) => node.slug,
                filter: "Text",
              },
              actions: {
                name: "غملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/diseaseCategory/${node._id}`)}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteDiseaseCategory",
                          <DeleteDiseaseCategoryPopup
                            node={node}
                            mutate={mutate}
                          />,
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

export default AdminManageDiseaseCategoriesPage;
