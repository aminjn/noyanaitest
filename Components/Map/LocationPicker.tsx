"use client";

import { ReactNode } from "react";
import PointPickerCore, { AddressComponents } from "./PointPickerCore";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";

const NS: ContentNamespace[] = ["common", "mapPage"];

// The panels' location picker (doctor, office, clinic, hospital, para
// clinic, pharmacy, insurance, the user's addresses): the public
// counterpart of the admin PointPicker, same body (PointPickerCore), texts
// from the site's message files. Typed coordinates are hidden by default:
// search, a map click or "my location" pick the point.
const LocationPicker = ({
  defaultValue,
  onChange,
  onAddress,
  currentAddress,
  onUseAddress,
  showCoordinates = false,
  hint,
}: {
  // [lng, lat], GeoJSON order
  defaultValue?: [number, number];
  onChange?: (e: [number, number]) => unknown;
  onAddress?: (address: string, components: AddressComponents) => unknown;
  // with onUseAddress: fills an empty address, else offers "use this address"
  currentAddress?: string;
  onUseAddress?: (address: string, components: AddressComponents) => unknown;
  showCoordinates?: boolean;
  hint?: ReactNode;
}) => {
  const getContent = useScopedLocale(NS);
  const locale = useIntlLocale();
  return (
    <PointPickerCore
      defaultValue={defaultValue}
      onChange={onChange}
      onAddress={onAddress}
      currentAddress={currentAddress}
      onUseAddress={onUseAddress}
      showCoordinates={showCoordinates}
      hint={hint ?? getContent("mapPickerHint")}
      locale={locale}
      texts={{
        searchPlaceholder: getContent("mapSearchPlaceholder"),
        noResults: getContent("noResultFound"),
        searchError: getContent("mapSearchUnavailable"),
        myLocation: getContent("mapMyLocation"),
        locationError: getContent("somethingWentWrongAcquiringYourLocation"),
        locationUnsupported: getContent("yourDeviceNotSupportingGPS"),
        addressTitle: getContent("mapPointAddress"),
        addressLoading: getContent("mapFindingAddress"),
        addressUnavailable: getContent("mapAddressNotFound"),
        trafficZone: getContent("mapTrafficZone"),
        useThisAddress: getContent("mapUseThisAddress"),
        latitude: getContent("mapLatitude"),
        longitude: getContent("mapLongitude"),
      }}
    />
  );
};

export default LocationPicker;
