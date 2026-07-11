import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import classes from "./PharmacyBookingCard.module.css";

import CommonCenterCard from "./CommonCenterCard";
const PharmacyBookingCard = ({ node }: { node: IPharmacy }) => {
  return (
    <CommonCenterCard
      name={node.name || ""}
      avatar={node.avatar}
      nodeName="pharmacy"
      slug={node.slug || node._id}
      address={node.address}
      banner={node.banner}
      coords={node.location?.coordinates}
      summary={node.summary}
    />
  );
};

export default PharmacyBookingCard;
