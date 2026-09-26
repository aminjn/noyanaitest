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

export type ClinicTagPopulation = Population<Record<never, never>>;
export interface IClinicTag<
  T extends ClinicTagPopulation = ClinicTagPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
}

const CreateClinicTagPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IClinicTag>
        renderer={{
          name: { type: "text", title: "نام" },
          isActive: { type: "bool", title: "فعال" },
          order: { type: "number", title: "رتبه" },
        }}
        onCancel={() => {
          closePopup();
        }}
        hookProps={{
          path: `${API}/auto/clinicTag`,
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

const DeleteClinictagPopup = ({
  mutate,
  node,
}: {
  node: IClinicTag;
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
        path={isLoading ? `${API}/auto/clinicTag/${node._id}` : null}
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

const AdminManageClinicTagsPage = () => {
  const { data, error, mutate } = useSWR<IClinicTag[]>(
    `${API}/auto/clinicTag`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="تگ کلینیک ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateClinicTag",
                  <CreateClinicTagPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageClinicTags"
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
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    _id={node._id}
                    modelName="clinicTag"
                    mutate={mutate}
                  />
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/clinicTag/${node._id}`)}
                      title="ویرایش"
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title="حذف"
                      onClick={() =>
                        setPopup(
                          "DeleteClinicTag",
                          <DeleteClinictagPopup mutate={mutate} node={node} />,
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

export default AdminManageClinicTagsPage;
