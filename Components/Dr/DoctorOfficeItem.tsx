import { Fragment, ReactNode, useRef } from "react";
import { IOffice } from "../DoctorPanel/Office/DoctorManageOfficesPage";
import useMap from "../Hooks/useMap";
import classes from "./DoctorOfficeItem.module.css";
import MapMarker from "../UI/MapMarker";
import InfoPair from "./InfoPair";
import LinkIcon2 from "../Icons/LinkIcon2";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import HeadphoneIcon from "../Icons/HeadphoneIcon";
import LocationIcon from "../Icons/LocationIcon";

const NS: ContentNamespace[] = ["common", "drProfile"];

export const OfficeItemInner = ({
  items,
  coords,
}: {
  coords?: [number, number];
  items: { title: string; value?: string; icon: ReactNode; target?: string }[];
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { map, ready } = useMap({
    containerRef: mapRef,
    center: coords,
  });

  return (
    <li className={classes.main}>
      <div className={classes.details}>
        {items.map((item) => (
          <Fragment key={item.title}>
            {!!item.value ? (
              <InfoPair
                icon={item.icon}
                title={item.title}
                value={item.value}
                target={item.target}
              />
            ) : null}
          </Fragment>
        ))}
      </div>
      {coords && (
        <div className={classes.map} ref={mapRef}>
          {ready && (
            <MapMarker
              lng={coords[0]}
              lat={coords[1]}
              map={map}
              variant="active"
            />
          )}
        </div>
      )}
    </li>
  );
};

const DoctorOfficeItem = ({ office }: { office: IOffice }) => {
  const getContent = useScopedLocale(NS);

  return (
    <OfficeItemInner
      coords={office.location?.coordinates}
      items={[
        {
          icon: <LinkIcon2 />,
          title: getContent("officeName"),
          value: office.name,
        },
        {
          icon: <HeadphoneIcon />,
          title: getContent("officeTel"),
          value: office.tel,
        },
        {
          icon: <LocationIcon />,
          title: getContent("officeAddress"),
          value: office.address,
        },
      ]}
    />
  );
};

export default DoctorOfficeItem;
