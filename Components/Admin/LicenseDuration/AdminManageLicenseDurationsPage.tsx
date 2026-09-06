"use client";

import useSWR from "swr";
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
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import OrderEditor from "../UI/OrderEditor";

export type LicenseDurationPopulation = Population<Record<never, never>>;

export interface ILicenseDuration<
  T extends LicenseDurationPopulation = LicenseDurationPopulation,
> extends MongoDoc {
  duration: number;
  displayName?: string;
  order: number;
}

const DeleteLicenseDurationPopup = ({
  mutate,
  node,
}: {
  node: ILicenseDuration;
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
        path={isLoading ? `${API}/auto/licenseDuration/${node._id}` : null}
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

const CreateLicenseDurationPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<ILicenseDuration>
        onCancel={() => {
          closePopup();
        }}
        renderer={{
          displayName: { type: "text", title: "نام نمایشی" },
          duration: { type: "number", title: "مدت (روز)" },
          order: { type: "number", title: "رتبه" },
        }}
        hookProps={{
          path: `${API}/auto/licenseDuration`,
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

const AdminManageLicenseDurationsPage = () => {
  const { data, error, mutate } = useSWR<ILicenseDuration[]>(
    `${API}/auto/licenseDuration`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="مدت زمان مجوز"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateLicenseDuration",
                  <CreateLicenseDurationPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageLicenseDurations"
            renderer={{
              displayName: {
                name: "نام نمایشی",
                value: (node) => node.displayName,
                filter: "Text",
              },
              duration: {
                name: "مدت (روز)",
                value: (node) => node.duration,
                filter: "Number",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    modelName="licenseDuration"
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
                    <IconLink href={adminPath(`/licenseDuration/${node._id}`)}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteLicenseDuration",
                          <DeleteLicenseDurationPopup
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

export default AdminManageLicenseDurationsPage;
