"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import useSWR, { mutate } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export type HomeIntroductionPopulation = Population<Record<never, never>>;

export interface IHomeIntroduction<
  T extends HomeIntroductionPopulation = HomeIntroductionPopulation,
> extends MongoDoc {
  isActive: boolean;
  order: number;
  title: string;
  image: string;
}

const MutateHomeIntroductionPopup = ({
  mutate,
  node,
}: {
  node?: IHomeIntroduction;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/homeIntroduction${!!node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          title: { title: ta("عنوان"), type: "text" },
          order: { title: ta("رتبه"), type: "number" },
          isActive: { type: "bool", title: ta("فعال") },
          image: { title: ta("تصویر"), type: "image" },
        }}
      />
    </PopupCard>
  );
};

const DeleteHomeIntroductionPopup = ({
  mutate,
  node,
}: {
  node: IHomeIntroduction;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message={ta("آیا از حذف این ایتم مطمئنید؟")}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/homeIntroduction/${node._id}` : null}
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

const AdminManageHomeIntroductionsPage = () => {
  const { data, error, mutate } = useSWR<IHomeIntroduction[]>(
    `${API}/auto/homeIntroduction`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("معرقی خانه")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "MutateHomeIntroduction",
                  <MutateHomeIntroductionPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageHomeIntroductions"
            renderer={{
              title: {
                name: ta("عنوان"),
                value: (node) => node.title,
                filter: "Text",
              },
              isActive: {
                name: ta("فعال"),
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              order: {
                name: ta("ترتیب"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    _id={node._id}
                    modelName="homeIntroduction"
                    mutate={mutate}
                    value={node.order}
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
                          "MutateHomeIntroduction",
                          <MutateHomeIntroductionPopup
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
                          "DeleteHomeintroduction",
                          <DeleteHomeIntroductionPopup
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

export default AdminManageHomeIntroductionsPage;
