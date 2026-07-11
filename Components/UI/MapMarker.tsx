import classes from "./MapMarker.module.css";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import Ixon from "./Ixon";
import LocationIcon from "../Icons/LocationIcon";
import mlgl from "maplibre-gl";
import { WithStyleProps } from "../Layout/Layout";

const mapMarkerVariants = ["normal", "active", "doctor"] as const;

type MapMarkerVariant = (typeof mapMarkerVariants)[number];

const MapMarker = ({
  lat,
  lng,
  map,
  className,
  style,
  variant = "normal",
  tooltip,
}: WithStyleProps<{
  lat: number;
  lng: number;
  map: mlgl.Map | null;
  variant?: MapMarkerVariant;
  tooltip?: ReactNode;
}>) => {
  const markerRef = useRef<HTMLDivElement>(null);

  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    if (showTooltip) {
      const listener = () => setShowTooltip(false);
      setTimeout(() => document.addEventListener("click", listener, false));
      return () => document.removeEventListener("click", listener, false);
    }
  }, [showTooltip]);

  useEffect(() => {
    const markerElement = markerRef.current?.cloneNode(true) as HTMLElement;
    if (!markerElement || !map) return;
    const marker = new mlgl.Marker({ element: markerElement })
      .setLngLat([lng, lat])
      .addTo(map);
    const listener = () => {
      if (tooltip) setShowTooltip(true);
    };
    markerElement.addEventListener("click", listener, false);
    return () => {
      marker.remove();
      markerElement.removeEventListener("click", listener, false);
    };
  }, [lat, lng, map, tooltip]);

  return (
    <Fragment>
      <div style={{ display: "none" }}>
        <div
          ref={markerRef}
          className={`${classes.main} ${classes[variant]} ${className}`}
          style={style}
        >
          <Ixon width="2rem" className={classes.markerIcon}>
            <LocationIcon />
          </Ixon>
        </div>
      </div>
      {showTooltip && <div className={classes.tooltip}>{tooltip}</div>}
    </Fragment>
  );
};

export default MapMarker;
