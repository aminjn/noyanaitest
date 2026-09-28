"use client";
import ActingAsBanner from "./ActingAsBanner";

import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import useUser, { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomeParaClinicPage from "./BecomeParaClinicPage";
import PanelLayout from "./PanelLayout";
import LoginRequired from "../UI/LoginRequired";
import { ReactNode } from "react";
import ParaClinicSidebar from "./ParaClinicSidebar";
import ParaClinicLicenseGate from "../ParaClinicDashboard/ParaClinicLicenseGate";
import {
  IParaClinicTag,
  ParaClinicTagPopulation,
} from "../Admin/ParaClinicTag/AdminManageParaClinicTagsPage";
import {
  IParaClinicCategory,
  ParaClinicCategoryPopulation,
} from "../Admin/ParaClinicCategory/AdminManageParaClinicCategoriesPage";
import {
  CityPopulation,
  DistrictPopulation,
  ICity,
  IDistrict,
  IProvince,
  ProvincePopulation,
} from "../Admin/Province/AdminManageProvincesPage";
import {
  IProductImage,
  ProductImagePopulation,
} from "../Admin/Product/AdminManageProductsPage";
import {
  IParaClinicTest,
  ParaClinicTestPopulation,
} from "../Admin/ParaClinic/AdminManageParaClinicPage";
import {
  IInsurance,
  InsurancePopulation,
} from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import {
  ISpeciality,
  SpecialityPopulation,
} from "../Admin/Speciality/AdminManageSpecialitiesPage";

export type ParaClinicPopulation = Population<{
  User: UserPopulation;
  Tags: ParaClinicTagPopulation;
  Province: ProvincePopulation;
  City: CityPopulation;
  District: DistrictPopulation;
  Category: ParaClinicCategoryPopulation;
  Images: ProductImagePopulation;
  Tests: ParaClinicTestPopulation;
  Insurances: InsurancePopulation;
  Specialities: SpecialityPopulation;
}>;

export interface IParaClinic<
  T extends ParaClinicPopulation = ParaClinicPopulation,
> extends MongoDoc {
  user?: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  name?: string;
  order: number;
  active: boolean;
  tags: T["Tags"] extends ParaClinicTagPopulation
    ? IParaClinicTag<T["Tags"]>[]
    : string[];
  location?: { type: "Point"; coordinates?: [number, number] };
  province?: T["Province"] extends ProvincePopulation
    ? IProvince<T["Province"]>
    : string;
  city?: T["City"] extends CityPopulation ? ICity<T["City"]> : string;
  district?: T["District"] extends DistrictPopulation
    ? IDistrict<T["District"]>
    : string;
  category?: T["Category"] extends ParaClinicCategoryPopulation
    ? IParaClinicCategory<T["Category"]>
    : string;
  specialities: T["Specialities"] extends SpecialityPopulation
    ? ISpeciality<T["Specialities"]>[]
    : string[];
  special: boolean;
  image?: string;
  slug?: string;
  images: T["Images"] extends ProductImagePopulation
    ? IProductImage<T["Images"]>[]
    : never;
  establishment?: string;
  businessTime?: string;
  phone?: string;
  onPremises: boolean;
  onlineResponse: boolean;
  basicInsurance: boolean;
  tests: T["Tests"] extends ParaClinicTestPopulation
    ? IParaClinicTest<T["Tests"]>[]
    : never;
  personelCount: number;
  summary?: string;
  insurances: T["Insurances"] extends InsurancePopulation
    ? IInsurance<T["Insurances"]>[]
    : string[];
  address?: string;
  averageScore?: number;
  commentCount?: number;
}

const ParaClinicPanelLayout = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const { data, isLoading } = useSWR<IParaClinic | null>(
    `${API}/paraClinic`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  return (
    <HandleLoading data={!isUserLoading && !isLoading}>
      {!user ? (
        <LoginRequired />
      ) : !!data ? (
        <PanelLayout sidebar={<ParaClinicSidebar />}>
          <ActingAsBanner kind="paraClinic" ownerName={data?.name} />
          <ParaClinicLicenseGate>{children}</ParaClinicLicenseGate>
        </PanelLayout>
      ) : (
        <BecomeParaClinicPage />
      )}
    </HandleLoading>
  );
};

export default ParaClinicPanelLayout;
