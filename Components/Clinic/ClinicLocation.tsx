import { useRef } from "react";
import useMap from "../Hooks/useMap";
import classes from "./ClinicLocation.module.css";
import { ClinicPageNode } from "./ClinicPage";
import MapMarker from "../UI/MapMarker";
import LocationIcon from "../Icons/LocationIcon";
import Ixon from "../UI/Ixon";
import useLocale from "../Hooks/useLocale";
import Button from "../UI/Button";
import SendIcon from "../Icons/SendIcon";
import { tbaseBold, tsmRegular } from "../UI/Typography";
import LocationSection from "./LocationSection";
const ClinicLocation = ({ node }: { node: ClinicPageNode }) => {
  return (
    <LocationSection
      coords={node.location?.coordinates}
      name={node.name}
      address={node.address}
    />
  );
};

export default ClinicLocation;
