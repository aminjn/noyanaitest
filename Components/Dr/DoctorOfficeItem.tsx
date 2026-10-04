import { Fragment, ReactNode } from "react";
import { IOffice } from "../DoctorPanel/Office/DoctorManageOfficesPage";
import classes from "./DoctorOfficeItem.module.css";
import dynamic from "next/dynamic";

// the map library loads after the page, not before it
const PlaceLocationCard = dynamic(() => import("../Map/PlaceLocationCard"), { ssr: false });
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
  name,
  address,
}: {
  coords?: [number, number];
  // passed to the "how to get there" card (the address there is the
  // reverse-geocoded one only when the office has none)
  name?: string;
  address?: string;
  items: { title: string; value?: string; icon: ReactNode; target?: string }[];
}) => {

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
      {!!coords?.length && (
        <PlaceLocationCard
          className={classes.location}
          coords={coords}
          name={name}
          address={address}
        />
      )}
    </li>
  );
};

const DoctorOfficeItem = ({ office }: { office: IOffice }) => {
  const getContent = useScopedLocale(NS);

  return (
    <OfficeItemInner
      coords={office.location?.coordinates}
      name={office.name}
      address={office.address}
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
