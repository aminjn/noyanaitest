"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  CityPopulation,
  DistrictPopulation,
  ICity,
  IDistrict,
  IProvince,
  ProvincePopulation,
} from "../Province/AdminManageProvincesPage";
import {
  HospitalCategoryPopulation,
  IHospitalCategory,
} from "../HospitalCategory/AdminManageHospitalCategoriesPage";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import useSWR from "swr";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import {
  HospitalTagPopulation,
  IHospitalTag,
} from "../HospitalTag/AdminManageHospitalTagsPage";
import {
  HospitalClinicPopulation,
  IHospitalClinic,
} from "./AdminManageHospitalPage";
import {
  DoctorProfilePopulation,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import {
  IInsurance,
  InsurancePopulation,
} from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import OrderEditor from "../UI/OrderEditor";

export type HospitalPopulation = Population<{
  Province: ProvincePopulation;
  City: CityPopulation;
  District: DistrictPopulation;
  Category: HospitalCategoryPopulation;
  Tags: HospitalTagPopulation;
  Clinics: HospitalClinicPopulation;
  Owner: DoctorProfilePopulation;
  Insurances: InsurancePopulation;
}>;

export interface IHospital<
  T extends HospitalPopulation = HospitalPopulation,
> extends MongoDoc {
  name?: string;
  slug?: string;
  isActive: boolean;
  order: number;
  province?: T["Province"] extends ProvincePopulation
    ? IProvince<T["Province"]>
    : string;
  city?: T["City"] extends CityPopulation ? ICity<T["City"]> : string;
  district?: T["District"] extends DistrictPopulation
    ? IDistrict<T["District"]>
    : string;
  location?: { type: "Point"; coordinates?: [number, number] };
  isRoundTheClock: boolean;
  bedCount: number;
  category?: T["Category"] extends HospitalCategoryPopulation
    ? IHospitalCategory<T["Category"]>
    : string;
  tags: T["Tags"] extends HospitalTagPopulation
    ? IHospitalTag<T["Tags"]>[]
    : string[];
  special: boolean;
  image?: string;
  code?: string;
  establishment?: string;
  personelCount?: number;
  summary?: string;
  clinics: T["Clinics"] extends HospitalClinicPopulation
    ? IHospitalClinic<T["Clinics"]>[]
    : never;
  address?: string;
  businessTimes?: string;
  mail?: string;
  owner?: T["Owner"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Owner"]>
    : string;
  phone?: string;
  website?: string;
  services?: string[];
  insurances: T["Insurances"] extends InsurancePopulation
    ? IInsurance<T["Insurances"]>[]
    : string[];
  certificates?: string[];
  averageScore: number;
  commentCount: number;
}

const CreateHospitalPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IHospital>
        onCancel={() => closePopup()}
        renderer={{
          name: { type: "text", title: "نام" },
          isActive: { type: "bool", title: "فعال" },
          slug: { title: "اسلاگ", type: "text" },
          order: { type: "number", title: "رتبه" },
        }}
        hookProps={{
          path: `${API}/auto/hospital`,
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

const DeleteHospitalPopup = ({
  mutate,
  node,
}: {
  node: IHospital;
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
        path={`${API}/auto/hospital/${node._id}`}
        method="POST"
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

const AdminManageHospitalsPage = () => {
  const { data, error, mutate } = useSWR<IHospital[]>(
    `${API}/auto/hospital`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="بیمارستان ها"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateHospital",
                  <CreateHospitalPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageHospitals"
            renderer={{
              name: {
                name: "نام",
                value: (node) => node.name,
                filter: "Number",
              },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              slug: {
                name: "اسلاگ",
                value: (node) => node.slug,
                filter: "Text",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    _id={node._id}
                    modelName="hospital"
                    mutate={mutate}
                  />
                ),
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/hospital/${node._id}`)}>
                      <EyeIcon />
                    </IconLink>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "DeleteHospital",
                          <DeleteHospitalPopup node={node} mutate={mutate} />,
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

export default AdminManageHospitalsPage;
