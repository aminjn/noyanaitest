"use client";

import classes from "./DoctorManageLocationTab.module.css";
import PointPicker from "@/Components/Admin/UI/PointPicker";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import useLocale from "@/Components/Hooks/useLocale";
import useDoctor from "@/Components/Hooks/useDoctor";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import MultiSelectInputServer from "@/Components/UI/MultiSelectInputServer";
import {
  ICity,
  IDistrict,
  IProvince,
} from "@/Components/Admin/Province/AdminManageProvincesPage";
import useSWR from "swr";
import { fetcher } from "@/Components/helpers/fetcher";

type LocationFormInput = {
  coords: [number, number];
  province: IProvince;
  city: ICity;
  district: IDistrict;
};

const DoctorManageLocationTab = () => {
  const { doctor, mutate } = useDoctor();

  const getContent = useLocale();

  const { input, setInput, isLoading, submit } = useForm<LocationFormInput>({
    path: `${API}/doctor/profile`,
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

  const selectedCoords = input.coords || doctor?.location?.coordinates;

  const { data: geo } = useSWR<{
    district: IDistrict | null;
    city: ICity | null;
    province: IProvince | null;
  }>(
    selectedCoords
      ? `${API}/public/resolveLocation?lat=${selectedCoords[1]}&lng=${selectedCoords[0]}`
      : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    {
      keepPreviousData: true,
    },
  );

  return (
    <div className={classes.container}>
      {!!geo && (
        <div className={classes.resolved}>
          {[geo.province, geo.city, geo.district]
            .filter((el) => !!el)
            .map((el) => el!.name)
            .join(" - ")}
        </div>
      )}
      <PointPicker
        defaultValue={doctor?.location?.coordinates}
        onChange={(e) => setInput((prev) => ({ ...prev, coords: e }))}
      />
      <div className={classes.geoSelects}>
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
              setInput((prev) => ({
                ...prev,
                city: e[0],
                district: undefined,
              }))
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
            onChange={(e) =>
              setInput((prev) => ({ ...prev, district: e[0] }))
            }
          />
        )}
      </div>
      <FormActions>
        <Button onClick={submit} isLoading={isLoading}>
          {getContent("submit")}
        </Button>
      </FormActions>
    </div>
  );
};

export default DoctorManageLocationTab;
