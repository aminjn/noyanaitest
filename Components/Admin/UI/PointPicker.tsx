import { Fragment, useRef, useState } from "react";
import classes from "./PointPicker.module.css";
import useMap from "@/Components/Hooks/useMap";
import MapMarker from "@/Components/UI/MapMarker";
import Input from "@/Components/UI/Input";
import { ta } from "@/Components/Admin/i18n/adminText";

// A stored point may be missing, `[]` or garbage (an old record): only a
// real [lng, lat] pair counts as a value.
const asPoint = (value?: unknown): [number, number] | null =>
  Array.isArray(value) &&
  value.length === 2 &&
  value.every((n) => typeof n === "number" && Number.isFinite(n))
    ? [value[0], value[1]]
    : null;

// The one location picker of the admin panel (clinic, hospital, para
// clinic, pharmacy, insurance...): a click on the map or typed
// coordinates. The map container always has a height, and the inputs work
// even when the map tiles can't be loaded.
const PointPicker = ({
  defaultValue,
  onChange,
}: {
  // [lng, lat], GeoJSON order
  defaultValue?: [number, number];
  onChange?: (e: [number, number]) => unknown;
}) => {
  const saved = asPoint(defaultValue);
  const [value, setValue] = useState<[number, number] | null>(saved);
  // bumped on a map click so the (uncontrolled) inputs show the new point;
  // typing doesn't bump it, so the field keeps its focus
  const [clickVersion, setClickVersion] = useState<number>(0);

  const mapRef = useRef<HTMLDivElement>(null);

  const { map, ready } = useMap({
    containerRef: mapRef,
    onClick: (e) => {
      const next: [number, number] = [e.lng, e.lat];
      onChange?.(next);
      setValue(next);
      setClickVersion((v) => v + 1);
    },
    center: saved || undefined,
  });

  const setPart = (index: 0 | 1, raw: string) => {
    const n = Number(raw);
    if (!raw.trim() || !Number.isFinite(n)) return;
    const base: [number, number] = value ? [...value] : [NaN, NaN];
    base[index] = n;
    setValue(base);
    if (Number.isFinite(base[0]) && Number.isFinite(base[1])) {
      onChange?.(base);
      map?.easeTo({ center: base });
    }
  };

  const complete = !!value && value.every((n) => Number.isFinite(n));

  return (
    <div className={classes.main}>
      <p className={classes.hint}>
        {saved
          ? ta("روی نقشه کلیک کنید یا مختصات را وارد کنید، سپس تایید را بزنید.")
          : ta("هنوز موقعیتی ثبت نشده است. روی نقشه کلیک کنید یا مختصات را وارد کنید.")}
      </p>
      <div className={classes.coords} key={clickVersion}>
        <Input
          title={ta("عرض جغرافیایی")}
          type="number"
          step={0.000001}
          inputMode="decimal"
          defaultValue={value && Number.isFinite(value[1]) ? `${value[1]}` : ""}
          onChange={(e) => setPart(1, e.target.value)}
        />
        <Input
          title={ta("طول جغرافیایی")}
          type="number"
          step={0.000001}
          inputMode="decimal"
          defaultValue={value && Number.isFinite(value[0]) ? `${value[0]}` : ""}
          onChange={(e) => setPart(0, e.target.value)}
        />
      </div>
      <div className={classes.map} ref={mapRef}>
        {ready && (
          <Fragment>
            {saved && (
              <MapMarker
                lat={saved[1]}
                lng={saved[0]}
                map={map}
                variant="active"
              />
            )}
            {complete && value && (value[0] !== saved?.[0] || value[1] !== saved?.[1]) && (
              <MapMarker lat={value[1]} lng={value[0]} map={map} />
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default PointPicker;
