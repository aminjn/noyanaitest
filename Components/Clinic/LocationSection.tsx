import classes from "./LocationSection.module.css";
import { WithStyleProps } from "../Layout/Layout";
import PlaceLocationCard from "../Map/PlaceLocationCard";

// The location block of the clinic / hospital / para-clinic / pharmacy /
// insurance pages: the shared "how to get there" card (map, address,
// traffic zone, parking, air quality, route from the visitor).
const LocationSection = ({
  coords,
  address,
  name,
  className = "",
  style,
}: WithStyleProps<{
  coords?: number[] | null;
  name?: string;
  address?: string;
}>) => (
  <PlaceLocationCard
    id="location"
    coords={coords}
    name={name}
    address={address}
    className={`${classes.main} ${className}`}
    style={style}
  />
);

export default LocationSection;
