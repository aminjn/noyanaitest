import "maplibre-gl/dist/maplibre-gl.css";
import mlgl, { LngLat } from "maplibre-gl";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import useNotification from "./useNotification";
import useLocale from "./useLocale";

mlgl.setRTLTextPlugin(
  "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js",
  true
);

const useMap = ({
  containerRef,
  center: initialCenter = [51.389, 35.689],
  onClick,
}: {
  containerRef: RefObject<HTMLDivElement>;
  center?: [number, number];
  onClick?: (e: LngLat) => void;
}) => {
  const mapRef = useRef<mlgl.Map | null>(null);
  const [bounds, setBounds] = useState<mlgl.LngLatBounds | null>(null);
  const [center, setCenter] = useState<LngLat>(new LngLat(...initialCenter));
  const [zoom, setZoom] = useState<number>(13);

  const [ready, setReady] = useState<boolean>(false);

  const pushNotification = useNotification();
  const getContent = useLocale();

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
    setReady(true);
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
    (_zoom: number = 17) => {
      const current = mapRef.current;
      if (!current)
        return pushNotification(getContent("mapIsNotReady"), "Warn");
      if (!navigator.geolocation)
        return pushNotification(
          getContent("yourDeviceNotSupportingGPS"),
          "Error"
        );
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          current.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: _zoom || zoom,
          });
        },
        (err) => {
          console.log(err);
          pushNotification(
            getContent("somethingWentWrongAcquiringYourLocation"),
            "Error"
          );
        },
        { enableHighAccuracy: true }
      );
    },
    [getContent, pushNotification, zoom]
  );

  const flyTo = useCallback(
    (zoom: number = 17) => {
      const current = mapRef.current;
      if (!current)
        return pushNotification(getContent("mapIsNotReady"), "Warn");
      if (!navigator.geolocation)
        return pushNotification(
          getContent("yourDeviceNotSupportingGPS"),
          "Error"
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
            "Error"
          );
        },
        { enableHighAccuracy: true }
      );
    },
    [getContent, pushNotification]
  );

  return { map: mapRef.current, bounds, center, flyToMe, ready };
};

export default useMap;
