"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import useSWR, { mutate } from "swr";
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
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import OrderEditor from "../UI/OrderEditor";

export type HospitalCategoryPopulation = Population<Record<never, never>>;

export interface IHospitalCategory<
  T extends HospitalCategoryPopulation = HospitalCategoryPopulation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  isActive: boolean;
  order: number;
}

const CreateHospitalCategoryPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm<IHospitalCategory>
        onCancel={() => closePopup()}
        renderer={{
          name: { type: "text", title: "نام" },
          slug: { type: "text", title: "اسلاگ" },
          isActive: { type: "bool", title: "فعال" },
          order: { type: "number", title: "رتبه" },
        }}
        hookProps={{
          path: `${API}/auto/hospitalCategory`,
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

const DeleteHospitalCategoryPopup = ({
  mutate,
  node,
}: {
  node: IHospitalCategory;
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
        path={isLoading ? `${API}/auto/hospitalCategory/${node._id}` : null}
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

const AdminManageHospitalCategoriesPage = () => {
  const { data, error, mutate } = useSWR<IHospitalCategory[]>(
    `${API}/auto/hospitalCategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="دسته بندی بیمارتان ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateHospitalCategory",
                  <CreateHospitalCategoryPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageHospitalCategories"
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
                    modelName="hospitalCategory"
                    _id={node._id}
                    mutate={mutate}
                    value={node.order}
                  />
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/hospitalCategory/${node._id}`)}
                      title="ویرایش"
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title="حذف"
                      onClick={() =>
                        setPopup(
                          "DeleteHospitalCategory",
                          <DeleteHospitalCategoryPopup
                            mutate={mutate}
                            node={node}
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

export default AdminManageHospitalCategoriesPage;
