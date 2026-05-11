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

export type AdvertisementPopulation = Population<Record<never, never>>;

export interface IAdvertisement extends MongoDoc {
  name?: string;
  image?: string;
  isActive: boolean;
  order: number;
  isHome: boolean;
  isHomeSlider: boolean;
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
          isHome: { title: "نمایش در خانه", type: "bool" },
          image: { title: "تصویر", type: "image" },
          isHomeSlider: { title: "اسلایدر هوم", type: "bool" },
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
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              isHome: {
                name: "نمایش در خانه",
                value: (node) => booleanToValue[`${node.isHome}`],
                component: (node) => <BooleanToIcon value={node.isHome} />,
                filter: "Set",
              },
              isHomeSlider: {
                name: "نمایش در اسلایدر هوم",
                value: (node) => booleanToValue[`${node.isHomeSlider}`],
                filter: "Set",
                component: (node) => (
                  <BooleanToIcon value={node.isHomeSlider} />
                ),
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
