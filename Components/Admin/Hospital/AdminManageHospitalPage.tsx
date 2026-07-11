"use client";

import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { IHospital } from "./AdminManageHospitalsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import CreateForm from "../UI/CreateForm";
import { IHospitalCategory } from "../HospitalCategory/AdminManageHospitalCategoriesPage";
import {
  ICity,
  IDistrict,
  IProvince,
} from "../Province/AdminManageProvincesPage";
import { IHospitalTag } from "../HospitalTag/AdminManageHospitalTagsPage";
import useForm from "@/Components/Hooks/useForm";
import PointPicker from "../UI/PointPicker";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";

const HospitalLocationManager = ({
  mutate,
  node,
}: {
  node: IHospital;
  mutate: () => unknown;
}) => {
  const { setInput, isLoading, submit } = useForm<{
    coordinates: [number, number];
  }>({
    path: `${API}/auto/hospital/${node._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
    mutator: (inp) => ({
      location: { type: "Point", coordinates: inp.coordinates },
    }),
    hasProblem: (inp) => (!inp.coordinates ? "مختصات را انتخاب کنید" : false),
  });

  return (
    <div>
      <PointPicker
        defaultValue={node.location?.coordinates}
        onChange={(e) => setInput((prev) => ({ ...prev, coordinates: e }))}
      />
      <FormActions>
        <Button onClick={() => submit()} isLoading={isLoading}>
          تایید
        </Button>
      </FormActions>
    </div>
  );
};

const AdminManageHospitalPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IHospital>(
    `${API}/auto/hospital/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManageHospital"
            items={[
              {
                title: "اطلاعات",
                content: (
                  <CreateForm
                    defaultValue={data}
                    renderer={{
                      name: { type: "text", title: "نام" },
                      isActive: { type: "bool", title: "فعال" },
                      order: { type: "number", title: "رتبه" },
                      slug: { type: "text", title: "اسلاگ" },
                      bedCount: { type: "number", title: "تعداد تخت" },
                      isRoundTheClock: { type: "bool", title: "24X7" },
                      special: { type: "bool", title: "ویژه" },
                      category: {
                        type: "nodes",
                        multi: false,
                        path: `${API}/auto/hospitalCategory`,
                        getOptionLabel: (node) =>
                          (node as IHospitalCategory).name ||
                          (node as IHospitalCategory)._id,
                        getOptionValue: (node) =>
                          (node as IHospitalCategory)._id,
                        getDefaultValue: (inp) => inp.category,
                        title: "دسنه بندی",
                      },
                      province: {
                        type: "nodes",
                        path: `${API}/auto/province`,
                        multi: false,
                        getOptionLabel: (node) =>
                          (node as IProvince).name || (node as IProvince)._id,
                        getOptionValue: (node) => (node as IProvince)._id,
                        title: "استان",
                        getDefaultValue: (inp) => inp.province,
                      },
                      city: {
                        title: "شهر",
                        type: "nodes",
                        path: `${API}/auto/city`,
                        getOptionLabel: (node) =>
                          (node as ICity).name || (node as ICity)._id,
                        getOptionValue: (node) => (node as ICity)._id,
                        multi: false,
                        getDefaultValue: (inp) => inp.city,
                      },
                      district: {
                        title: "محله",
                        type: "nodes",
                        multi: false,
                        getOptionLabel: (node) =>
                          (node as IDistrict).name || (node as IDistrict)._id,
                        getOptionValue: (node) => (node as IDistrict)._id,
                        path: `${API}/auto/district`,
                        getDefaultValue: (inp) => inp.district,
                      },
                      image: { type: "image", title: "تصویر" },
                      tags: {
                        type: "nodes",
                        title: "تگ ها",
                        getOptionLabel: (node) =>
                          (node as IHospitalTag).name ||
                          (node as IHospitalTag)._id,
                        getOptionValue: (node) => (node as IHospitalTag)._id,
                        multi: true,
                        getDefaultValue: (inp) => inp.tags,
                        path: `${API}/auto/hospitalTag`,
                      },
                    }}
                    hookProps={{
                      path: `${API}/auto/hospital/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                  />
                ),
                id: "Details",
              },
              {
                title: "موقعیت",
                id: "Geo",
                content: (
                  <HospitalLocationManager node={data} mutate={mutate} />
                ),
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageHospitalPage;
