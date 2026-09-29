import "maplibre-gl/dist/maplibre-gl.css";
import mlgl, { LngLat, LngLatBounds } from "maplibre-gl";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import useNotification from "./useNotification";
import { IPolygon } from "../Admin/Province/AdminManageProvincesPage";
import useScopedLocale from "./useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "mapPage"];

// Browser only, and never fatal: on the server (SSR) maplibre has no
// worker ("No actors found") and a blocked CDN must not take the page down.
if (typeof window !== "undefined")
  try {
    Promise.resolve(
      mlgl.setRTLTextPlugin(
        "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js",
        true,
      ),
    ).catch(() => {});
  } catch {
    // already set (hot reload) or unavailable
  }

export type UseMapProps = {
  containerRef: RefObject<HTMLDivElement>;
  center?: [number, number];
  onClick?: (e: LngLat) => void;
};

export type UseMapReturns = ReturnType<typeof useMap>;

const useMap = ({
  containerRef,
  center: initialCenter = [51.389, 35.689],
  onClick,
}: UseMapProps) => {
  const mapRef = useRef<mlgl.Map | null>(null);
  const [bounds, setBounds] = useState<mlgl.LngLatBounds | null>(null);
  const [center, setCenter] = useState<LngLat>(new LngLat(...initialCenter));
  const [zoom, setZoom] = useState<number>(13);

  const [ready, setReady] = useState<boolean>(false);

  const pushNotification = useNotification();
  const getContent = useScopedLocale(LOCALE_NS);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    //TODO: maybe put url in env
    const map = new mlgl.Map({
      container: containerRef.current,
      style: "https://map.noyanai.com/styles/custom/style.json",
      center: initialCenter,
      maxBounds: [
        [44.0, 24.0],
        [63.5, 40.0],
      ],
      zoom: 13,
      attributionControl: false,
    });
    mapRef.current = map;
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    setBounds(map.getBounds());
    setCenter(map.getCenter());
    setZoom(map.getZoom());
    map.on("moveend", () => {
      setBounds(map.getBounds());
      setCenter(map.getCenter());
      setZoom(map.getZoom());
    });
    map.on("click", (e) => {
      onClick?.(e.lngLat);
    });
    map.on("load", () => {
      setReady(true);
    });
  }, [containerRef, initialCenter, onClick]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setReady(false);
      }
    };
  }, []);

  const flyToMe = useCallback(
    async (_zoom: number = 17) => {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        const current = mapRef.current;
        if (!current)
          return pushNotification(getContent("mapIsNotReady"), "Warn");
        if (!navigator.geolocation)
          return pushNotification(
            getContent("yourDeviceNotSupportingGPS"),
            "Error",
          );
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            current.flyTo({
              center: [pos.coords.longitude, pos.coords.latitude],
              zoom: _zoom || zoom,
            });
            resolve(pos);
          },
          (err) => {
            console.log(err);
            pushNotification(
              getContent("somethingWentWrongAcquiringYourLocation"),
              "Error",
            );
            reject();
          },
          { enableHighAccuracy: true },
        );
      });
    },
    [getContent, pushNotification, zoom],
  );

  const flyTo = useCallback(
    (zoom: number = 17) => {
      const current = mapRef.current;
      if (!current)
        return pushNotification(getContent("mapIsNotReady"), "Warn");
      if (!navigator.geolocation)
        return pushNotification(
          getContent("yourDeviceNotSupportingGPS"),
          "Error",
        );
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          current.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom,
          });
        },
        (err) => {
          console.log(err);
          pushNotification(
            getContent("somethingWentWrongAcquiringYourLocation"),
            "Error",
          );
        },
        { enableHighAccuracy: true },
      );
    },
    [getContent, pushNotification],
  );

  const fitBounds = useCallback((polygon: IPolygon) => {
    const current = mapRef.current;
    if (!current) return;
    const bounds = new LngLatBounds();
    polygon.coordinates[0].forEach(([lng, lat]) => {
      bounds.extend([lng, lat]);
    });
    current.fitBounds(bounds);
  }, []);

  return {
    map: mapRef.current,
    bounds,
    center,
    flyToMe,
    ready,
    fitBounds,
    zoom,
  };
};

export default useMap;
