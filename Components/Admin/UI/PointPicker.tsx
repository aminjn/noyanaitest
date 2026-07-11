import { Fragment, useRef, useState } from "react";
import classes from "./PointPicker.module.css";
import useMap from "@/Components/Hooks/useMap";
import MapMarker from "@/Components/UI/MapMarker";
const PointPicker = ({
  defaultValue,
  onChange,
}: {
  defaultValue?: [number, number];
  onChange?: (e: [number, number]) => unknown;
}) => {
  const [value, setValue] = useState<[number, number] | null>(
    defaultValue || null,
  );

  const mapRef = useRef<HTMLDivElement>(null);

  const { map, ready } = useMap({
    containerRef: mapRef,
    onClick: (e) => {
      onChange?.([e.lng, e.lat]);
      setValue([e.lng, e.lat]);
    },
    center: defaultValue,
  });

  return (
    <div className={classes.main}>
      <div className={classes.map} ref={mapRef}>
        {ready && (
          <Fragment>
            {defaultValue && (
              <MapMarker
                lat={defaultValue[1]}
                lng={defaultValue[0]}
                map={map}
                variant="active"
              />
            )}
            {value && <MapMarker lat={value[1]} lng={value[0]} map={map} />}
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default PointPicker;
