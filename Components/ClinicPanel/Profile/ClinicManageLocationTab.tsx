"use client";

import PointPicker from "@/Components/Admin/UI/PointPicker";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useClinic from "@/Components/Hooks/useClinic";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import MultiSelectInputServer from "@/Components/UI/MultiSelectInputServer";
import {
  ICity,
  IDistrict,
  IProvince,
} from "@/Components/Admin/Province/AdminManageProvincesPage";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "clinicPanelProfile"];

type LocationFormInput = {
  coords: [number, number];
  province: IProvince;
  city: ICity;
  district: IDistrict;
};

const ClinicManageLocationTab = () => {
  const { clinic, mutate } = useClinic();

  const getContent = useScopedLocale(NS);

  const { input, setInput, isLoading, submit } = useForm<LocationFormInput>({
    path: `${API}/clinic/profile`,
    method: "POST",
    hasProblem: (inp) =>
      !inp.coords && !inp.province
        ? getContent("missingLocationErrorMessage")
        : undefined,
    mutator: (inp) => ({
      location: inp.coords,
      province: inp.province?._id,
      city: inp.city?._id,
      district: inp.district?._id,
    }),
    successCb: () => mutate(),
  });

  const selectedCoords = input.coords || clinic?.location?.coordinates;

  return (
    <div>
      <PointPicker
        defaultValue={clinic?.location?.coordinates}
        onChange={(e) => setInput((prev) => ({ ...prev, coords: e }))}
      />
      <MultiSelectInputServer<IProvince>
        multi={false}
        value={input.province ? [input.province] : []}
        placeholder={getContent("selectProvince")}
        path={`${API}/public/province`}
        getOption={(node) => ({
          title: node.name || node._id,
          value: node._id,
        })}
        onChange={(e) =>
          setInput((prev) => ({
            ...prev,
            province: e[0],
            city: undefined,
            district: undefined,
          }))
        }
      />
      {!!input.province && (
        <MultiSelectInputServer<ICity>
          multi={false}
          value={input.city ? [input.city] : []}
          placeholder={getContent("selectCity")}
          path={`${API}/public/city?province=${input.province._id}`}
          getOption={(node) => ({
            title: node.name || node._id,
            value: node._id,
          })}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, city: e[0], district: undefined }))
          }
        />
      )}
      {!!input.city && (
        <MultiSelectInputServer<IDistrict>
          multi={false}
          value={input.district ? [input.district] : []}
          placeholder={getContent("selectDistrict")}
          path={`${API}/public/district?city=${input.city._id}`}
          getOption={(node) => ({
            title: node.name || node._id,
            value: node._id,
          })}
          onChange={(e) => setInput((prev) => ({ ...prev, district: e[0] }))}
        />
      )}
      <FormActions>
        <Button onClick={submit} isLoading={isLoading}>
          {getContent("submit")}
        </Button>
      </FormActions>
    </div>
  );
};

export default ClinicManageLocationTab;
