"use client";

import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import BecomeParaClinicPage from "./BecomeParaClinicPage";
import PanelLayout from "./PanelLayout";
import { ReactNode } from "react";
import ParaClinicSidebar from "./ParaClinicSidebar";
import {
  IParaClinicTag,
  ParaClinicTagPopulation,
} from "../Admin/ParaClinicTag/AdminManageParaClinicTagsPage";
import {
  CityPopulation,
  DistrictPopulation,
  ICity,
  IDistrict,
  IProvince,
  ProvincePopulation,
} from "../Admin/Province/AdminManageProvincesPage";

export type ParaClinicPopulation = Population<{
  User: UserPopulation;
  Tags: ParaClinicTagPopulation;
  Province: ProvincePopulation;
  City: CityPopulation;
  District: DistrictPopulation;
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
  special: boolean;
  image?: string;
  slug?: string;
}

const ParaClinicPanelLayout = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useSWR<IParaClinic | null>(
    `${API}/paraClinic`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  return (
    <HandleLoading data={!isLoading}>
      {!!data ? (
        <PanelLayout sidebar={<ParaClinicSidebar />}>{children}</PanelLayout>
      ) : (
        <BecomeParaClinicPage />
      )}
    </HandleLoading>
  );
};

export default ParaClinicPanelLayout;
