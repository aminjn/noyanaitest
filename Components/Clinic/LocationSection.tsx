import { useRef } from "react";
import useLocale from "../Hooks/useLocale";
import classes from "./LocationSection.module.css";
import useMap from "../Hooks/useMap";
import Ixon from "../UI/Ixon";
import LocationIcon from "../Icons/LocationIcon";
import { tbaseBold, tsmRegular } from "../UI/Typography";
import Button from "../UI/Button";
import SendIcon from "../Icons/SendIcon";
import MapMarker from "../UI/MapMarker";
import { WithStyleProps } from "../Layout/Layout";

const LocationSection = ({
  coords,
  address,
  name,
  className = "",
  style,
}: WithStyleProps<{
  coords?: [number, number];
  name?: string;
  address?: string;
}>) => {
  const getContent = useLocale();

  const mapRef = useRef<HTMLDivElement>(null);
  const { ready, map } = useMap({
    center: coords,
    containerRef: mapRef,
  });
  if (!coords) return null;
  return (
    <div className={`${classes.main} ${className}`} style={style} id="location">
      <div className={classes.header}>
        <div className={classes.iconBox}>
          <Ixon width="1rem">
            <LocationIcon />
          </Ixon>
        </div>
        <div className={classes.content}>
          <legend className={`${classes.legend} ${tsmRegular}`}>
            {getContent("locationOnMap")}
          </legend>
          <span className={`${classes.name} ${tbaseBold}`}>{name}</span>
        </div>
        <div className={classes.actions}>
          <Button
            tailIcon={<SendIcon />}
            variant="Primary"
            mode="Fill"
            size="S"
            radius="High"
          >
            {getContent("navigate")}
          </Button>
        </div>
      </div>
      <div className={classes.map} ref={mapRef}>
        {ready && (
          <MapMarker
            lat={coords[1]}
            lng={coords[0]}
            map={map}
            variant="active"
          />
        )}
      </div>
      {!!address && (
        <div className={classes.address}>
          <Ixon className={classes.icon} width=".75rem">
            <LocationIcon />
          </Ixon>
          <p>{address}</p>
        </div>
      )}
    </div>
  );
};

export default LocationSection;
