"use client";

import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { ICity, IPolygon, IProvince } from "./AdminManageProvincesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import DashboardIcon from "@/Components/Icons/DashboardIcon";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import PopupCard from "@/Components/UI/PopupCard";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import PolygonPicker from "@/Components/UI/PolygonPicker";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import useProgress from "@/Components/Hooks/useProgress";

const MutateCityPopup = ({
  mutate,
  node,
  province,
}: (
  | { node: ICity; province?: never }
  | { node?: never; province: IProvince }
) & { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={node ? ta("ویرایش شهر") : ta("شهر جدید")}>
      <CreateForm
        hookProps={{
          path: `${API}/auto/city${!!node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
          decorators: province ? { province: province._id } : undefined,
        }}
        onCancel={() => {
          closePopup();
        }}
        defaultValue={node}
        renderer={{
          name: { title: ta("نام"), type: "text" },
          order: { title: ta("رتبه"), type: "number" },
          isActive: { title: ta("فعال"), type: "bool" },
        }}
      />
    </PopupCard>
  );
};

const DeleteCityPopup = ({
  mutate,
  node,
}: {
  node: ICity;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف این مورد مطمئنید؟")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/city/${node._id}` : null}
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

const ProvinceDetails = ({
  mutate,
  node,
}: {
  node: IProvince;
  mutate: () => unknown;
}) => {
  return (
    <CreateForm
      defaultValue={node}
      hookProps={{
        path: `${API}/auto/province/${node._id}`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
      renderer={{
        name: { type: "text", title: ta("نام") },
        order: { type: "number", title: ta("رتبه") },
        isActive: { type: "bool", title: ta("فعال") },
        slug: { type: "text", title: ta("اسلاگ") },
      }}
    />
  );
};

const ProvinceCities = ({ node }: { node: IProvince }) => {
  const { data, error, mutate } = useSWR<ICity[]>(
    `${API}/auto/city?province=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("شهرها")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "MutateCity",
                  <MutateCityPopup mutate={mutate} province={node} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageCities"
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              isActive: {
                name: ta("فعال"),
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
                    _id={node._id}
                    value={node.order}
                    mutate={mutate}
                    modelName="city"
                  />
                ),
              },
              actions: {
                name: ta("عملیات"),
                width: 150,
                component: (city) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/city/${city._id}`)}
                      title={ta("مشاهده")}
                    >
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      title={ta("ویرایش")}
                      onClick={() =>
                        setPopup(
                          "MutateCity",
                          <MutateCityPopup node={city} mutate={mutate} />,
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
                          "DeleteCity",
                          <DeleteCityPopup node={city} mutate={mutate} />,
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

const ProvinceGeometry = ({
  node,
  mutate,
}: {
  node: IProvince;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<IPolygon["coordinates"] | null>(
    null,
  );

  return (
    <Fragment>
      <PolygonPicker
        onSubmit={(e) => setIsLoading(e)}
        isLoading={!!isLoading}
        defaultValue={node.geometry?.coordinates}
      />
      <Act
        path={!!isLoading ? `${API}/auto/province/${node._id}` : null}
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

const AdminManageProvincePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IProvince>(
    `${API}/auto/province/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );
  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={data.name || ta("بدون نام")}
          actions={[
            {
              title: ta("حذف"),
              danger: true,
              action: () =>
                setPopup(
                  "DeleteProvince",
                  <DeleteShitPopup
                    modelName="province"
                    nodeId={data._id}
                    mutate={() => push(adminPath("/province"))}
                  />,
                ),
            },
          ]}
        >
          <TabSystem
            name="AdminManageProvince"
            items={[
              {
                title: ta("جزئیات"),
                content: <ProvinceDetails node={data} mutate={mutate} />,
                id: "Details",
                icon: <DashboardIcon />,
              },
              {
                title: ta("شهرها"),
                content: <ProvinceCities node={data} />,
                id: "Cities",
                icon: <DashboardIcon />,
              },
              {
                title: ta("محدوده روی نقشه"),
                content: <ProvinceGeometry node={data} mutate={mutate} />,
                id: "Geometry",
                icon: <DashboardIcon />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageProvincePage;
