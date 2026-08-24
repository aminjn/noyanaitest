"use client";

import useSWR, { mutate } from "swr";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import OrderEditor from "../UI/OrderEditor";

export type ClinicCategoryPopulation = Population<Record<never, never>>;

export interface IClinicCategory<
  T extends ClinicCategoryPopulation = ClinicCategoryPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
  slug?: string;
}

const DeleteClinicCategoryPopup = ({
  mutate,
  node,
}: {
  node: IClinicCategory;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        message="آیا از حذف این مورد مطمئنید؟"
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/clinicCategory/${node._id}` : null}
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

const CreateClinicCategoryPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IClinicCategory>
        onCancel={() => {
          closePopup();
        }}
        renderer={{
          name: { type: "text", title: "نام" },
          isActive: { title: "text", type: "bool" },
          order: { title: "رتبه", type: "number" },
        }}
        hookProps={{
          path: `${API}/auto/clinicCategory`,
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

const AdminManageClinicCategoriesPage = () => {
  const { data, error, mutate } = useSWR<IClinicCategory[]>(
    `${API}/auto/clinicCategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="دسته بندی کلینیک"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateClinicCategory",
                  <CreateClinicCategoryPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageClinicCategories"
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              order: {
                name: "رنبه",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    modelName="clinicCategory"
                    mutate={mutate}
                    value={node.order}
                    _id={node._id}
                  />
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/clinicCategory/${node._id}`)}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteClinicCategory",
                          <DeleteClinicCategoryPopup
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

export default AdminManageClinicCategoriesPage;
