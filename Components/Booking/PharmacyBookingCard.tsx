import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import classes from "./PharmacyBookingCard.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import usePopup from "../Hooks/usePopup";
import { BookingView } from "./BookingPage2";
import CommonCenterCard from "./CommonCenterCard";

const NS: ContentNamespace[] = ["common", "booking"];

const PharmacyBookingCard = ({
  node,
  view,
}: {
  node: IPharmacy;
  view: BookingView;
}) => {
  const getContent = useScopedLocale(NS);

  const getCompContent = getContent;

  const { setPopup } = usePopup();

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
      view={view}
      openStatus={node.openStatus}
    />
  );
};

export default PharmacyBookingCard;
