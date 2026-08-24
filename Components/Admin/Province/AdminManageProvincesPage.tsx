"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import useSWR, { mutate } from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import OrderEditor from "../UI/OrderEditor";

export type IPosition = [longitude: number, latitude: number];
export type ILinearRing = IPosition[];

export interface IPolygon {
  type: "Polygon";
  coordinates: ILinearRing[];
}

export type ProvincePopulation = Population<{ Cities: CityPopulation }>;
export interface IProvince<
  T extends ProvincePopulation = ProvincePopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
  geometry?: IPolygon;
  cities: T["Cities"] extends CityPopulation ? ICity<T["Cities"]>[] : never;
  slug?: string;
}

export type CityPopulation = Population<{
  Province: ProvincePopulation;
  Districts: DistrictPopulation;
}>;
export interface ICity<
  T extends CityPopulation = CityPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
  province: T["Province"] extends ProvincePopulation
    ? IProvince<T["Province"]>
    : string;
  geometry?: IPolygon;
  districts: T["Districts"] extends DistrictPopulation
    ? IDistrict<T["Districts"]>[]
    : never;
}

export type DistrictPopulation = Population<{ City: CityPopulation }>;
export interface IDistrict<
  T extends DistrictPopulation = DistrictPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
  city: T["City"] extends CityPopulation ? ICity<T["City"]> : string;
  geometry?: IPolygon;
}

const MutateProvincePopup = ({
  mutate,
  node,
}: {
  node?: IProvince;
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
          path: `${API}/auto/province${!!node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          name: { title: "نام", type: "text" },
          order: { type: "number", title: "رتبه" },
          isActive: { title: "فعال", type: "bool" },
        }}
      />
    </PopupCard>
  );
};

const DeleteProvincePopup = ({
  mutate,
  node,
}: {
  node: IProvince;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message="آیا از حذف این مورد مطمئیند؟"
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/province/${node._id}` : null}
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

const AdminManageProvincesPage = () => {
  const { data, error, mutate } = useSWR<IProvince[]>(
    `${API}/auto/province`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="استان ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateProvince",
                  <MutateProvincePopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageProvinces"
            data={data}
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    _id={node._id}
                    value={node.order}
                    mutate={mutate}
                    modelName="province"
                  />
                ),
              },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/province/${node._id}`)}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateProvince",
                          <MutateProvincePopup mutate={mutate} node={node} />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteProvince",
                          <DeleteProvincePopup node={node} mutate={mutate} />,
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

export default AdminManageProvincesPage;
