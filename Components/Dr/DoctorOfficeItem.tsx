import { useRef } from "react";
import { IOffice } from "../DoctorPanel/Office/DoctorManageOfficesPage";
import useMap from "../Hooks/useMap";
import classes from "./DoctorOfficeItem.module.css";
import MapMarker from "../UI/MapMarker";
import InfoPair from "./InfoPair";
import LinkIcon2 from "../Icons/LinkIcon2";
import useLocale from "../Hooks/useLocale";
import HeadphoneIcon from "../Icons/HeadphoneIcon";
import LocationIcon from "../Icons/LocationIcon";

const DoctorOfficeItem = ({ office }: { office: IOffice }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { map, ready } = useMap({
    containerRef: mapRef,
    center: office.location?.coordinates,
  });

  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.details}>
        {!!office.name && (
          <InfoPair
            icon={<LinkIcon2 />}
            title={getContent("officeName")}
            value={office.name}
          />
        )}
        {!!office.tel && (
          <InfoPair
            icon={<HeadphoneIcon />}
            title={getContent("officeTel")}
            value={office.tel}
          />
        )}
        {!!office.address && (
          <InfoPair
            icon={<LocationIcon />}
            title={getContent("officeAddress")}
            value={office.address}
          />
        )}
      </div>
      {office.location?.coordinates && (
        <div className={classes.map} ref={mapRef}>
          {ready && (
            <MapMarker
              lng={office.location.coordinates[0]}
              lat={office.location.coordinates[1]}
              map={map}
              variant="active"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorOfficeItem;
