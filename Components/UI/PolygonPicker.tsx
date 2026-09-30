import { useEffect, useRef, useState } from "react";
import useMap from "../Hooks/useMap";
import classes from "./PolygonPicker.module.css";
import {
  TerraDraw,
  TerraDrawCircleMode,
  TerraDrawSelectMode,
  ValidateNotSelfIntersecting,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { TerraDrawPolygonMode } from "terra-draw";
import Button from "./Button";
import { IPolygon } from "../Admin/Province/AdminManageProvincesPage";
import useNotification from "../Hooks/useNotification";
import { ta } from "@/Components/Admin/i18n/adminText";

const drawModes = ["select", "polygon"] as const;

type DrawMode = (typeof drawModes)[number];

const drawModeDict: Record<DrawMode, string> = {
  get polygon() {
  return ta("پلیگان");
},
  get select() {
  return ta("سلکت");
},
};

const PolygonPicker = ({
  defaultValue,
  onSubmit,
  isLoading,
}: {
  onSubmit?: (e: IPolygon["coordinates"]) => unknown;
  defaultValue?: IPolygon["coordinates"];
  isLoading?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<DrawMode | null>(null);
  const { map, ready } = useMap({ containerRef });
  const [draw, setDraw] = useState<TerraDraw | null>(null);

  const pushNotification = useNotification();

  useEffect(() => {
    if (!map || !ready || !!draw) return;
    const terra = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({
        map,
      }),
      modes: [
        new TerraDrawPolygonMode({
          editable: true,
          showCoordinatePoints: true,
          projection: "web-mercator",
          validation: (features) => {
            return ValidateNotSelfIntersecting(features);
          },
        }),
        new TerraDrawSelectMode({
          projection: "web-mercator",
          flags: {
            polygon: {
              feature: {
                draggable: true,
                selfIntersectable: false,
                coordinates: {
                  midpoints: true,
                  snappable: true,
                  draggable: true,
                  deletable: true,
                },
              },
            },
          },
        }),
      ],
    });
    terra.start();
    if (defaultValue) {
      terra.addFeatures([
        {
          type: "Feature",
          properties: { mode: "polygon" },
          geometry: { type: "Polygon", coordinates: defaultValue },
        },
      ]);
    }
    terra.on("finish", (id) => {
      const features = terra.getSnapshot();
      const polygons = features.filter((el) => el.geometry.type === "Polygon");
      if (polygons.length > 1) {
        const olds = polygons
          .filter((el) => el.id !== id)
          .map((el) => String(el.id));
        terra.removeFeatures(olds);
      }
    });
    setDraw(terra);
  }, [map, ready, defaultValue, draw]);

  return (
    <div className={classes.container}>
      {ready && (
        <div className={classes.toolbar}>
          <div className={classes.controls}>
            {drawModes.map((m) => (
              <Button
                key={m}
                onClick={() => {
                  if (!draw) return;
                  draw.setMode(mode === m ? "static" : m);
                  setMode((prev) => (prev === m ? null : m));
                }}
                variant={m === mode ? "Primary" : "Neutral"}
              >
                {drawModeDict[m]}
              </Button>
            ))}
            <Button
              variant="Error"
              onClick={() => {
                if (!draw) return;
                draw.clear();
              }}
            >
              {ta("از اول")}
            </Button>
          </div>
          {!!onSubmit && (
            <Button
              isLoading={isLoading}
              variant="Success"
              onClick={() => {
                if (!draw || isLoading) return;
                const snap = draw.getSnapshot();
                const polys = snap.filter(
                  (el) => el.geometry.type === "Polygon",
                );
                if (polys.length > 1)
                  return pushNotification(ta("فقط یک پلیگان مجاز است"), "Warn");
                const poly = polys[0];
                if (!poly)
                  return pushNotification(ta("حداقل یک پلیگان بکشید"), "Warn");
                onSubmit(poly.geometry.coordinates as IPolygon["coordinates"]);
              }}
            >
              {ta("ذخیره")}
            </Button>
          )}
        </div>
      )}
      <div className={classes.main} ref={containerRef} />
    </div>
  );
};

export default PolygonPicker;
