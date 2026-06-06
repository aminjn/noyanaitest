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
import { booleanToValue } from "@/Components/UI/BooleanToIcon";
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
          name: { title: "نام", type: "text" },
          order: { title: "رتبه", type: "number" },
          isActive: { title: "فعال", type: "bool" },
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
        message="آیا از حذف این مورد مطمئنید؟"
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
        name: { title: "نام", type: "text" },
        order: { title: "رتبه", type: "number" },
        isActive: { title: "فعال", type: "bool" },
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
          title="محلات"
          actions={[
            {
              title: "جدید",
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
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/district/${node._id}`)}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateDistrict",
                          <MutateDistrictPopup node={node} mutate={mutate} />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
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
                title: "جزئیات",
                id: "Details",
                content: <CityDetails node={data} mutate={mutate} />,
                icon: <DashboardIcon />,
              },
              {
                title: "محلات",
                id: "Districts",
                content: <CityDistricts node={data} />,
                icon: <DashboardIcon />,
              },
              {
                title: "جئومتری",
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
