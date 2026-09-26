"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import OrderEditor from "../UI/OrderEditor";

export type TestCategoryPopulation = Population<Record<never, never>>;

export interface ITestCategory<
  T extends TestCategoryPopulation = TestCategoryPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
  slug?: string;
}

const CreateTestCategoryPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm<ITestCategory>
        onCancel={() => {
          closePopup();
        }}
        hookProps={{
          path: `${API}/auto/testCategory`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          name: { title: "نام", type: "text" },
          isActive: { type: "bool", title: "فعال" },
          order: { type: "number", title: "رتبه" },
          slug: { type: "text", title: "اسلاگ" },
        }}
      />
    </PopupCard>
  );
};

const DeleteTestCategoryPopup = ({
  mutate,
  node,
}: {
  node: ITestCategory;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message="آیا از حذف این مورد مطمئنید؟"
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/testCategory/${node._id}` : null}
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

const AdminManageTestCategoriesPage = () => {
  const { data, error, mutate } = useSWR<ITestCategory[]>(
    `${API}/auto/testCategory`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="دسته بندی تست ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateTestCategory",
                  <CreateTestCategoryPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageTestCategories"
            data={data}
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              isActive: {
                name: "وضعیت",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
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
                    modelName="testCategory"
                  />
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/testCategory/${node._id}`)}
                      title="ویرایش"
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title="حذف"
                      onClick={() =>
                        setPopup(
                          "DeleteTestCategory",
                          <DeleteTestCategoryPopup
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

export default AdminManageTestCategoriesPage;
