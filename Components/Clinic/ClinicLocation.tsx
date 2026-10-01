import { ClinicPageNode } from "./ClinicPage";
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
