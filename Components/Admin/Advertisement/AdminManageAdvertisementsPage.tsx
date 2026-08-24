"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import {
  advertisementPositionLabels,
  AdvertisementPosition,
  advertisementResourceModelLabels,
  AdvertisementResourceModel,
} from "./advertisementConstants";
import OrderEditor from "../UI/OrderEditor";

export type AdvertisementPopulation = Population<Record<never, never>>;

export interface IAdvertisement extends MongoDoc {
  name?: string;
  image?: string;
  isActive: boolean;
  order: number;
  title?: string;
  description?: string;
  legend?: string;
  // href for the ad's "more info" action/button
  target?: string;
  positions: AdvertisementPosition[];
  // Together, these optionally target one specific document (e.g. one
  // specific disease) instead of applying generically to every document
  // shown under `positions`. Leave both empty for a generic/fallback ad.
  resourceModel?: AdvertisementResourceModel;
  resource?: string;
}

const MutateAdvertisementPopup = ({
  mutate,
  node,
}: {
  node?: IAdvertisement;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/advertisement${!!node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          name: { title: "name", type: "text" },
          order: { title: "رتبه", type: "number" },
          isActive: { title: "فعال", type: "bool" },
          image: { title: "تصویر", type: "image" },
          title: { title: "عنوان", type: "text" },
          description: { title: "توضیحات", type: "area" },
          legend: { title: "لجند", type: "text" },
          target: { title: "لینک اطلاعات بیشتر", type: "text" },
          positions: {
            title: "جایگاه ها",
            type: "multiselect",
            options: advertisementPositionLabels,
          },
          resourceModel: {
            title: "نوع منبع هدف (اختیاری)",
            type: "select",
            options: advertisementResourceModelLabels,
          },
          resource: {
            title: "شناسه منبع هدف (اختیاری)",
            type: "text",
          },
        }}
      />
    </PopupCard>
  );
};

const DeleteAdvertisementPopup = ({
  mutate,
  node,
}: {
  node: IAdvertisement;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message="آیا از حذف این آیتم مطمئنید؟"
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/advertisement/${node._id}` : null}
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

const AdminManageAdvertisementsPage = () => {
  const { data, error, mutate } = useSWR<IAdvertisement[]>(
    `${API}/auto/advertisement`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="تبلیغ ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateAdvertisement",
                  <MutateAdvertisementPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageAdvertisement"
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              title: {
                name: "عنوان",
                value: (node) => node.title,
                filter: "Text",
              },
              description: {
                name: "توضیحات",
                value: (node) => node.description,
                filter: "Text",
              },
              legend: {
                name: "لجند",
                value: (node) => node.legend,
                filter: "Text",
              },
              target: {
                name: "لینک اطلاعات بیشتر",
                value: (node) => node.target,
                filter: "Text",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    modelName="advertisement"
                    mutate={mutate}
                    value={node.order}
                    _id={node._id}
                  />
                ),
              },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              positions: {
                name: "جایگاه ها",
                value: (node) =>
                  (node.positions || [])
                    .map((position) => advertisementPositionLabels[position])
                    .join("، "),
                filter: "Text",
              },
              resource: {
                name: "منبع هدف",
                value: (node) =>
                  node.resourceModel && node.resource
                    ? `${advertisementResourceModelLabels[node.resourceModel]} / ${node.resource}`
                    : "عمومی",
                filter: "Text",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateAdvertisement",
                          <MutateAdvertisementPopup
                            node={node}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteAdvertisement",
                          <DeleteAdvertisementPopup
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

export default AdminManageAdvertisementsPage;
