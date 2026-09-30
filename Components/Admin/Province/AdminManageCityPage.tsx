"use client";

import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { ICity, IDistrict, IPolygon } from "./AdminManageProvincesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import TabSystem from "../UI/TabSystem";
import DashboardIcon from "@/Components/Icons/DashboardIcon";
import CreateForm from "../UI/CreateForm";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import PopupCard from "@/Components/UI/PopupCard";
import PolygonPicker from "@/Components/UI/PolygonPicker";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateDistrictPopup = ({
  mutate,
  city,
  node,
}: ({ node: IDistrict; city?: never } | { node?: never; city: ICity }) & {
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm
        defaultValue={node}
        onCancel={() => {
          closePopup();
        }}
        hookProps={{
          path: `${API}/auto/district${!!node ? `/${node._id}` : ""}`,
          method: "POST",
          decorators: !!city ? { city: city._id } : undefined,
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          name: { title: ta("نام"), type: "text" },
          order: { title: ta("رتبه"), type: "number" },
          isActive: { title: ta("فعال"), type: "bool" },
        }}
      />
    </PopupCard>
  );
};

const DeleteDistrictPopup = ({
  mutate,
  node,
}: {
  node: IDistrict;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف این مورد مطمئنید؟")}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/district/${node._id}` : null}
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

const CityDetails = ({
  mutate,
  node,
}: {
  node: ICity;
  mutate: () => unknown;
}) => {
  return (
    <CreateForm
      defaultValue={node}
      hookProps={{
        path: `${API}/auto/city/${node._id}`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
      renderer={{
        name: { title: ta("نام"), type: "text" },
        order: { title: ta("رتبه"), type: "number" },
        isActive: { title: ta("فعال"), type: "bool" },
      }}
    />
  );
};

const CityDistricts = ({ node }: { node: ICity }) => {
  const { data, error, mutate } = useSWR<IDistrict[]>(
    `${API}/auto/district?city=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("محلات")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "MutateDistrict",
                  <MutateDistrictPopup mutate={mutate} city={node} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageDistricts"
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
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
                    value={node.order}
                    mutate={mutate}
                    modelName="district"
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                width: 150,
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={ta("ویرایش")}
                      onClick={() =>
                        setPopup(
                          "MutateDistrict",
                          <MutateDistrictPopup node={node} mutate={mutate} />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconLink
                      href={adminPath(`/district/${node._id}`)}
                      title={ta("مشاهده")}
                    >
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteDistrict",
                          <DeleteDistrictPopup node={node} mutate={mutate} />,
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

const CityGeometry = ({
  node,
  mutate,
}: {
  node: ICity;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<IPolygon["coordinates"] | null>(
    null,
  );

  return (
    <Fragment>
      <PolygonPicker
        isLoading={!!isLoading}
        defaultValue={node.geometry?.coordinates}
        onSubmit={(e) => setIsLoading(e)}
      />
      <Act
        path={!!isLoading ? `${API}/auto/city/${node._id}` : null}
        method="POST"
        payload={{ geometry: { type: "Polygon", coordinates: isLoading } }}
        onDone={(status) => {
          setIsLoading(null);
          if (!status) return;
          mutate();
        }}
      />
    </Fragment>
  );
};

const AdminManageCityPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<ICity>(
    `${API}/auto/city/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManageCity"
            items={[
              {
                title: ta("جزئیات"),
                id: "Details",
                content: <CityDetails node={data} mutate={mutate} />,
                icon: <DashboardIcon />,
              },
              {
                title: ta("محلات"),
                id: "Districts",
                content: <CityDistricts node={data} />,
                icon: <DashboardIcon />,
              },
              {
                title: ta("جئومتری"),
                id: "Geometry",
                icon: <DashboardIcon />,
                content: <CityGeometry node={data} mutate={mutate} />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageCityPage;
