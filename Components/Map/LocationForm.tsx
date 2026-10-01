"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./LocationForm.module.css";
import LocationPicker from "./LocationPicker";
import { asPoint } from "./PointPickerCore";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import AreaInput from "@/Components/UI/AreaInput";
import MultiSelectInputServer from "@/Components/UI/MultiSelectInputServer";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useForm from "@/Components/Hooks/useForm";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { locate } from "./nexamap";
import {
  ICity,
  IDistrict,
  IProvince,
} from "@/Components/Admin/Province/AdminManageProvincesPage";

const NS: ContentNamespace[] = ["common", "mapPage"];

type Division = { _id: string; name?: string };

// a populated ref is an object with an id; a bare id string or garbage is
// not something the selects can show
const asDivision = <T,>(value: unknown): T | undefined =>
  !!value &&
  typeof value === "object" &&
  typeof (value as Division)._id === "string"
    ? (value as T)
    : undefined;

export type LocatedEntity = {
  location?: { coordinates?: unknown } | null;
  address?: string | null;
  province?: unknown;
  city?: unknown;
  district?: unknown;
};

type LocationFormInput = {
  coords: [number, number];
  address: string;
  province: IProvince;
  city: ICity;
  district: IDistrict;
};

// The location tab of every panel (doctor, office, clinic, hospital, para
// clinic, pharmacy, insurance, the user's addresses): the map picker, the
// address text (filled from the chosen point when empty, or on "use this
// address") and, for centres, province / city / district, which follow the
// chosen point (our own boundaries, /public/resolveLocation) and stay
// editable. One form, so the nine tabs behave the same.
const LocationForm = ({
  path,
  entity,
  mutate,
  withDivisions = false,
  withAddress = true,
}: {
  // the profile / record endpoint that takes { location, address, ... }
  path: string;
  entity?: LocatedEntity | null;
  mutate?: () => unknown;
  withDivisions?: boolean;
  withAddress?: boolean;
}) => {
  const getContent = useScopedLocale(NS);

  const savedPoint = asPoint(entity?.location?.coordinates) || undefined;
  const savedAddress = typeof entity?.address === "string" ? entity.address : "";

  const { input, setInput, isLoading, submit } = useForm<LocationFormInput>({
    path,
    method: "POST",
    hasProblem: (inp) =>
      !inp.coords && !savedPoint && !inp.province && inp.address === undefined
        ? getContent("missingLocationErrorMessage")
        : undefined,
    mutator: (inp) => {
      const out: Record<string, unknown> = {};
      if (inp.coords) out.location = inp.coords;
      // an address is never cleared from here (the user's address requires one)
      if (withAddress && inp.address?.trim()) out.address = inp.address.trim();
      if (withDivisions) {
        if (inp.province) out.province = inp.province._id;
        if (inp.city) out.city = inp.city._id;
        if (inp.district) out.district = inp.district._id;
      }
      return out;
    },
    successCb: () => mutate?.(),
  });

  // the selects start from the saved divisions when they come populated
  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current || !entity || !withDivisions) return;
    initialised.current = true;
    setInput((prev) => ({
      ...prev,
      province: prev.province ?? asDivision<IProvince>(entity.province),
      city: prev.city ?? asDivision<ICity>(entity.city),
      district: prev.district ?? asDivision<IDistrict>(entity.district),
    }));
  }, [entity, withDivisions, setInput]);

  // the address box is uncontrolled: bumped when the map fills it
  const [addressVersion, setAddressVersion] = useState<number>(0);

  // a new point: province / city / district follow it (NexaMap through
  // /map/locate, our own boundaries when it's off), and an empty address
  // box gets the written address
  const coords = input.coords;
  useEffect(() => {
    if (!coords) return;
    let alive = true;
    locate({ lng: coords[0], lat: coords[1] })
      .then((found) => {
        if (!alive) return;
        if (withDivisions && found.province)
          setInput((prev) => ({
            ...prev,
            province: asDivision<IProvince>(found.province),
            city: asDivision<ICity>(found.city),
            district: asDivision<IDistrict>(found.district),
          }));
        if (withAddress && found.address)
          setInput((prev) => {
            if ((prev.address ?? savedAddress ?? "").trim()) return prev;
            setAddressVersion((v) => v + 1);
            return { ...prev, address: found.address || undefined };
          });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [coords, withDivisions, withAddress, savedAddress, setInput]);

  const currentAddress = input.address ?? savedAddress;

  return (
    <div className={classes.main}>
      <LocationPicker
        // the record may arrive after the first render (or change on save):
        // the map starts again from it
        key={savedPoint ? savedPoint.join(",") : "none"}
        defaultValue={savedPoint}
        onChange={(e) => setInput((prev) => ({ ...prev, coords: e }))}
        currentAddress={withAddress ? currentAddress : undefined}
        onUseAddress={
          withAddress
            ? (address) => {
                setInput((prev) => ({ ...prev, address }));
                setAddressVersion((v) => v + 1);
              }
            : undefined
        }
      />
      {withAddress && (
        <AreaInput
          key={addressVersion}
          title={getContent("address")}
          defaultValue={currentAddress}
          onChange={(e) => {
            const address = e.target.value;
            setInput((prev) => ({ ...prev, address }));
          }}
        />
      )}
      {withDivisions && (
        <div className={classes.divisions}>
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
        </div>
      )}
      <FormActions>
        <Button onClick={submit} isLoading={!!isLoading}>
          {getContent("submit")}
        </Button>
      </FormActions>
    </div>
  );
};

export default LocationForm;
