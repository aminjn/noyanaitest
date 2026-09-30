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
import { ta } from "@/Components/Admin/i18n/adminText";

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
          order: { title: ta("رتبه"), type: "number" },
          isActive: { title: ta("فعال"), type: "bool" },
          image: { title: ta("تصویر"), type: "image" },
          title: { title: ta("عنوان"), type: "text" },
          description: { title: ta("توضیحات"), type: "area" },
          legend: { title: ta("لجند"), type: "text" },
          target: { title: ta("لینک اطلاعات بیشتر"), type: "text" },
          positions: {
            title: ta("جایگاه ها"),
            type: "multiselect",
            options: advertisementPositionLabels,
          },
          resourceModel: {
            title: ta("نوع منبع هدف (اختیاری)"),
            type: "select",
            options: advertisementResourceModelLabels,
          },
          resource: {
            title: ta("شناسه منبع هدف (اختیاری)"),
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
        message={ta("آیا از حذف این آیتم مطمئنید؟")}
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
          title={ta("تبلیغ ها")}
          actions={[
            {
              title: ta("جدید"),
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
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              title: {
                name: ta("عنوان"),
                value: (node) => node.title,
                filter: "Text",
              },
              positions: {
                name: ta("جایگاه‌ها"),
                value: (node) =>
                  (node.positions || [])
                    .map((position) => advertisementPositionLabels[position])
                    .join(ta("، ")),
                filter: "Text",
              },
              resource: {
                name: ta("منبع هدف"),
                value: (node) =>
                  node.resourceModel && node.resource
                    ? `${advertisementResourceModelLabels[node.resourceModel]} / ${node.resource}`
                    : ta("عمومی"),
                filter: "Text",
              },
              isActive: {
                name: ta("وضعیت"),
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              order: {
                name: ta("رتبه"),
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
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={ta("ویرایش")}
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
                      variant="Danger"
                      title={ta("حذف")}
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
