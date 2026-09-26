"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import OrderEditor from "../UI/OrderEditor";

export type AiExamplePopulation = Population<Record<never, never>>;

export interface IAiExample<
  T extends AiExamplePopulation = AiExamplePopulation,
> extends MongoDoc {
  isActive: boolean;
  name?: string;
  order: number;
  prompt?: string;
  category?: string;
}

const MutateAiExamplePopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node?: IAiExample;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        onCancel={() => closePopup()}
        defaultValue={node}
        hookProps={{
          path: `${API}/auto/aiExample${!!node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          name: { title: "نام", type: "text" },
          isActive: { title: "وضعیت", type: "bool" },
          order: { title: "رتبه", type: "number" },
          prompt: { title: "پرامپت", type: "area" },
          category: { title: "دسته", type: "text" },
        }}
      />
    </PopupCard>
  );
};

const DeleteAiExamplePopup = ({
  mutate,
  node,
}: {
  node: IAiExample;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message="از حذف این مورد مطمئنید؟"
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={`${API}/auto/aiExample/${node._id}`}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          closePopup();
        }}
      />
    </Fragment>
  );
};

const AdminManageAiExamplesPage = () => {
  const { data, error, mutate } = useSWR<IAiExample[]>(
    `${API}/auto/aiExample`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="مثال های بات"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateAiExample",
                  <MutateAiExamplePopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageAiExamples"
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              category: {
                name: "دسته",
                value: (node) => node.category,
                filter: "Set",
              },
              isActive: {
                name: "وضعیت",
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
                    _id={node._id}
                    mutate={mutate}
                    modelName="aiExample"
                  />
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title="ویرایش"
                      onClick={() =>
                        setPopup(
                          "MutateAiExample",
                          <MutateAiExamplePopup mutate={mutate} node={node} />,
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
                          "deleteAiExample",
                          <DeleteAiExamplePopup mutate={mutate} node={node} />,
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

export default AdminManageAiExamplesPage;
