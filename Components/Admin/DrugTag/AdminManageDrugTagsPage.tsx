"use client";

import useSWR, { mutate } from "swr";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
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
import IconButton from "../UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import GarbageIcon from "@/Components/Icons/GarbageIcon";

export type DrugTagPopulation = Population<Record<never, never>>;

export interface IDrugTag<
  T extends DrugTagPopulation = DrugTagPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
}

const CreateDrugTagPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IDrugTag>
        onCancel={() => {
          closePopup();
        }}
        hookProps={{
          path: `${API}/auto/drugTag`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          name: { type: "text", title: "نام" },
          isActive: { title: "فعال", type: "bool" },
          order: { title: "رتبه", type: "number" },
        }}
      />
    </PopupCard>
  );
};

const DeleteDrugTagPopup = ({
  mutate,
  node,
}: {
  node: IDrugTag;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
        message="آیا از حذذف این مورد مطمئنید؟"
      />
      <Act
        path={isLoading ? `${API}/auto/drugTag/${node._id}` : null}
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

const AdminManageDrugtagsPage = () => {
  const { data, error, mutate } = useSWR<IDrugTag[]>(
    `${API}/auto/drugTag`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="تگ دارو ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateDrugTag",
                  <CreateDrugTagPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageDrugTags"
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
              },
              actions: {
                name: "غملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/drugTag/${node._id}`)}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteDrugTag",
                          <DeleteDrugTagPopup mutate={mutate} node={node} />,
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

export default AdminManageDrugtagsPage;
