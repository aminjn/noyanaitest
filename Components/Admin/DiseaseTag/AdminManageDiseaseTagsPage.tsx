"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { BadgeColor, badgeColors } from "@/Components/UI/Badge";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import useSWR, { mutate } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
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
import { ta } from "@/Components/Admin/i18n/adminText";

export type DiseaseTagPopulation = Population<Record<never, never>>;

export interface IDiseaseTag<
  T extends DiseaseTagPopulation = DiseaseTagPopulation,
> extends MongoDoc {
  name?: string;
  isActive: boolean;
  order: number;
  level: BadgeColor;
}

const CreateDiseaseTagPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IDiseaseTag>
        onCancel={() => closePopup()}
        renderer={{
          name: { type: "text", title: ta("نام") },
          isActive: { type: "bool", title: ta("فعال") },
          level: {
            type: "select",
            title: ta("لول"),
            options: badgeColors.reduce(
              (acc, el) => ({ ...acc, [el]: el }),
              {},
            ),
          },
        }}
        hookProps={{
          path: `${API}/auto/diseaseTag`,
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

const DeleteDiseaseTagPopup = ({
  mutate,
  node,
}: {
  node: IDiseaseTag;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
        message={ta("آیا از حذف این مورد مطمئنید؟")}
      />
      <Act
        path={isLoading ? `${API}/auto/diseaseTag/${node._id}` : null}
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

const AdminManageDiseaseTagsPage = () => {
  const { data, error, mutate } = useSWR<IDiseaseTag[]>(
    `${API}/auto/diseaseTag`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("تگ بیماری ها")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "CreateDiseaseTag",
                  <CreateDiseaseTagPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageDiseaseTags"
            data={data}
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
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
                    modelName="diseaseTag"
                    mutate={mutate}
                    _id={node._id}
                    value={node.order}
                  />
                ),
              },
              level: {
                name: ta("سطح"),
                value: (node) => node.level,
                filter: "Set",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/diseaseTag/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteDiseaseTag",
                          <DeleteDiseaseTagPopup mutate={mutate} node={node} />,
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

export default AdminManageDiseaseTagsPage;
