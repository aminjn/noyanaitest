"use client";
import { cityPath, districtPath } from "@/Components/Admin/UI/geoPaths";
import EntityOverview from "../UI/EntityOverview";
import useUser from "@/Components/Hooks/useUser";
import DashboardIcon from "@/Components/Icons/DashboardIcon";

import { API } from "@/Components/config";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { fetcher } from "@/Components/helpers/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";
import classes from "./AdminManagePharmacyPage.module.css";
import { Fragment, useRef } from "react";
import useForm from "@/Components/Hooks/useForm";
import useMap from "@/Components/Hooks/useMap";
import MapMarker from "@/Components/UI/MapMarker";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import {
  ICity,
  IDistrict,
  IProvince,
} from "../Province/AdminManageProvincesPage";
import WalletIcon from "@/Components/Icons/WalletIcon";
import PharmacyCommissionTab from "./PharmacyCommissionTab";
import PharmacyTaxTab from "./PharmacyTaxTab";
import PharmacyProfileLicenseTab from "./PharmacyProfileLicenseTab";
import CartIcon from "@/Components/Icons/CartIcon";
import { ta } from "@/Components/Admin/i18n/adminText";

const PharmacyLocationTab = ({
  mutate,
  node,
}: {
  node: IPharmacy;
  mutate: () => unknown;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const { input, setInput, isLoading, submit } = useForm<{
    lat: number;
    lng: number;
  }>({
    path: `${API}/auto/pharmacy/${node._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
    mutator: (inp) => {
      if (inp.lat && inp.lng)
        return { location: { type: "Point", coordinates: [inp.lng, inp.lat] } };
      return inp;
    },
  });

  const { map, ready } = useMap({
    containerRef: mapRef,
    onClick: (e) => setInput((prev) => ({ ...prev, lat: e.lat, lng: e.lng })),
    center:
      node.location?.coordinates?.length === 2
        ? node.location.coordinates
        : undefined,
  });

  return (
    <div className={classes.main}>
      <div className={classes.map} ref={mapRef}>
        {ready && (
          <Fragment>
            {node.location?.coordinates?.length === 2 && (
              <MapMarker
                lat={node.location.coordinates[1]}
                lng={node.location.coordinates[0]}
                map={map}
                variant="active"
              />
            )}
            {input.lat && input.lng && (
              <MapMarker lat={input.lat} lng={input.lng} map={map} />
            )}
          </Fragment>
        )}
      </div>
      <FormActions>
        <Button isLoading={isLoading} onClick={submit}>
          {ta("تایید")}
        </Button>
      </FormActions>
    </div>
  );
};

const AdminManagePharmacyPage = () => {
  const params = useParams<{ nodeId: string }>();
  // Entity 360 tab (its endpoint is full-admin only)
  const isAdmin = useUser(true).user?.role === "admin";
  const { data, error, mutate } = useSWR<IPharmacy>(
    params ? `${API}/auto/pharmacy/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  console.log(data);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManagePharmacy"
            items={[
              ...(isAdmin
                ? [
                    {
                      id: "Overview",
                      title: ta("نمای کلی"),
                      content: (
                        <EntityOverview
                          kind="pharmacy"
                          nodeId={params?.nodeId || ""}
                        />
                      ),
                      icon: <DashboardIcon />,
                    },
                  ]
                : []),
              {
                title: ta("جزئیات"),
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    defaultValue={data}
                    hookProps={{
                      path: `${API}/auto/pharmacy/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                    renderer={{
                      name: { title: ta("نام"), type: "text" },
                      active: { type: "bool", title: ta("فعال") },
                      order: { type: "number", title: ta("رتبه") },
                      province: {
                        title: ta("استان"),
                        type: "nodes",
                        path: `${API}/auto/province`,
                        getOptionLabel: (node) =>
                          (node as IProvince).name || (node as IProvince)._id,
                        getOptionValue: (node) => (node as IProvince)._id,
                        multi: false,
                        getDefaultValue: (inp) => inp.province,
                      },
                      city: {
                        title: ta("شهر"),
                        type: "nodes",
                        getOptionLabel: (node) =>
                          (node as ICity).name || (node as ICity)._id,
                        getOptionValue: (node) => (node as ICity)._id,
                        getDefaultValue: (inp) => inp.city,
                        multi: false,
                        path: cityPath,
                      },
                      district: {
                        title: ta("محله"),
                        getOptionLabel: (node) =>
                          (node as IDistrict).name || (node as IDistrict)._id,
                        type: "nodes",
                        getOptionValue: (node) => (node as IDistrict)._id,
                        getDefaultValue: (inp) => inp.district,
                        multi: false,
                        path: districtPath,
                      },
                    }}
                  />
                ),
              },
              {
                title: ta("لوکیشن"),
                content: <PharmacyLocationTab node={data} mutate={mutate} />,
                id: "Location",
              },
              {
                title: ta("کمیسیون"),
                id: "Commission",
                icon: <WalletIcon />,
                content: <PharmacyCommissionTab node={data} />,
              },
              {
                title: ta("مالیات"),
                id: "Tax",
                icon: <WalletIcon />,
                content: <PharmacyTaxTab node={data} />,
              },
              {
                title: ta("مجوز"),
                id: "License",
                icon: <CartIcon />,
                content: <PharmacyProfileLicenseTab node={data} />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManagePharmacyPage;
