"use client";

import { Fragment, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import classes from "./PointPickerCore.module.css";
import useMap from "@/Components/Hooks/useMap";
import MapMarker from "@/Components/UI/MapMarker";
import Input from "@/Components/UI/Input";
import Button from "@/Components/UI/Button";
import Ixon from "@/Components/UI/Ixon";
import LocationIcon from "@/Components/Icons/LocationIcon";
import PlaceSearch, { PlacePick } from "./PlaceSearch";
import { getMapConfig, LatLng, reverseGeocode, ReverseResult } from "./nexamap";
import { asPoint } from "./point";

export { asPoint };

// Every text of the picker, already translated: the admin PointPicker hands
// ta() texts, the panels' LocationPicker hands getContent() texts.
export type PointPickerTexts = {
  searchPlaceholder: string;
  noResults: string;
  searchError: string;
  myLocation: string;
  locationError: string;
  locationUnsupported: string;
  addressTitle: string;
  addressLoading: string;
  addressUnavailable: string;
  trafficZone: string;
  useThisAddress: string;
  latitude: string;
  longitude: string;
};

export type AddressComponents = Record<string, string>;

const REVERSE_DEBOUNCE_MS = 350;

// The body of both location pickers: place search, the map (a click sets
// the point), "my location", optional typed coordinates, and the address of
// the chosen point (NexaMap reverse geocode) with its traffic-zone chip. A
// parent form can take that address (onAddress / onUseAddress). Works with
// the map provider off: the map falls back to a plain layer, search and the
// address line simply don't show.
const PointPickerCore = ({
  defaultValue,
  onChange,
  onAddress,
  currentAddress,
  onUseAddress,
  showCoordinates = true,
  compact = false,
  hint,
  texts,
  locale,
}: {
  // [lng, lat], GeoJSON order
  defaultValue?: [number, number];
  onChange?: (e: [number, number]) => unknown;
  // the address of a point the user just chose (not of the saved one)
  onAddress?: (address: string, components: AddressComponents) => unknown;
  // the entity's address text: when empty, a chosen point's address fills
  // it; otherwise a "use this address" button offers to replace it
  currentAddress?: string;
  onUseAddress?: (address: string, components: AddressComponents) => unknown;
  showCoordinates?: boolean;
  // a shorter map, inside a popup form
  compact?: boolean;
  hint?: ReactNode;
  texts: PointPickerTexts;
  locale?: string;
}) => {
  const saved = asPoint(defaultValue);
  const [value, setValue] = useState<[number, number] | null>(saved);
  // bumped on a non-typed change so the (uncontrolled) inputs show the new
  // point; typing doesn't bump it, so the field keeps its focus
  const [version, setVersion] = useState<number>(0);
  // a point the user chose (map, search, GPS, typing) vs. the saved one
  const [touched, setTouched] = useState<boolean>(false);
  const [reverseOn, setReverseOn] = useState<boolean>(false);
  const [address, setAddress] = useState<ReverseResult | null>(null);
  const [addressState, setAddressState] = useState<"idle" | "loading" | "error">("idle");
  const [locating, setLocating] = useState<boolean>(false);
  const [locateError, setLocateError] = useState<string>("");

  const mapRef = useRef<HTMLDivElement>(null);

  const select = useCallback(
    (next: [number, number]) => {
      onChange?.(next);
      setValue(next);
      setTouched(true);
      setVersion((v) => v + 1);
    },
    [onChange],
  );

  const { map, ready, center } = useMap({
    containerRef: mapRef,
    onClick: (e) => select([e.lng, e.lat]),
    center: saved || undefined,
  });

  const flyTo = useCallback(
    (point: [number, number]) => {
      if (!map) return;
      map.flyTo({ center: point, zoom: Math.max(map.getZoom(), 16) });
    },
    [map],
  );

  useEffect(() => {
    let alive = true;
    getMapConfig().then((config) => {
      if (alive) setReverseOn(!!config?.enabled && config.features?.reverse !== false);
    });
    return () => {
      alive = false;
    };
  }, []);

  // the address of the current point (debounced, latest wins)
  const complete = !!value && value.every((n) => Number.isFinite(n));
  const lng = complete ? value![0] : NaN;
  const lat = complete ? value![1] : NaN;
  const onAddressRef = useRef(onAddress);
  onAddressRef.current = onAddress;
  const onUseAddressRef = useRef(onUseAddress);
  onUseAddressRef.current = onUseAddress;
  const currentAddressRef = useRef(currentAddress);
  currentAddressRef.current = currentAddress;
  useEffect(() => {
    if (!reverseOn || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    let alive = true;
    setAddressState("loading");
    const timer = setTimeout(() => {
      reverseGeocode({ lat, lng })
        .then((result) => {
          if (!alive) return;
          setAddress(result);
          setAddressState("idle");
          const text = result?.formatted_address?.trim();
          if (!text || !touched) return;
          const components = result?.components || {};
          onAddressRef.current?.(text, components);
          // an empty address field is filled right away
          if (!currentAddressRef.current?.trim())
            onUseAddressRef.current?.(text, components);
        })
        .catch(() => {
          if (!alive) return;
          setAddress(null);
          setAddressState("error");
        });
    }, REVERSE_DEBOUNCE_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [reverseOn, lat, lng, touched]);

  const locate = () => {
    setLocateError("");
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocateError(texts.locationUnsupported);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const next: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        select(next);
        flyTo(next);
      },
      () => {
        setLocating(false);
        setLocateError(texts.locationError);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const onPick = ({ location }: PlacePick) => {
    const next: [number, number] = [location.lng, location.lat];
    select(next);
    flyTo(next);
  };

  const setPart = (index: 0 | 1, raw: string) => {
    const n = Number(raw);
    if (!raw.trim() || !Number.isFinite(n)) return;
    const base: [number, number] = value ? [...value] : [NaN, NaN];
    base[index] = n;
    setValue(base);
    if (Number.isFinite(base[0]) && Number.isFinite(base[1])) {
      onChange?.(base);
      setTouched(true);
      map?.easeTo({ center: base });
    }
  };

  const near: LatLng | null = complete
    ? { lat, lng }
    : center
      ? { lat: center.lat, lng: center.lng }
      : null;

  const addressText = address?.formatted_address?.trim() || "";
  const zone = address?.extras?.in_traffic_zone;
  const canUse =
    !!onUseAddress &&
    !!addressText &&
    addressText !== (currentAddress || "").trim();

  return (
    <div className={`${classes.main} ${compact ? classes.compact : ""}`}>
      {!!hint && <p className={classes.hint}>{hint}</p>}
      <div className={classes.searchRow}>
        <div className={classes.search}>
          <PlaceSearch
            onPick={onPick}
            near={near}
            placeholder={texts.searchPlaceholder}
            noResults={texts.noResults}
            errorText={texts.searchError}
            locale={locale}
          />
        </div>
        <Button
          variant="Neutral"
          mode="Outline"
          onClick={locate}
          isLoading={locating}
          leadIcon={<LocationIcon />}
          ariaLabel={texts.myLocation}
          className={classes.locate}
        >
          <span className={classes.locateText}>{texts.myLocation}</span>
        </Button>
      </div>
      {!!locateError && (
        <p className={classes.error} role="alert">
          {locateError}
        </p>
      )}
      {showCoordinates && (
        <div className={classes.coords} key={version}>
          <Input
            title={texts.latitude}
            type="number"
            step={0.000001}
            inputMode="decimal"
            defaultValue={value && Number.isFinite(value[1]) ? `${value[1]}` : ""}
            onChange={(e) => setPart(1, e.target.value)}
          />
          <Input
            title={texts.longitude}
            type="number"
            step={0.000001}
            inputMode="decimal"
            defaultValue={value && Number.isFinite(value[0]) ? `${value[0]}` : ""}
            onChange={(e) => setPart(0, e.target.value)}
          />
        </div>
      )}
      <div className={classes.map} ref={mapRef}>
        {ready && (
          <Fragment>
            {saved && (
              <MapMarker lat={saved[1]} lng={saved[0]} map={map} variant="active" />
            )}
            {complete && value && (value[0] !== saved?.[0] || value[1] !== saved?.[1]) && (
              <MapMarker lat={value[1]} lng={value[0]} map={map} />
            )}
          </Fragment>
        )}
      </div>
      {reverseOn && complete && (
        <div className={classes.address} aria-live="polite">
          <span className={classes.addressIcon} aria-hidden>
            <Ixon width="1.25rem">
              <LocationIcon />
            </Ixon>
          </span>
          <div className={classes.addressBody}>
            <span className={classes.addressTitle}>{texts.addressTitle}</span>
            <span className={classes.addressText}>
              {addressState === "loading"
                ? texts.addressLoading
                : addressText || texts.addressUnavailable}
            </span>
            {!!zone && addressState !== "loading" && (
              <span className={classes.zone}>
                {texts.trafficZone}: {zone}
              </span>
            )}
          </div>
          {canUse && addressState !== "loading" && (
            <Button
              size="S"
              mode="Outline"
              variant="Primary"
              onClick={() => onUseAddress?.(addressText, address?.components || {})}
              className={classes.use}
            >
              {texts.useThisAddress}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PointPickerCore;
