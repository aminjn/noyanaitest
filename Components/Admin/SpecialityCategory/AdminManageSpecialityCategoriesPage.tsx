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
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import OrderEditor from "../UI/OrderEditor";

export type SpecialityCategoryPopulation = Population<Record<never, never>>;
export interface ISpecialityCategory<
  T extends SpecialityCategoryPopulation = SpecialityCategoryPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
  slug?: string;
}

const CreateSpecialityCategoryPopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm<ISpecialityCategory>
        renderer={{
          name: { title: "نام", type: "text" },
          isActive: { title: "فعال", type: "bool" },
          order: { title: "رتبه", type: "number" },
        }}
        hookProps={{
          path: `${API}/auto/specialityCategory`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => {
          closePopup();
        }}
      />
    </PopupCard>
  );
};

const DeleteSpecialityCategoryPopup = ({
  mutate,
  node,
}: {
  node: ISpecialityCategory;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
        message="آیا از حذف این مورد مطمئنید؟"
      />
      <Act
        path={isLoading ? `${API}/auto/specialityCategory/${node._id}` : null}
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

const AdminManageSpecialityCategoriesPage = () => {
  const { data, error, mutate } = useSWR<ISpecialityCategory[]>(
    `${API}/auto/specialityCategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="دسته بندی تخصص ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateSpecialityCategory",
                  <CreateSpecialityCategoryPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageSpecialityCategories"
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
                    _id={node._id}
                    value={node.order}
                    mutate={mutate}
                    modelName="specialityCategory"
                  />
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/specialityCategory/${node._id}`)}
                    >
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteSpecialityCategory",
                          <DeleteSpecialityCategoryPopup
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

export default AdminManageSpecialityCategoriesPage;
