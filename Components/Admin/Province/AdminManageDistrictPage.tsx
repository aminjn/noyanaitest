"use client";

import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { IDistrict, IPolygon } from "./AdminManageProvincesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import TabSystem from "../UI/TabSystem";
import CreateForm from "../UI/CreateForm";
import DashboardIcon from "@/Components/Icons/DashboardIcon";
import PolygonPicker from "@/Components/UI/PolygonPicker";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import { ta } from "@/Components/Admin/i18n/adminText";

const DistrictDetails = ({
  mutate,
  node,
}: {
  node: IDistrict;
  mutate: () => unknown;
}) => {
  return (
    <CreateForm
      defaultValue={node}
      hookProps={{
        path: `${API}/auto/district/${node._id}`,
        method: "POST",
        successCb: () => {
          mutate();
        },
      }}
      renderer={{
        name: { title: ta("نام"), type: "text" },
        order: { type: "number", title: ta("رتبه") },
        isActive: { title: ta("فعال"), type: "bool" },
      }}
    />
  );
};

const DistrictGeometry = ({
  mutate,
  node,
}: {
  node: IDistrict;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<IPolygon["coordinates"] | null>(
    null,
  );

  return (
    <Fragment>
      <PolygonPicker
        defaultValue={node.geometry?.coordinates}
        isLoading={!!isLoading}
        onSubmit={(e) => setIsLoading(e)}
      />
      <Act
        path={isLoading ? `${API}/auto/district/${node._id}` : null}
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

const AdminManageDistrictPage = () => {
  const { nodeId } = useParams();
  const { data, error, mutate } = useSWR<IDistrict>(
    `${API}/auto/district/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TabSystem
          name="AdminManageDistrict"
          items={[
            {
              id: "Details",
              icon: <DashboardIcon />,
              title: ta("جزئیات"),
              content: <DistrictDetails node={data} mutate={mutate} />,
            },
            {
              id: "Geometry",
              icon: <DashboardIcon />,
              title: ta("جئومتری"),
              content: <DistrictGeometry mutate={mutate} node={data} />,
            },
          ]}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageDistrictPage;
